import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import {
  productTypeValidator,
  productNeedValidator,
  productCategoryTypeValidator,
  sellerCategoryValidator,
} from "./schema";
import { Doc, Id } from "./_generated/dataModel";

// Helper to get product with images and video
async function getProductWithRelations(
  ctx: any,
  product: Doc<"products">
) {
  const [images, videos] = await Promise.all([
    ctx.db
      .query("productImages")
      .withIndex("by_productId", (q: any) => q.eq("productId", product._id))
      .collect(),
    ctx.db
      .query("productVideos")
      .withIndex("by_productId", (q: any) => q.eq("productId", product._id))
      .collect(),
  ]);

  const imageUrls = images
    .sort((a: Doc<"productImages">, b: Doc<"productImages">) => a.displayOrder - b.displayOrder)
    .map((img: Doc<"productImages">) => img.imageUrl);
  const video = videos[0] || null;

  return {
    ...product,
    id: product._id,
    images: imageUrls,
    image: imageUrls[0] || video?.thumbnailUrl || "",
    video: video
      ? {
          url: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          durationSeconds: video.durationSeconds,
          fileSizeBytes: video.fileSizeBytes,
        }
      : undefined,
  };
}

export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    productType: v.optional(productTypeValidator),
    productCategory: v.optional(productCategoryTypeValidator),
    need: v.optional(productNeedValidator),
    inStock: v.optional(v.boolean()),
    isPromo: v.optional(v.boolean()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    brand: v.optional(v.string()),
    sellerCategories: v.optional(v.array(sellerCategoryValidator)),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let productsQuery;

    if (args.productCategory) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_productCategory", (q) =>
          q.eq("productCategory", args.productCategory!)
        );
    } else if (args.sellerCategories && args.sellerCategories.length === 1) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_sellerCategory", (q) =>
          q.eq("sellerCategory", args.sellerCategories![0])
        );
    } else {
      productsQuery = ctx.db.query("products").withIndex("by_createdAt");
    }

    let allProducts = await productsQuery.order("desc").collect();

    // Apply filters
    if (args.category) {
      allProducts = allProducts.filter((p) => p.category === args.category);
    }
    if (args.productType) {
      allProducts = allProducts.filter((p) => p.productType === args.productType);
    }
    if (args.productCategory && !args.sellerCategories) {
      // already filtered by index
    }
    if (args.need) {
      allProducts = allProducts.filter((p) => p.need === args.need);
    }
    if (args.inStock !== undefined) {
      allProducts = allProducts.filter((p) => p.inStock === args.inStock);
    }
    if (args.isPromo !== undefined) {
      allProducts = allProducts.filter((p) => p.isPromo === args.isPromo);
    }
    if (args.minPrice !== undefined) {
      allProducts = allProducts.filter((p) => p.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      allProducts = allProducts.filter((p) => p.price <= args.maxPrice!);
    }
    if (args.brand) {
      allProducts = allProducts.filter((p) => p.brand === args.brand);
    }
    if (args.sellerCategories && args.sellerCategories.length > 1) {
      allProducts = allProducts.filter(
        (p) => p.sellerCategory && args.sellerCategories!.includes(p.sellerCategory)
      );
    }

    // Pagination
    const offset = args.offset ?? 0;
    const limit = args.limit ?? 50;
    const paged = allProducts.slice(offset, offset + limit);

    // Get images/videos for each product
    const results = await Promise.all(
      paged.map((product) => getProductWithRelations(ctx, product))
    );

    return results;
  },
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;
    return await getProductWithRelations(ctx, product);
  },
});

export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!product) return null;
    return await getProductWithRelations(ctx, product);
  },
});

export const getSellerProducts = query({
  args: {
    productCategory: v.optional(productCategoryTypeValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    let products = await ctx.db
      .query("products")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .collect();

    if (args.productCategory) {
      products = products.filter((p) => p.productCategory === args.productCategory);
    }

    return await Promise.all(
      products.map((product) => getProductWithRelations(ctx, product))
    );
  },
});

export const searchProducts = query({
  args: {
    searchQuery: v.string(),
    productCategory: v.optional(productCategoryTypeValidator),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.searchQuery.trim()) return [];

    const results = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) => {
        let search = q.search("name", args.searchQuery);
        if (args.productCategory) {
          search = search.eq("productCategory", args.productCategory);
        }
        if (args.inStock !== undefined) {
          search = search.eq("inStock", args.inStock);
        }
        return search;
      })
      .collect();

    return await Promise.all(
      results.map((product) => getProductWithRelations(ctx, product))
    );
  },
});

export const createProduct = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    brand: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    productType: productTypeValidator,
    productCategory: productCategoryTypeValidator,
    need: v.optional(productNeedValidator),
    inStock: v.boolean(),
    isPromo: v.boolean(),
    isNew: v.optional(v.boolean()),
    description: v.string(),
    benefits: v.array(v.string()),
    ingredients: v.string(),
    usageInstructions: v.string(),
    deliveryEstimate: v.string(),
    shippingInfo: v.string(),
    returnsInfo: v.string(),
    paymentInfo: v.string(),
    exclusiveOffers: v.optional(v.string()),
    minQuantity: v.number(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const { images, ...productFields } = args;
    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      ...productFields,
      sellerId: user._id,
      sellerCategory: user.sellerCategory,
      viewersCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Insert images
    for (let i = 0; i < images.length; i++) {
      await ctx.db.insert("productImages", {
        productId,
        imageUrl: images[i],
        isPrimary: i === 0,
        displayOrder: i,
        createdAt: now,
      });
    }

    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    brand: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    productType: v.optional(productTypeValidator),
    productCategory: v.optional(productCategoryTypeValidator),
    need: v.optional(productNeedValidator),
    inStock: v.optional(v.boolean()),
    isPromo: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    description: v.optional(v.string()),
    benefits: v.optional(v.array(v.string())),
    ingredients: v.optional(v.string()),
    usageInstructions: v.optional(v.string()),
    deliveryEstimate: v.optional(v.string()),
    shippingInfo: v.optional(v.string()),
    returnsInfo: v.optional(v.string()),
    paymentInfo: v.optional(v.string()),
    exclusiveOffers: v.optional(v.string()),
    minQuantity: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (product.sellerId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const { productId, images, ...updateFields } = args;
    await ctx.db.patch(productId, {
      ...updateFields,
      updatedAt: Date.now(),
    });

    // Update images if provided
    if (images && images.length > 0) {
      // Delete old images
      const oldImages = await ctx.db
        .query("productImages")
        .withIndex("by_productId", (q) => q.eq("productId", productId))
        .collect();
      for (const img of oldImages) {
        await ctx.db.delete(img._id);
      }

      // Insert new images
      const now = Date.now();
      for (let i = 0; i < images.length; i++) {
        await ctx.db.insert("productImages", {
          productId,
          imageUrl: images[i],
          isPrimary: i === 0,
          displayOrder: i,
          createdAt: now,
        });
      }
    }

    return true;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (product.sellerId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Delete related images
    const images = await ctx.db
      .query("productImages")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();
    for (const img of images) {
      await ctx.db.delete(img._id);
    }

    // Delete related videos
    const videos = await ctx.db
      .query("productVideos")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();
    for (const vid of videos) {
      await ctx.db.delete(vid._id);
    }

    await ctx.db.delete(args.productId);
    return true;
  },
});

export const incrementViewersCount = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return;
    await ctx.db.patch(args.productId, {
      viewersCount: product.viewersCount + 1,
    });
  },
});

export const getBrands = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const brands = [...new Set(products.map((p) => p.brand))].sort();
    return brands;
  },
});
