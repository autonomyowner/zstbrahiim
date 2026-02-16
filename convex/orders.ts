import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { orderStatusValidator, paymentStatusValidator } from "./schema";

async function getNextOrderNumber(ctx: any): Promise<string> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_name", (q: any) => q.eq("name", "order_number"))
    .first();

  let nextValue: number;
  if (counter) {
    nextValue = counter.value + 1;
    await ctx.db.patch(counter._id, { value: nextValue });
  } else {
    nextValue = 1001;
    await ctx.db.insert("counters", { name: "order_number", value: nextValue });
  }

  return `ZST-${String(nextValue).padStart(6, "0")}`;
}

async function getOrderWithItems(ctx: any, order: any) {
  const items = await ctx.db
    .query("orderItems")
    .withIndex("by_orderId", (q: any) => q.eq("orderId", order._id))
    .collect();

  return {
    ...order,
    id: order._id,
    orderNumber: order.orderNumber,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      wilaya: order.customerWilaya,
    },
    items: items.map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    })),
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
    deliveryDate: order.deliveryDate,
    trackingNumber: order.trackingNumber,
    notes: order.notes,
  };
}

export const createOrderFromCheckout = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    totalPrice: v.number(),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.string(),
    shippingWilaya: v.string(),
    shippingBaladia: v.string(),
    shippingAddress: v.string(),
    deliveryType: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Fetch product details including seller_id
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    // Get primary image
    const images = await ctx.db
      .query("productImages")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();
    const primaryImage = images.sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl || "";

    const orderNumber = await getNextOrderNumber(ctx);
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId: user?._id,
      sellerId: product.sellerId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      customerAddress: args.shippingAddress,
      customerWilaya: args.shippingWilaya,
      total: args.totalPrice,
      status: "pending",
      paymentStatus: "pending",
      notes: `Baladia: ${args.shippingBaladia}, Type: ${args.deliveryType}`,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("orderItems", {
      orderId,
      productId: args.productId,
      productName: product.name,
      productImage: primaryImage,
      quantity: args.quantity,
      price: args.totalPrice / args.quantity,
      subtotal: args.totalPrice,
      createdAt: now,
    });

    return orderId;
  },
});

export const getOrdersForSeller = query({
  args: { sellerId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();

    return await Promise.all(orders.map((order) => getOrderWithItems(ctx, order)));
  },
});

export const getOrdersForCustomer = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(orders.map((order) => getOrderWithItems(ctx, order)));
  },
});

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    return await getOrderWithItems(ctx, order);
  },
});

export const getOrderByNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
    if (!order) return null;
    return await getOrderWithItems(ctx, order);
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: orderStatusValidator,
    trackingNumber: v.optional(v.string()),
    deliveryDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.sellerId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.trackingNumber) updates.trackingNumber = args.trackingNumber;
    if (args.deliveryDate) updates.deliveryDate = args.deliveryDate;
    if (args.notes) updates.notes = args.notes;

    await ctx.db.patch(args.orderId, updates);
    return true;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    orderId: v.id("orders"),
    paymentStatus: paymentStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(args.orderId, {
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const getPendingOrderCount = query({
  args: { sellerId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_sellerId_status", (q) =>
        q.eq("sellerId", args.sellerId).eq("status", "pending")
      )
      .collect();
    return pendingOrders.length;
  },
});

export const getSellerDashboardStats = query({
  args: {
    sellerId: v.id("userProfiles"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .collect();

    // Current range orders
    const currentOrders = allOrders.filter(
      (o) => o.createdAt >= args.startDate && o.createdAt <= args.endDate
    );

    // Previous range (same duration before startDate)
    const rangeDuration = args.endDate - args.startDate;
    const prevStart = args.startDate - rangeDuration;
    const prevEnd = args.startDate - 1;
    const previousOrders = allOrders.filter(
      (o) => o.createdAt >= prevStart && o.createdAt <= prevEnd
    );

    // Current month orders
    const now = new Date(args.endDate);
    const currentMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    ).getTime();
    const monthOrders = allOrders.filter(
      (o) => o.createdAt >= currentMonthStart && o.createdAt <= args.endDate
    );

    // Previous month orders
    const prevMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
    ).getTime();
    const prevMonthEnd = currentMonthStart - 1;
    const prevMonthOrders = allOrders.filter(
      (o) => o.createdAt >= prevMonthStart && o.createdAt <= prevMonthEnd
    );

    const summarize = (orders: typeof allOrders) => {
      return orders.reduce(
        (acc, o) => {
          acc.totalOrders += 1;
          acc.totalRevenue += o.total;
          if (o.status === "pending") acc.pendingOrders += 1;
          if (o.status === "processing") acc.processingOrders += 1;
          if (o.status === "delivered") acc.completedOrders += 1;
          return acc;
        },
        { totalOrders: 0, pendingOrders: 0, processingOrders: 0, completedOrders: 0, totalRevenue: 0 }
      );
    };

    const currentSummary = summarize(currentOrders);
    const previousSummary = summarize(previousOrders);
    const monthSummary = summarize(monthOrders);
    const prevMonthSummary = summarize(prevMonthOrders);

    // Product stats
    const products = await ctx.db
      .query("products")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .collect();
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => !p.inStock).length;

    const averageOrderValue =
      currentSummary.totalOrders > 0
        ? currentSummary.totalRevenue / currentSummary.totalOrders
        : 0;

    const completionRate =
      currentSummary.totalOrders > 0
        ? (currentSummary.completedOrders / currentSummary.totalOrders) * 100
        : 0;

    const calcTrend = (current: number, previous: number): number | null => {
      if (previous === 0) return current === 0 ? 0 : null;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalOrders: currentSummary.totalOrders,
      pendingOrders: currentSummary.pendingOrders,
      processingOrders: currentSummary.processingOrders,
      completedOrders: currentSummary.completedOrders,
      totalRevenue: currentSummary.totalRevenue,
      monthlyRevenue: monthSummary.totalRevenue,
      totalProducts,
      lowStockProducts,
      averageOrderValue,
      completionRate,
      range: {
        start: new Date(args.startDate).toISOString(),
        end: new Date(args.endDate).toISOString(),
      },
      trend: {
        totalOrders: calcTrend(currentSummary.totalOrders, previousSummary.totalOrders),
        totalRevenue: calcTrend(currentSummary.totalRevenue, previousSummary.totalRevenue),
        monthlyRevenue: calcTrend(monthSummary.totalRevenue, prevMonthSummary.totalRevenue),
        completionRate: calcTrend(
          completionRate,
          previousSummary.totalOrders > 0
            ? (previousSummary.completedOrders / previousSummary.totalOrders) * 100
            : 0
        ),
      },
    };
  },
});

export const deleteOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    // Delete order items
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.orderId);
    return true;
  },
});
