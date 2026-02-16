import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { b2bNotificationTypeValidator } from "./schema";

export const getNotifications = query({
  args: {
    read: v.optional(v.boolean()),
    type: v.optional(b2bNotificationTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    let notifications;

    if (args.read !== undefined) {
      notifications = await ctx.db
        .query("b2bNotifications")
        .withIndex("by_userId_read", (q) =>
          q.eq("userId", user._id).eq("read", args.read!)
        )
        .order("desc")
        .collect();
    } else {
      notifications = await ctx.db
        .query("b2bNotifications")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
    }

    if (args.type) {
      notifications = notifications.filter((n) => n.type === args.type);
    }

    if (args.limit) {
      notifications = notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("b2bNotifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("b2bNotifications") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
      readAt: Date.now(),
    });
    return true;
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("b2bNotifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    const now = Date.now();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true, readAt: now });
    }
    return true;
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("b2bNotifications") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.notificationId);
    return true;
  },
});

export const createNotification = internalMutation({
  args: {
    userId: v.id("userProfiles"),
    type: b2bNotificationTypeValidator,
    title: v.string(),
    message: v.string(),
    offerId: v.optional(v.id("b2bOffers")),
    responseId: v.optional(v.id("b2bOfferResponses")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("b2bNotifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      offerId: args.offerId,
      responseId: args.responseId,
      metadata: args.metadata || {},
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const notifyExpiringAuctions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000;

    const activeAuctions = await ctx.db
      .query("b2bOffers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let notifiedCount = 0;
    for (const auction of activeAuctions) {
      if (
        auction.offerType === "auction" &&
        auction.endsAt &&
        auction.endsAt > now &&
        auction.endsAt <= oneHourFromNow
      ) {
        // Notify the seller
        await ctx.db.insert("b2bNotifications", {
          userId: auction.sellerId,
          type: "auction_ending_soon",
          title: "Enchère bientôt terminée",
          message: `Votre enchère "${auction.title}" se termine dans moins d'une heure.`,
          offerId: auction._id,
          metadata: {},
          read: false,
          createdAt: now,
        });

        // Notify bidders
        const responses = await ctx.db
          .query("b2bOfferResponses")
          .withIndex("by_offerId", (q) => q.eq("offerId", auction._id))
          .collect();

        const uniqueBuyerIds = [...new Set(responses.map((r) => r.buyerId))];
        for (const buyerId of uniqueBuyerIds) {
          await ctx.db.insert("b2bNotifications", {
            userId: buyerId,
            type: "auction_ending_soon",
            title: "Enchère bientôt terminée",
            message: `L'enchère "${auction.title}" se termine dans moins d'une heure.`,
            offerId: auction._id,
            metadata: {},
            read: false,
            createdAt: now,
          });
        }

        notifiedCount++;
      }
    }

    return notifiedCount;
  },
});
