import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRoleValidator = v.union(
  v.literal("customer"),
  v.literal("seller"),
  v.literal("freelancer"),
  v.literal("admin")
);

export const sellerCategoryValidator = v.union(
  v.literal("fournisseur"),
  v.literal("importateur"),
  v.literal("grossiste")
);

export const sellerTypeValidator = v.union(
  v.literal("retailer"),
  v.literal("importer"),
  v.literal("wholesaler")
);

export const productTypeValidator = v.union(
  v.literal("Parfum Femme"),
  v.literal("Parfum Homme"),
  v.literal("Eau de Parfum"),
  v.literal("Eau de Toilette")
);

export const productNeedValidator = v.union(
  v.literal("Journée"),
  v.literal("Soirée"),
  v.literal("Quotidien"),
  v.literal("Spécial")
);

export const productCategoryTypeValidator = v.union(
  v.literal("perfume"),
  v.literal("clothing")
);

export const serviceCategoryValidator = v.union(
  v.literal("Développement Web"),
  v.literal("Design Graphique"),
  v.literal("Montage Vidéo"),
  v.literal("Marketing Digital"),
  v.literal("Rédaction"),
  v.literal("Photographie"),
  v.literal("Traduction"),
  v.literal("Consultation")
);

export const experienceLevelValidator = v.union(
  v.literal("Débutant"),
  v.literal("Intermédiaire"),
  v.literal("Expert")
);

export const priceTypeValidator = v.union(
  v.literal("fixed"),
  v.literal("hourly"),
  v.literal("starting-at")
);

export const availabilityStatusValidator = v.union(
  v.literal("available"),
  v.literal("busy"),
  v.literal("unavailable")
);

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled")
);

export const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refunded")
);

export const b2bOfferTypeValidator = v.union(
  v.literal("negotiable"),
  v.literal("auction")
);

export const b2bOfferStatusValidator = v.union(
  v.literal("active"),
  v.literal("expired"),
  v.literal("closed"),
  v.literal("sold")
);

export const b2bResponseTypeValidator = v.union(
  v.literal("bid"),
  v.literal("negotiation")
);

export const b2bResponseStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("outbid"),
  v.literal("withdrawn")
);

export const b2bNotificationTypeValidator = v.union(
  v.literal("new_offer"),
  v.literal("new_bid"),
  v.literal("outbid"),
  v.literal("negotiation_submitted"),
  v.literal("negotiation_accepted"),
  v.literal("negotiation_rejected"),
  v.literal("auction_won"),
  v.literal("auction_lost"),
  v.literal("auction_ending_soon"),
  v.literal("offer_expired")
);

export default defineSchema({
  userProfiles: defineTable({
    email: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: userRoleValidator,
    providerName: v.optional(v.string()),
    providerAvatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    sellerType: v.optional(sellerTypeValidator),
    sellerCategory: v.optional(sellerCategoryValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_sellerCategory", ["sellerCategory"]),

  products: defineTable({
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
    rating: v.optional(v.number()),
    viewersCount: v.number(),
    countdownEndDate: v.optional(v.string()),
    description: v.string(),
    benefits: v.array(v.string()),
    ingredients: v.string(),
    usageInstructions: v.string(),
    deliveryEstimate: v.string(),
    shippingInfo: v.string(),
    returnsInfo: v.string(),
    paymentInfo: v.string(),
    exclusiveOffers: v.optional(v.string()),
    sellerId: v.optional(v.id("userProfiles")),
    sellerCategory: v.optional(sellerCategoryValidator),
    minQuantity: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_productCategory", ["productCategory"])
    .index("by_sellerId", ["sellerId"])
    .index("by_sellerCategory", ["sellerCategory"])
    .index("by_createdAt", ["createdAt"])
    .index("by_brand", ["brand"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["productCategory", "sellerCategory", "brand", "inStock"],
    }),

  productImages: defineTable({
    productId: v.id("products"),
    imageUrl: v.string(),
    isPrimary: v.boolean(),
    displayOrder: v.number(),
    createdAt: v.number(),
  }).index("by_productId", ["productId"]),

  productVideos: defineTable({
    productId: v.id("products"),
    videoUrl: v.string(),
    videoStoragePath: v.string(),
    thumbnailUrl: v.string(),
    thumbnailStoragePath: v.string(),
    durationSeconds: v.number(),
    fileSizeBytes: v.number(),
    createdAt: v.number(),
  }).index("by_productId", ["productId"]),

  orders: defineTable({
    orderNumber: v.string(),
    userId: v.optional(v.id("userProfiles")),
    sellerId: v.optional(v.id("userProfiles")),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.string(),
    customerAddress: v.string(),
    customerWilaya: v.string(),
    total: v.number(),
    status: orderStatusValidator,
    paymentStatus: paymentStatusValidator,
    deliveryDate: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_userId", ["userId"])
    .index("by_sellerId", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_sellerId_status", ["sellerId", "status"])
    .index("by_createdAt", ["createdAt"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    productImage: v.string(),
    quantity: v.number(),
    price: v.number(),
    subtotal: v.number(),
    createdAt: v.number(),
  }).index("by_orderId", ["orderId"]),

  freelanceServices: defineTable({
    slug: v.string(),
    providerId: v.id("userProfiles"),
    serviceTitle: v.string(),
    category: serviceCategoryValidator,
    experienceLevel: experienceLevelValidator,
    rating: v.number(),
    reviewsCount: v.number(),
    completedProjects: v.number(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_providerId", ["providerId"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"]),

  freelancePortfolios: defineTable({
    serviceId: v.id("freelanceServices"),
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    displayOrder: v.number(),
    createdAt: v.number(),
  }).index("by_serviceId", ["serviceId"]),

  b2bOffers: defineTable({
    sellerId: v.id("userProfiles"),
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    tags: v.array(v.string()),
    basePrice: v.number(),
    minQuantity: v.number(),
    availableQuantity: v.number(),
    offerType: b2bOfferTypeValidator,
    status: b2bOfferStatusValidator,
    currentBid: v.optional(v.number()),
    highestBidderId: v.optional(v.id("userProfiles")),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    targetCategory: sellerCategoryValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sellerId", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_targetCategory", ["targetCategory"])
    .index("by_status_targetCategory", ["status", "targetCategory"])
    .index("by_createdAt", ["createdAt"]),

  b2bOfferResponses: defineTable({
    offerId: v.id("b2bOffers"),
    buyerId: v.id("userProfiles"),
    responseType: b2bResponseTypeValidator,
    status: b2bResponseStatusValidator,
    amount: v.number(),
    quantity: v.number(),
    message: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_offerId", ["offerId"])
    .index("by_buyerId", ["buyerId"])
    .index("by_offerId_buyerId", ["offerId", "buyerId"])
    .index("by_offerId_status", ["offerId", "status"]),

  b2bNotifications: defineTable({
    userId: v.id("userProfiles"),
    type: b2bNotificationTypeValidator,
    title: v.string(),
    message: v.string(),
    offerId: v.optional(v.id("b2bOffers")),
    responseId: v.optional(v.id("b2bOfferResponses")),
    metadata: v.any(),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_read", ["userId", "read"])
    .index("by_createdAt", ["createdAt"]),

  counters: defineTable({
    name: v.string(),
    value: v.number(),
  }).index("by_name", ["name"]),
});
