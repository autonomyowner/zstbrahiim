import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { userRoleValidator, sellerCategoryValidator, sellerTypeValidator } from "./schema";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});

export const createProfile = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    role: userRoleValidator,
    sellerCategory: v.optional(sellerCategoryValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("userProfiles", {
      email: args.email,
      fullName: args.fullName,
      phone: args.phone,
      role: args.role,
      sellerCategory: args.role === "seller" ? (args.sellerCategory ?? "fournisseur") : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    providerName: v.optional(v.string()),
    providerAvatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    sellerType: v.optional(sellerTypeValidator),
    sellerCategory: v.optional(sellerCategoryValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const getUserById = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || user.role !== "admin") return [];

    return await ctx.db
      .query("userProfiles")
      .order("desc")
      .collect();
  },
});
