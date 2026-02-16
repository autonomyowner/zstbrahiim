import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { b2bResponseTypeValidator, b2bResponseStatusValidator } from "./schema";

async function getResponseWithDetails(ctx: any, response: any) {
  const [offer, buyer] = await Promise.all([
    ctx.db.get(response.offerId),
    ctx.db.get(response.buyerId),
  ]);

  const seller = offer ? await ctx.db.get(offer.sellerId) : null;

  return {
    ...response,
    id: response._id,
    offer_title: offer?.title || "",
    seller_id: offer?.sellerId,
    offer_type: offer?.offerType || "negotiable",
    offer_status: offer?.status || "closed",
    buyer_name: buyer?.providerName || buyer?.fullName || "Unknown",
    buyer_category: buyer?.sellerCategory || "fournisseur",
    seller_name: seller?.providerName || seller?.fullName || "Unknown",
    seller_category: seller?.sellerCategory || "fournisseur",
  };
}

export const createResponse = mutation({
  args: {
    offerId: v.id("b2bOffers"),
    responseType: b2bResponseTypeValidator,
    amount: v.number(),
    quantity: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.status !== "active") throw new Error("Offer is no longer active");

    // Validate buyer category matches target
    if (user.sellerCategory !== offer.targetCategory) {
      throw new Error(
        `You cannot respond to this offer. This offer is for ${offer.targetCategory}s only.`
      );
    }

    // Check for existing pending response
    const existingResponse = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId_buyerId", (q) =>
        q.eq("offerId", args.offerId).eq("buyerId", user._id)
      )
      .first();

    if (existingResponse && existingResponse.status === "pending") {
      throw new Error(
        "Vous avez déjà une réponse en attente sur cette offre. Veuillez la retirer d'abord."
      );
    }

    // Validate based on type
    if (args.responseType === "bid") {
      if (offer.offerType !== "auction") {
        throw new Error("Can only place bids on auction offers");
      }
      const now = Date.now();
      if (offer.startsAt && offer.startsAt > now) throw new Error("Auction has not started yet");
      if (offer.endsAt && offer.endsAt <= now) throw new Error("Auction has ended");

      const minimumBid = offer.currentBid || offer.basePrice;
      if (args.amount <= minimumBid) {
        throw new Error(`Bid must be higher than current ${offer.currentBid ? "bid" : "base price"} of ${minimumBid} DZD`);
      }

      // Update current bid on offer
      await ctx.db.patch(args.offerId, {
        currentBid: args.amount,
        highestBidderId: user._id,
        updatedAt: Date.now(),
      });
    } else {
      if (offer.offerType !== "negotiable") {
        throw new Error("Can only submit negotiations for negotiable offers");
      }
      if (args.quantity > offer.availableQuantity) {
        throw new Error(`Requested quantity exceeds available quantity of ${offer.availableQuantity}`);
      }
      if (args.quantity < offer.minQuantity) {
        throw new Error(`Requested quantity must be at least ${offer.minQuantity} units`);
      }
    }

    const now = Date.now();
    return await ctx.db.insert("b2bOfferResponses", {
      offerId: args.offerId,
      buyerId: user._id,
      responseType: args.responseType,
      status: "pending",
      amount: args.amount,
      quantity: args.quantity,
      message: args.message,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getOfferResponses = query({
  args: {
    offerId: v.id("b2bOffers"),
    status: v.optional(b2bResponseStatusValidator),
    responseType: v.optional(b2bResponseTypeValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const offer = await ctx.db.get(args.offerId);
    if (!offer || offer.sellerId !== user._id) return [];

    let responses = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId", (q) => q.eq("offerId", args.offerId))
      .order("desc")
      .collect();

    if (args.status) {
      responses = responses.filter((r) => r.status === args.status);
    }
    if (args.responseType) {
      responses = responses.filter((r) => r.responseType === args.responseType);
    }

    return await Promise.all(responses.map((r) => getResponseWithDetails(ctx, r)));
  },
});

export const getMyResponses = query({
  args: {
    status: v.optional(b2bResponseStatusValidator),
    responseType: v.optional(b2bResponseTypeValidator),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    let responses = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_buyerId", (q) => q.eq("buyerId", user._id))
      .order("desc")
      .collect();

    if (args.status) {
      responses = responses.filter((r) => r.status === args.status);
    }
    if (args.responseType) {
      responses = responses.filter((r) => r.responseType === args.responseType);
    }

    return await Promise.all(responses.map((r) => getResponseWithDetails(ctx, r)));
  },
});

export const acceptNegotiation = mutation({
  args: { responseId: v.id("b2bOfferResponses") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const response = await ctx.db.get(args.responseId);
    if (!response) throw new Error("Response not found");
    if (response.responseType !== "negotiation") throw new Error("Can only accept negotiations");
    if (response.status !== "pending") throw new Error("Response is not pending");

    const offer = await ctx.db.get(response.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.sellerId !== user._id) throw new Error("Not authorized");

    const now = Date.now();

    // Accept this response
    await ctx.db.patch(args.responseId, { status: "accepted", updatedAt: now });

    // Reject all other pending responses for this offer
    const otherResponses = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId_status", (q) =>
        q.eq("offerId", response.offerId).eq("status", "pending")
      )
      .collect();

    for (const other of otherResponses) {
      if (other._id !== args.responseId) {
        await ctx.db.patch(other._id, { status: "rejected", updatedAt: now });
      }
    }

    // Close the offer
    await ctx.db.patch(response.offerId, { status: "sold", updatedAt: now });

    return true;
  },
});

export const rejectResponse = mutation({
  args: { responseId: v.id("b2bOfferResponses") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const response = await ctx.db.get(args.responseId);
    if (!response) throw new Error("Response not found");
    if (response.status !== "pending") throw new Error("Response is not pending");

    const offer = await ctx.db.get(response.offerId);
    if (!offer || offer.sellerId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.responseId, {
      status: "rejected",
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const withdrawResponse = mutation({
  args: { responseId: v.id("b2bOfferResponses") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const response = await ctx.db.get(args.responseId);
    if (!response) throw new Error("Response not found");
    if (response.buyerId !== user._id) throw new Error("Not authorized");
    if (response.status !== "pending") throw new Error("Can only withdraw pending responses");

    await ctx.db.patch(args.responseId, {
      status: "withdrawn",
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const getBidHistory = query({
  args: { offerId: v.id("b2bOffers") },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId", (q) => q.eq("offerId", args.offerId))
      .collect();

    const bids = responses
      .filter((r) => r.responseType === "bid")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20);

    return await Promise.all(bids.map((r) => getResponseWithDetails(ctx, r)));
  },
});

export const hasUserResponded = query({
  args: { offerId: v.id("b2bOffers") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return false;

    const existing = await ctx.db
      .query("b2bOfferResponses")
      .withIndex("by_offerId_buyerId", (q) =>
        q.eq("offerId", args.offerId).eq("buyerId", user._id)
      )
      .first();

    return existing !== null && existing.status === "pending";
  },
});
