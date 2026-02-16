import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { b2bOfferTypeValidator, b2bOfferStatusValidator, sellerCategoryValidator } from "./schema";
import { internal } from "./_generated/api";

async function getOfferWithDetails(ctx: any, offer: any) {
  const [seller, responses] = await Promise.all([
    ctx.db.get(offer.sellerId),
    ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId", (q: any) => q.eq("offerId", offer._id))
      .collect(),
  ]);

  const pendingResponses = responses.filter((r: any) => r.status === "pending");
  const highestBid = responses
    .filter((r: any) => r.responseType === "bid")
    .sort((a: any, b: any) => b.amount - a.amount)[0];

  const secondsRemaining =
    offer.endsAt ? Math.max(0, Math.floor((offer.endsAt - Date.now()) / 1000)) : null;

  return {
    ...offer,
    id: offer._id,
    seller_name: seller?.providerName || seller?.fullName || "Unknown",
    seller_category: seller?.sellerCategory || "fournisseur",
    seller_email: seller?.email || "",
    pending_responses_count: pendingResponses.length,
    total_responses_count: responses.length,
    highest_bid_amount: highestBid?.amount || null,
    display_status: offer.status,
    seconds_remaining: secondsRemaining,
  };
}

export const getAvailableOffers = query({
  args: {
    offerType: v.optional(b2bOfferTypeValidator),
    status: v.optional(b2bOfferStatusValidator),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(
      v.union(
        v.literal("newest"),
        v.literal("price_asc"),
        v.literal("price_desc"),
        v.literal("ending_soon")
      )
    ),
  },
  handler: async (ctx, args) => {
    const status = args.status || "active";

    let offers = await ctx.db
      .query("b2bOffers")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();

    if (args.offerType) {
      offers = offers.filter((o) => o.offerType === args.offerType);
    }
    if (args.minPrice !== undefined) {
      offers = offers.filter((o) => o.basePrice >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      offers = offers.filter((o) => o.basePrice <= args.maxPrice!);
    }
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      offers = offers.filter(
        (o) =>
          o.title.toLowerCase().includes(searchLower) ||
          o.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (args.sortBy === "price_asc") {
      offers.sort((a, b) => a.basePrice - b.basePrice);
    } else if (args.sortBy === "price_desc") {
      offers.sort((a, b) => b.basePrice - a.basePrice);
    } else if (args.sortBy === "ending_soon") {
      offers = offers.filter((o) => o.offerType === "auction" && o.endsAt);
      offers.sort((a, b) => (a.endsAt || 0) - (b.endsAt || 0));
    }

    return await Promise.all(offers.map((offer) => getOfferWithDetails(ctx, offer)));
  },
});

export const getMyOffers = query({
  args: {
    status: v.optional(b2bOfferStatusValidator),
    offerType: v.optional(b2bOfferTypeValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    let offers = await ctx.db
      .query("b2bOffers")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .collect();

    if (args.status) {
      offers = offers.filter((o) => o.status === args.status);
    }
    if (args.offerType) {
      offers = offers.filter((o) => o.offerType === args.offerType);
    }

    return await Promise.all(offers.map((offer) => getOfferWithDetails(ctx, offer)));
  },
});

export const getOfferById = query({
  args: { offerId: v.id("b2bOffers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer) return null;
    return await getOfferWithDetails(ctx, offer);
  },
});

export const createOffer = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    images: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    basePrice: v.number(),
    minQuantity: v.number(),
    availableQuantity: v.number(),
    offerType: b2bOfferTypeValidator,
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (!user.sellerCategory) {
      throw new Error("User does not have a seller category");
    }

    let targetCategory: "fournisseur" | "importateur" | "grossiste";
    if (user.sellerCategory === "importateur") {
      targetCategory = "grossiste";
    } else if (user.sellerCategory === "grossiste") {
      targetCategory = "fournisseur";
    } else {
      throw new Error("Only importateurs and grossistes can create B2B offers");
    }

    if (args.offerType === "auction" && (!args.startsAt || !args.endsAt)) {
      throw new Error("Auction offers require startsAt and endsAt dates");
    }

    const now = Date.now();

    return await ctx.db.insert("b2bOffers", {
      sellerId: user._id,
      title: args.title,
      description: args.description,
      images: args.images || [],
      tags: args.tags || [],
      basePrice: args.basePrice,
      minQuantity: args.minQuantity,
      availableQuantity: args.availableQuantity,
      offerType: args.offerType,
      status: "active",
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      targetCategory,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateOffer = mutation({
  args: {
    offerId: v.id("b2bOffers"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    basePrice: v.optional(v.number()),
    minQuantity: v.optional(v.number()),
    availableQuantity: v.optional(v.number()),
    status: v.optional(b2bOfferStatusValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.sellerId !== user._id) throw new Error("Not authorized");
    if (offer.status === "sold" || offer.status === "expired") {
      throw new Error("Cannot update sold or expired offers");
    }

    const { offerId, ...updates } = args;
    await ctx.db.patch(offerId, { ...updates, updatedAt: Date.now() });
    return true;
  },
});

export const deleteOffer = mutation({
  args: { offerId: v.id("b2bOffers") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.sellerId !== user._id) throw new Error("Not authorized");

    // Delete related responses
    const responses = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId", (q) => q.eq("offerId", args.offerId))
      .collect();
    for (const response of responses) {
      await ctx.db.delete(response._id);
    }

    await ctx.db.delete(args.offerId);
    return true;
  },
});

export const closeOffer = mutation({
  args: { offerId: v.id("b2bOffers") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.sellerId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.offerId, {
      status: "closed",
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const getOfferStatistics = query({
  args: { offerId: v.id("b2bOffers") },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId", (q) => q.eq("offerId", args.offerId))
      .collect();

    const bids = responses.filter((r) => r.responseType === "bid");
    const negotiations = responses.filter((r) => r.responseType === "negotiation");

    return {
      totalResponses: responses.length,
      totalBids: bids.length,
      totalNegotiations: negotiations.length,
      pendingResponses: responses.filter((r) => r.status === "pending").length,
      highestBid: bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : null,
      averageBid:
        bids.length > 0 ? bids.reduce((sum, b) => sum + b.amount, 0) / bids.length : null,
    };
  },
});

export const getSellerStatistics = query({
  args: { sellerId: v.optional(v.id("userProfiles")) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const targetId = args.sellerId || user?._id;
    if (!targetId) return null;

    const offers = await ctx.db
      .query("b2bOffers")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", targetId))
      .collect();

    const activeOffers = offers.filter((o) => o.status === "active");
    const closedOffers = offers.filter((o) => o.status === "closed" || o.status === "sold");

    return {
      totalOffers: offers.length,
      activeOffers: activeOffers.length,
      closedOffers: closedOffers.length,
    };
  },
});

export const autoCloseExpiredAuctions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeAuctions = await ctx.db
      .query("b2bOffers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let closedCount = 0;
    for (const auction of activeAuctions) {
      if (auction.offerType === "auction" && auction.endsAt && auction.endsAt <= now) {
        await ctx.db.patch(auction._id, {
          status: "expired",
          updatedAt: now,
        });
        closedCount++;
      }
    }
    return closedCount;
  },
});
