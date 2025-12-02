// B2B Marketplace Service
// Handles B2B offers between grossistes, importateurs, and fournisseurs

import { supabase } from "./client"
import { SellerCategory } from "./types"

export type B2BOfferType = "negotiable" | "auction"
export type B2BOfferStatus = "active" | "expired" | "closed" | "sold"
export type B2BResponseType = "bid" | "negotiation"
export type B2BResponseStatus = "pending" | "accepted" | "rejected" | "outbid" | "withdrawn"

export interface B2BOffer {
  id: string
  seller_id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  base_price: number
  min_quantity: number
  available_quantity: number
  offer_type: B2BOfferType
  status: B2BOfferStatus
  current_bid?: number
  highest_bidder_id?: string
  starts_at?: string
  ends_at?: string
  target_category: SellerCategory
  created_at: string
  updated_at: string
  // Joined fields
  seller?: {
    id: string
    full_name: string
    seller_category: SellerCategory
  }
}

export interface B2BOfferResponse {
  id: string
  offer_id: string
  buyer_id: string
  response_type: B2BResponseType
  status: B2BResponseStatus
  amount: number
  quantity: number
  message?: string
  created_at: string
  updated_at: string
  // Joined fields
  buyer?: {
    id: string
    full_name: string
    seller_category: SellerCategory
    phone?: string
  }
  offer?: B2BOffer
}

export interface NewB2BOffer {
  title: string
  description: string
  images?: string[]
  tags?: string[]
  base_price: number
  min_quantity: number
  available_quantity: number
  offer_type: B2BOfferType
  target_category: SellerCategory
  ends_at?: string
}

export interface B2BFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  minQuantity?: number
  maxQuantity?: number
  offerType?: B2BOfferType
  searchQuery?: string
}

/**
 * Determine which offers a seller can see based on their category
 * - Grossiste can see Importateur offers (buys from importateurs)
 * - Fournisseur can see Grossiste offers (buys from grossistes)
 * - Importateur cannot see B2B offers (they sell, don't buy in this hierarchy)
 */
export function getVisibleTargetCategories(userCategory: SellerCategory): SellerCategory[] {
  switch (userCategory) {
    case "grossiste":
      // Grossistes buy from importateurs
      return ["grossiste"] // target_category = grossiste means offer is FOR grossistes (from importateurs)
    case "fournisseur":
      // Fournisseurs buy from grossistes
      return ["fournisseur"] // target_category = fournisseur means offer is FOR fournisseurs (from grossistes)
    case "importateur":
      // Importateurs don't buy in B2B, they only sell to grossistes
      return []
    default:
      return []
  }
}

/**
 * Determine who a seller can sell to based on their category
 * - Grossiste sells to Fournisseurs
 * - Importateur sells to Grossistes
 * - Fournisseur sells to customers (not B2B)
 */
export function getTargetCategoryForSelling(userCategory: SellerCategory): SellerCategory | null {
  switch (userCategory) {
    case "grossiste":
      return "fournisseur" // Grossistes sell to fournisseurs
    case "importateur":
      return "grossiste" // Importateurs sell to grossistes
    case "fournisseur":
      return null // Fournisseurs sell to customers, not B2B
    default:
      return null
  }
}

/**
 * Check if a seller can create B2B offers (sell in B2B marketplace)
 * Only Grossistes and Importateurs can sell in B2B
 */
export function canSellInB2B(userCategory: SellerCategory): boolean {
  return userCategory === "grossiste" || userCategory === "importateur"
}

/**
 * Check if a seller can buy in B2B marketplace
 * Only Grossistes and Fournisseurs can buy in B2B
 */
export function canBuyInB2B(userCategory: SellerCategory): boolean {
  return userCategory === "grossiste" || userCategory === "fournisseur"
}

/**
 * Fetch B2B offers visible to the current user based on their seller category
 */
export async function fetchB2BOffers(
  userCategory: SellerCategory,
  filters?: B2BFilters
): Promise<{ data: B2BOffer[]; error: string | null }> {
  try {
    const visibleCategories = getVisibleTargetCategories(userCategory)

    if (visibleCategories.length === 0) {
      return { data: [], error: null }
    }

    let query = supabase
      .from("b2b_offers")
      .select(`
        *,
        seller:user_profiles!b2b_offers_seller_id_fkey (
          id,
          full_name,
          seller_category
        )
      `)
      .in("target_category", visibleCategories)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters?.minPrice) {
      query = query.gte("base_price", filters.minPrice)
    }
    if (filters?.maxPrice) {
      query = query.lte("base_price", filters.maxPrice)
    }
    if (filters?.minQuantity) {
      query = query.gte("available_quantity", filters.minQuantity)
    }
    if (filters?.maxQuantity) {
      query = query.lte("available_quantity", filters.maxQuantity)
    }
    if (filters?.offerType) {
      query = query.eq("offer_type", filters.offerType)
    }
    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
    }
    if (filters?.category) {
      query = query.contains("tags", [filters.category])
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching B2B offers:", error)
      return { data: [], error: error.message }
    }

    return { data: data as B2BOffer[], error: null }
  } catch (err) {
    console.error("Error in fetchB2BOffers:", err)
    return { data: [], error: "Failed to fetch B2B offers" }
  }
}

/**
 * Fetch B2B offers created by a specific seller (for "My Offers" section)
 */
export async function fetchMyB2BOffers(
  sellerId: string
): Promise<{ data: B2BOffer[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("b2b_offers")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching my B2B offers:", error)
      return { data: [], error: error.message }
    }

    return { data: data as B2BOffer[], error: null }
  } catch (err) {
    console.error("Error in fetchMyB2BOffers:", err)
    return { data: [], error: "Failed to fetch your B2B offers" }
  }
}

/**
 * Create a new B2B offer
 */
export async function createB2BOffer(
  sellerId: string,
  offer: NewB2BOffer
): Promise<{ success: boolean; data?: B2BOffer; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("b2b_offers")
      .insert({
        seller_id: sellerId,
        title: offer.title,
        description: offer.description,
        images: offer.images || [],
        tags: offer.tags || [],
        base_price: offer.base_price,
        min_quantity: offer.min_quantity,
        available_quantity: offer.available_quantity,
        offer_type: offer.offer_type,
        target_category: offer.target_category,
        ends_at: offer.ends_at,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating B2B offer:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as B2BOffer }
  } catch (err) {
    console.error("Error in createB2BOffer:", err)
    return { success: false, error: "Failed to create B2B offer" }
  }
}

/**
 * Submit a response (bid or negotiation) to a B2B offer
 * If buyer already has a pending response, update it instead of creating a new one
 */
export async function submitB2BResponse(
  buyerId: string,
  offerId: string,
  responseType: B2BResponseType,
  amount: number,
  quantity: number,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if buyer already has a pending response for this offer
    const { data: existingResponse } = await supabase
      .from("b2b_offer_responses")
      .select("id")
      .eq("offer_id", offerId)
      .eq("buyer_id", buyerId)
      .eq("status", "pending")
      .single()

    let error
    if (existingResponse) {
      // Update existing pending response
      const result = await supabase
        .from("b2b_offer_responses")
        .update({
          response_type: responseType,
          amount,
          quantity,
          message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingResponse.id)
      error = result.error
    } else {
      // Create new response
      const result = await supabase.from("b2b_offer_responses").insert({
        offer_id: offerId,
        buyer_id: buyerId,
        response_type: responseType,
        amount,
        quantity,
        message,
        status: "pending",
      })
      error = result.error
    }

    if (error) {
      console.error("Error submitting B2B response:", error)
      return { success: false, error: error.message }
    }

    // If it's a bid, update the current_bid on the offer if this is the highest
    if (responseType === "bid") {
      const { data: offer } = await supabase
        .from("b2b_offers")
        .select("current_bid")
        .eq("id", offerId)
        .single()

      if (!offer?.current_bid || amount > offer.current_bid) {
        await supabase
          .from("b2b_offers")
          .update({
            current_bid: amount,
            highest_bidder_id: buyerId,
          })
          .eq("id", offerId)
      }
    }

    return { success: true }
  } catch (err) {
    console.error("Error in submitB2BResponse:", err)
    return { success: false, error: "Failed to submit response" }
  }
}

/**
 * Delete a B2B offer (only the owner can delete)
 */
export async function deleteB2BOffer(
  offerId: string,
  sellerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("b2b_offers")
      .delete()
      .eq("id", offerId)
      .eq("seller_id", sellerId)

    if (error) {
      console.error("Error deleting B2B offer:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Error in deleteB2BOffer:", err)
    return { success: false, error: "Failed to delete B2B offer" }
  }
}

/**
 * Get unique categories/tags from all offers (for filter dropdown)
 */
export async function fetchB2BCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("b2b_offers")
      .select("tags")
      .eq("status", "active")

    if (error || !data) {
      return []
    }

    // Flatten and deduplicate tags
    const allTags = data.flatMap((offer) => offer.tags || [])
    const uniqueTags = [...new Set(allTags)]
    return uniqueTags.sort()
  } catch (err) {
    console.error("Error fetching B2B categories:", err)
    return []
  }
}

/**
 * Fetch responses/orders for a specific B2B offer (for sellers to see who's interested)
 */
export async function fetchOfferResponses(
  offerId: string
): Promise<{ data: B2BOfferResponse[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("b2b_offer_responses")
      .select(`
        *,
        buyer:user_profiles!b2b_offer_responses_buyer_id_fkey (
          id,
          full_name,
          seller_category,
          phone
        )
      `)
      .eq("offer_id", offerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching offer responses:", error)
      return { data: [], error: error.message }
    }

    return { data: data as B2BOfferResponse[], error: null }
  } catch (err) {
    console.error("Error in fetchOfferResponses:", err)
    return { data: [], error: "Failed to fetch responses" }
  }
}

/**
 * Fetch all responses for all offers by a seller (for "My Orders" view)
 */
export async function fetchMyOfferResponses(
  sellerId: string
): Promise<{ data: B2BOfferResponse[]; error: string | null }> {
  try {
    // First get all offer IDs for this seller
    const { data: offers, error: offersError } = await supabase
      .from("b2b_offers")
      .select("id")
      .eq("seller_id", sellerId)

    if (offersError || !offers || offers.length === 0) {
      return { data: [], error: null }
    }

    const offerIds = offers.map((o) => o.id)

    const { data, error } = await supabase
      .from("b2b_offer_responses")
      .select(`
        *,
        buyer:user_profiles!b2b_offer_responses_buyer_id_fkey (
          id,
          full_name,
          seller_category,
          phone
        ),
        offer:b2b_offers!b2b_offer_responses_offer_id_fkey (
          id,
          title,
          base_price,
          images
        )
      `)
      .in("offer_id", offerIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching my offer responses:", error)
      return { data: [], error: error.message }
    }

    return { data: data as B2BOfferResponse[], error: null }
  } catch (err) {
    console.error("Error in fetchMyOfferResponses:", err)
    return { data: [], error: "Failed to fetch responses" }
  }
}

/**
 * Update response status (accept or reject a bid/negotiation)
 */
export async function updateResponseStatus(
  responseId: string,
  sellerId: string,
  newStatus: "accepted" | "rejected"
): Promise<{ success: boolean; error?: string }> {
  try {
    // First verify this response belongs to an offer owned by this seller
    const { data: response, error: fetchError } = await supabase
      .from("b2b_offer_responses")
      .select(`
        *,
        offer:b2b_offers!b2b_offer_responses_offer_id_fkey (
          id,
          seller_id
        )
      `)
      .eq("id", responseId)
      .single()

    if (fetchError || !response) {
      return { success: false, error: "Response not found" }
    }

    // Check if seller owns the offer
    if ((response.offer as { seller_id: string })?.seller_id !== sellerId) {
      return { success: false, error: "Not authorized to update this response" }
    }

    // Update the response status
    const { error: updateError } = await supabase
      .from("b2b_offer_responses")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", responseId)

    if (updateError) {
      console.error("Error updating response status:", updateError)
      return { success: false, error: updateError.message }
    }

    // If accepted, update the offer status to "sold" and reject other pending responses
    if (newStatus === "accepted") {
      // Mark offer as sold
      await supabase
        .from("b2b_offers")
        .update({ status: "sold", updated_at: new Date().toISOString() })
        .eq("id", response.offer_id)

      // Reject other pending responses for this offer
      await supabase
        .from("b2b_offer_responses")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("offer_id", response.offer_id)
        .neq("id", responseId)
        .eq("status", "pending")
    }

    return { success: true }
  } catch (err) {
    console.error("Error in updateResponseStatus:", err)
    return { success: false, error: "Failed to update response" }
  }
}

/**
 * Get count of pending responses for a seller's offers
 */
export async function getPendingResponsesCount(
  sellerId: string
): Promise<number> {
  try {
    // Get all offer IDs for this seller
    const { data: offers, error: offersError } = await supabase
      .from("b2b_offers")
      .select("id")
      .eq("seller_id", sellerId)
      .eq("status", "active")

    if (offersError || !offers || offers.length === 0) {
      return 0
    }

    const offerIds = offers.map((o) => o.id)

    const { count, error } = await supabase
      .from("b2b_offer_responses")
      .select("id", { count: "exact", head: true })
      .in("offer_id", offerIds)
      .eq("status", "pending")

    if (error) {
      return 0
    }

    return count || 0
  } catch (err) {
    console.error("Error getting pending responses count:", err)
    return 0
  }
}

// Notification types
export type B2BNotificationType =
  | "new_offer"
  | "new_bid"
  | "outbid"
  | "negotiation_submitted"
  | "negotiation_accepted"
  | "negotiation_rejected"
  | "bid_accepted"
  | "bid_rejected"
  | "auction_won"
  | "auction_lost"
  | "auction_ending_soon"
  | "offer_expired"

export interface B2BNotification {
  id: string
  user_id: string
  notification_type: B2BNotificationType
  title: string
  message: string
  offer_id?: string
  response_id?: string
  metadata?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

/**
 * Fetch notifications for a user
 */
export async function fetchB2BNotifications(
  userId: string
): Promise<{ data: B2BNotification[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("b2b_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching B2B notifications:", error)
      return { data: [], error: error.message }
    }

    return { data: data as B2BNotification[], error: null }
  } catch (err) {
    console.error("Error in fetchB2BNotifications:", err)
    return { data: [], error: "Failed to fetch notifications" }
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("b2b_notifications")
      .update({ is_read: true })
      .eq("id", notificationId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Error marking notification as read:", err)
    return { success: false, error: "Failed to mark as read" }
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("b2b_notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Error marking all notifications as read:", err)
    return { success: false, error: "Failed to mark all as read" }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("b2b_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) {
      return 0
    }

    return count || 0
  } catch (err) {
    console.error("Error getting unread notification count:", err)
    return 0
  }
}
