import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import {
  serviceCategoryValidator,
  experienceLevelValidator,
  priceTypeValidator,
  availabilityStatusValidator,
} from "./schema";

async function getServiceWithDetails(ctx: any, service: any) {
  const [portfolios, provider] = await Promise.all([
    ctx.db
      .query("freelancePortfolios")
      .withIndex("by_serviceId", (q: any) => q.eq("serviceId", service._id))
      .collect(),
    service.providerId ? ctx.db.get(service.providerId) : null,
  ]);

  return {
    ...service,
    id: service._id,
    providerId: service.providerId,
    providerName: provider?.providerName || provider?.fullName || "Unknown",
    providerAvatar: provider?.providerAvatar || "",
    portfolio: portfolios
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
      .map((p: any) => ({
        title: p.title,
        image: p.imageUrl,
        description: p.description,
      })),
  };
}

export const getFreelanceServices = query({
  args: {
    category: v.optional(serviceCategoryValidator),
    experienceLevel: v.optional(experienceLevelValidator),
    availability: v.optional(availabilityStatusValidator),
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
    topRated: v.optional(v.boolean()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let services;

    if (args.category) {
      services = await ctx.db
        .query("freelanceServices")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    } else {
      services = await ctx.db
        .query("freelanceServices")
        .withIndex("by_createdAt")
        .order("desc")
        .collect();
    }

    // Apply filters
    if (args.experienceLevel) {
      services = services.filter((s) => s.experienceLevel === args.experienceLevel);
    }
    if (args.availability) {
      services = services.filter((s) => s.availability === args.availability);
    }
    if (args.featured !== undefined) {
      services = services.filter((s) => s.featured === args.featured);
    }
    if (args.verified !== undefined) {
      services = services.filter((s) => s.verified === args.verified);
    }
    if (args.topRated !== undefined) {
      services = services.filter((s) => s.topRated === args.topRated);
    }
    if (args.minPrice !== undefined) {
      services = services.filter((s) => s.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      services = services.filter((s) => s.price <= args.maxPrice!);
    }

    return await Promise.all(
      services.map((service) => getServiceWithDetails(ctx, service))
    );
  },
});

export const getServiceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db
      .query("freelanceServices")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!service) return null;
    return await getServiceWithDetails(ctx, service);
  },
});

export const getServiceById = query({
  args: { serviceId: v.id("freelanceServices") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) return null;
    return await getServiceWithDetails(ctx, service);
  },
});

export const createService = mutation({
  args: {
    slug: v.string(),
    serviceTitle: v.string(),
    category: serviceCategoryValidator,
    experienceLevel: experienceLevelValidator,
    responseTime: v.string(),
    price: v.number(),
    priceType: priceTypeValidator,
    description: v.string(),
    shortDescription: v.string(),
    skills: v.array(v.string()),
    deliveryTime: v.string(),
    revisions: v.string(),
    languages: v.array(v.string()),
    availability: availabilityStatusValidator,
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
    topRated: v.optional(v.boolean()),
    portfolio: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        imageUrl: v.string(),
        displayOrder: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user || (user.role !== "freelancer" && user.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const { portfolio, ...serviceFields } = args;
    const now = Date.now();

    const serviceId = await ctx.db.insert("freelanceServices", {
      ...serviceFields,
      providerId: user._id,
      rating: 0,
      reviewsCount: 0,
      completedProjects: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Insert portfolio items
    for (let i = 0; i < portfolio.length; i++) {
      await ctx.db.insert("freelancePortfolios", {
        serviceId,
        title: portfolio[i].title,
        description: portfolio[i].description,
        imageUrl: portfolio[i].imageUrl,
        displayOrder: portfolio[i].displayOrder ?? i,
        createdAt: now,
      });
    }

    return serviceId;
  },
});

export const updateService = mutation({
  args: {
    serviceId: v.id("freelanceServices"),
    serviceTitle: v.optional(v.string()),
    category: v.optional(serviceCategoryValidator),
    experienceLevel: v.optional(experienceLevelValidator),
    responseTime: v.optional(v.string()),
    price: v.optional(v.number()),
    priceType: v.optional(priceTypeValidator),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    deliveryTime: v.optional(v.string()),
    revisions: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    availability: v.optional(availabilityStatusValidator),
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
    topRated: v.optional(v.boolean()),
    portfolio: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
          imageUrl: v.string(),
          displayOrder: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");
    if (service.providerId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const { serviceId, portfolio, ...updateFields } = args;
    await ctx.db.patch(serviceId, {
      ...updateFields,
      updatedAt: Date.now(),
    });

    if (portfolio) {
      // Delete old portfolio items
      const oldPortfolio = await ctx.db
        .query("freelancePortfolios")
        .withIndex("by_serviceId", (q) => q.eq("serviceId", serviceId))
        .collect();
      for (const item of oldPortfolio) {
        await ctx.db.delete(item._id);
      }

      // Insert new portfolio items
      const now = Date.now();
      for (let i = 0; i < portfolio.length; i++) {
        await ctx.db.insert("freelancePortfolios", {
          serviceId,
          title: portfolio[i].title,
          description: portfolio[i].description,
          imageUrl: portfolio[i].imageUrl,
          displayOrder: portfolio[i].displayOrder ?? i,
          createdAt: now,
        });
      }
    }

    return true;
  },
});

export const deleteService = mutation({
  args: { serviceId: v.id("freelanceServices") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");
    if (service.providerId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Delete portfolio items
    const portfolio = await ctx.db
      .query("freelancePortfolios")
      .withIndex("by_serviceId", (q) => q.eq("serviceId", args.serviceId))
      .collect();
    for (const item of portfolio) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.serviceId);
    return true;
  },
});
