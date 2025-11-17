// B2B Offers API service
import { supabase, getCurrentUser } from './client'
import type {
  B2BOffer,
  B2BOfferStatus,
  B2BOfferType,
  SellerCategory,
  CreateB2BOfferRequest,
  UpdateB2BOfferRequest,
  B2BOfferWithDetails,
} from './types'

// Get all available offers for the current user (based on their seller category)
export const getAvailableOffers = async (
  filters?: {
    offerType?: B2BOfferType
    status?: B2BOfferStatus
    minPrice?: number
    maxPrice?: number
    search?: string
  },
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'ending_soon'
): Promise<B2BOfferWithDetails[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('b2b_offers_with_details' as any)
      .select('*')
      .eq('status', filters?.status || 'active')

    // Apply filters
    if (filters?.offerType) {
      query = query.eq('offer_type', filters.offerType)
    }

    if (filters?.minPrice) {
      query = query.gte('base_price', filters.minPrice)
    }

    if (filters?.maxPrice) {
      query = query.lte('base_price', filters.maxPrice)
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'price_asc':
        query = query.order('base_price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('base_price', { ascending: false })
        break
      case 'ending_soon':
        query = query
          .eq('offer_type', 'auction')
          .not('ends_at', 'is', null)
          .order('ends_at', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching available offers:', error)
      throw error
    }

    return (data as unknown as B2BOfferWithDetails[]) || []
  } catch (error) {
    console.error('Error in getAvailableOffers:', error)
    throw error
  }
}

// Get offers created by the current user (seller)
export const getMyOffers = async (
  filters?: {
    status?: B2BOfferStatus
    offerType?: B2BOfferType
  }
): Promise<B2BOfferWithDetails[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('b2b_offers_with_details' as any)
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.offerType) {
      query = query.eq('offer_type', filters.offerType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching my offers:', error)
      throw error
    }

    return (data as unknown as B2BOfferWithDetails[]) || []
  } catch (error) {
    console.error('Error in getMyOffers:', error)
    throw error
  }
}

// Get a single offer by ID
export const getOfferById = async (offerId: string): Promise<B2BOfferWithDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('b2b_offers_with_details' as any)
      .select('*')
      .eq('id', offerId)
      .single()

    if (error) {
      console.error('Error fetching offer:', error)
      throw error
    }

    return data as unknown as B2BOfferWithDetails
  } catch (error) {
    console.error('Error in getOfferById:', error)
    return null
  }
}

// Create a new B2B offer
export const createOffer = async (
  offerData: CreateB2BOfferRequest
): Promise<B2BOffer> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get user's seller category
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('seller_category')
      .eq('id', user.id)
      .single()

    if (!userProfile?.seller_category) {
      throw new Error('User does not have a seller category')
    }

    // Determine target category based on seller category
    let targetCategory: SellerCategory
    if (userProfile.seller_category === 'importateur') {
      targetCategory = 'grossiste'
    } else if (userProfile.seller_category === 'grossiste') {
      targetCategory = 'fournisseur'
    } else {
      throw new Error('Only importateurs and grossistes can create B2B offers')
    }

    // Prepare offer data
    const insertData: any = {
      seller_id: user.id,
      title: offerData.title,
      description: offerData.description,
      images: offerData.images || [],
      tags: offerData.tags || [],
      base_price: offerData.base_price,
      min_quantity: offerData.min_quantity,
      available_quantity: offerData.available_quantity,
      offer_type: offerData.offer_type,
      target_category: targetCategory,
    }

    // Add auction-specific fields if it's an auction
    if (offerData.offer_type === 'auction') {
      if (!offerData.starts_at || !offerData.ends_at) {
        throw new Error('Auction offers require starts_at and ends_at dates')
      }
      insertData.starts_at = offerData.starts_at
      insertData.ends_at = offerData.ends_at
      insertData.current_bid = null
      insertData.highest_bidder_id = null
    }

    const { data, error } = await supabase
      .from('b2b_offers' as any)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating offer:', error)
      throw error
    }

    return data as unknown as B2BOffer
  } catch (error) {
    console.error('Error in createOffer:', error)
    throw error
  }
}

// Update an existing offer
export const updateOffer = async (
  offerId: string,
  updates: UpdateB2BOfferRequest
): Promise<B2BOffer> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify ownership
    const { data: existingOffer } = await supabase
      .from('b2b_offers' as any)
      .select('seller_id, status, offer_type')
      .eq('id', offerId)
      .single()

    if (!existingOffer) {
      throw new Error('Offer not found')
    }

    const offer = existingOffer as any
    if (offer.seller_id !== user.id) {
      throw new Error('You can only update your own offers')
    }

    // Don't allow updates to sold/expired offers
    if (offer.status === 'sold' || offer.status === 'expired') {
      throw new Error('Cannot update sold or expired offers')
    }

    const { data, error } = await supabase
      .from('b2b_offers' as any)
      .update(updates)
      .eq('id', offerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating offer:', error)
      throw error
    }

    return data as unknown as B2BOffer
  } catch (error) {
    console.error('Error in updateOffer:', error)
    throw error
  }
}

// Delete an offer
export const deleteOffer = async (offerId: string): Promise<void> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify ownership
    const { data: existingOffer } = await supabase
      .from('b2b_offers' as any)
      .select('seller_id')
      .eq('id', offerId)
      .single()

    if (!existingOffer) {
      throw new Error('Offer not found')
    }

    const offer = existingOffer as any
    if (offer.seller_id !== user.id) {
      throw new Error('You can only delete your own offers')
    }

    const { error } = await supabase
      .from('b2b_offers' as any)
      .delete()
      .eq('id', offerId)

    if (error) {
      console.error('Error deleting offer:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteOffer:', error)
    throw error
  }
}

// Close an offer (mark as closed)
export const closeOffer = async (offerId: string): Promise<B2BOffer> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('b2b_offers' as any)
      .update({ status: 'closed' })
      .eq('id', offerId)
      .eq('seller_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error closing offer:', error)
      throw error
    }

    return data as unknown as B2BOffer
  } catch (error) {
    console.error('Error in closeOffer:', error)
    throw error
  }
}

// Get offer statistics
export const getOfferStatistics = async (offerId: string): Promise<any> => {
  try {
    const { data, error } = await (supabase as any)
      .rpc('get_offer_statistics', { offer_id: offerId })

    if (error) {
      console.error('Error fetching offer statistics:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getOfferStatistics:', error)
    return null
  }
}

// Auto-close expired auctions (admin/system function)
export const autoCloseExpiredAuctions = async (): Promise<any> => {
  try {
    const { data, error } = await (supabase as any).rpc('auto_close_expired_auctions')

    if (error) {
      console.error('Error auto-closing expired auctions:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in autoCloseExpiredAuctions:', error)
    throw error
  }
}

// Get seller statistics
export const getSellerStatistics = async (sellerId?: string): Promise<any> => {
  try {
    const user = await getCurrentUser()
    const targetSellerId = sellerId || user?.id

    if (!targetSellerId) {
      throw new Error('Seller ID is required')
    }

    const { data, error } = await supabase
      .from('b2b_seller_statistics' as any)
      .select('*')
      .eq('seller_id', targetSellerId)
      .single()

    if (error) {
      console.error('Error fetching seller statistics:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getSellerStatistics:', error)
    return null
  }
}
