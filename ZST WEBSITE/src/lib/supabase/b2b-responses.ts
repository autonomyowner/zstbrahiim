// B2B Offer Responses API service (Bids and Negotiations)
import { supabase, getCurrentUser } from './client'
import type {
  B2BOfferResponse,
  B2BResponseStatus,
  B2BResponseType,
  CreateB2BResponseRequest,
  B2BResponseWithDetails,
} from './types'

// Create a new response (bid or negotiation)
export const createResponse = async (
  responseData: CreateB2BResponseRequest
): Promise<B2BOfferResponse> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get user's seller category
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('seller_category, role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Verify the offer exists and is active
    const { data: offerData } = await supabase
      .from('b2b_offers' as any)
      .select('*')
      .eq('id', responseData.offer_id)
      .single()

    if (!offerData) {
      throw new Error('Offer not found')
    }

    const offer = offerData as any
    if (offer.status !== 'active') {
      throw new Error('Offer is no longer active')
    }

    // Validate buyer category matches offer target
    if (userProfile.seller_category !== offer.target_category) {
      throw new Error(
        `You cannot respond to this offer. This offer is for ${offer.target_category}s only. Your category: ${userProfile.seller_category}`
      )
    }

    // Check if user already has a pending response for this offer
    const { data: existingResponse } = await supabase
      .from('b2b_offer_responses' as any)
      .select('id, response_type, amount, status')
      .eq('offer_id', responseData.offer_id)
      .eq('buyer_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingResponse) {
      const responseType = (existingResponse as any).response_type === 'bid' ? 'enchère' : 'négociation'
      throw new Error(
        `Vous avez déjà une ${responseType} en attente sur cette offre. Veuillez la retirer d'abord si vous souhaitez en soumettre une nouvelle.`
      )
    }

    // Validate response based on type
    if (responseData.response_type === 'bid') {
      // For auctions
      if (offer.offer_type !== 'auction') {
        throw new Error('Can only place bids on auction offers')
      }

      // Check if auction has started and not ended
      const now = new Date()
      if (offer.starts_at && new Date(offer.starts_at) > now) {
        throw new Error('Auction has not started yet')
      }
      if (offer.ends_at && new Date(offer.ends_at) <= now) {
        throw new Error('Auction has ended')
      }

      // Validate bid amount is higher than current bid or base price
      const minimumBid = offer.current_bid || offer.base_price
      if (responseData.amount <= minimumBid) {
        throw new Error(
          `Bid must be higher than current ${offer.current_bid ? 'bid' : 'base price'} of ${minimumBid} DZD`
        )
      }
    } else {
      // For negotiations
      if (offer.offer_type !== 'negotiable') {
        throw new Error('Can only submit negotiations for negotiable offers')
      }

      // Validate quantity doesn't exceed available
      if (responseData.quantity > offer.available_quantity) {
        throw new Error(
          `Requested quantity exceeds available quantity of ${offer.available_quantity}`
        )
      }

      // Validate quantity meets minimum
      if (responseData.quantity < offer.min_quantity) {
        throw new Error(
          `Requested quantity must be at least ${offer.min_quantity} units`
        )
      }
    }

    const insertData = {
      offer_id: responseData.offer_id,
      buyer_id: user.id,
      response_type: responseData.response_type,
      amount: responseData.amount,
      quantity: responseData.quantity,
      message: responseData.message || null,
      status: 'pending' as B2BResponseStatus,
    }

    const { data, error } = await supabase
      .from('b2b_offer_responses' as any)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating response:', error)
      // Extract meaningful error message
      const errorMessage = error.message || error.details || JSON.stringify(error)
      throw new Error(`Failed to create response: ${errorMessage}`)
    }

    return data as unknown as B2BOfferResponse
  } catch (error: any) {
    console.error('Error in createResponse:', error)
    // Re-throw with meaningful message
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error?.message || 'Unknown error creating response')
  }
}

// Get responses for a specific offer (seller view)
export const getOfferResponses = async (
  offerId: string,
  filters?: {
    status?: B2BResponseStatus
    responseType?: B2BResponseType
  }
): Promise<B2BResponseWithDetails[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify user owns the offer
    const { data: offerData } = await supabase
      .from('b2b_offers' as any)
      .select('seller_id')
      .eq('id', offerId)
      .single()

    if (!offerData) {
      throw new Error('Offer not found')
    }

    const offer = offerData as any
    if (offer.seller_id !== user.id) {
      throw new Error('You can only view responses to your own offers')
    }

    let query = supabase
      .from('b2b_responses_with_details' as any)
      .select('*')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.responseType) {
      query = query.eq('response_type', filters.responseType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching offer responses:', error)
      throw error
    }

    return (data as unknown as B2BResponseWithDetails[]) || []
  } catch (error) {
    console.error('Error in getOfferResponses:', error)
    throw error
  }
}

// Get buyer's own responses (buyer view)
export const getMyResponses = async (
  filters?: {
    status?: B2BResponseStatus
    responseType?: B2BResponseType
  }
): Promise<B2BResponseWithDetails[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('b2b_responses_with_details' as any)
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.responseType) {
      query = query.eq('response_type', filters.responseType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching my responses:', error)
      throw error
    }

    return (data as unknown as B2BResponseWithDetails[]) || []
  } catch (error) {
    console.error('Error in getMyResponses:', error)
    throw error
  }
}

// Accept a negotiation (seller action)
export const acceptNegotiation = async (responseId: string): Promise<any> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify ownership and response type
    const { data: responseData } = await supabase
      .from('b2b_responses_with_details' as any)
      .select('*')
      .eq('id', responseId)
      .single()

    if (!responseData) {
      throw new Error('Response not found')
    }

    const response = responseData as any
    if (response.seller_id !== user.id) {
      throw new Error('You can only accept responses to your own offers')
    }

    if (response.response_type !== 'negotiation') {
      throw new Error('Can only accept negotiation responses')
    }

    if (response.status !== 'pending') {
      throw new Error('Response is not pending')
    }

    // Call the database function to handle acceptance
    const { data, error } = await (supabase as any).rpc('accept_negotiation', {
      response_id: responseId,
    })

    if (error) {
      console.error('Error accepting negotiation:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in acceptNegotiation:', error)
    throw error
  }
}

// Reject a response (seller action)
export const rejectResponse = async (responseId: string): Promise<B2BOfferResponse> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify ownership
    const { data: responseData } = await supabase
      .from('b2b_responses_with_details' as any)
      .select('*')
      .eq('id', responseId)
      .single()

    if (!responseData) {
      throw new Error('Response not found')
    }

    const response = responseData as any
    if (response.seller_id !== user.id) {
      throw new Error('You can only reject responses to your own offers')
    }

    if (response.status !== 'pending') {
      throw new Error('Response is not pending')
    }

    const { data, error } = await supabase
      .from('b2b_offer_responses' as any)
      .update({ status: 'rejected' })
      .eq('id', responseId)
      .select()
      .single()

    if (error) {
      console.error('Error rejecting response:', error)
      throw error
    }

    return data as unknown as B2BOfferResponse
  } catch (error) {
    console.error('Error in rejectResponse:', error)
    throw error
  }
}

// Withdraw a response (buyer action)
export const withdrawResponse = async (responseId: string): Promise<B2BOfferResponse> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify ownership
    const { data: responseData } = await supabase
      .from('b2b_offer_responses' as any)
      .select('buyer_id, status')
      .eq('id', responseId)
      .single()

    if (!responseData) {
      throw new Error('Response not found')
    }

    const response = responseData as any
    if (response.buyer_id !== user.id) {
      throw new Error('You can only withdraw your own responses')
    }

    if (response.status !== 'pending') {
      throw new Error('Can only withdraw pending responses')
    }

    const { data, error } = await supabase
      .from('b2b_offer_responses' as any)
      .update({ status: 'withdrawn' })
      .eq('id', responseId)
      .select()
      .single()

    if (error) {
      console.error('Error withdrawing response:', error)
      throw error
    }

    return data as unknown as B2BOfferResponse
  } catch (error) {
    console.error('Error in withdrawResponse:', error)
    throw error
  }
}

// Get bid history for an auction (public for participants)
export const getBidHistory = async (offerId: string): Promise<B2BResponseWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('b2b_responses_with_details' as any)
      .select('*')
      .eq('offer_id', offerId)
      .eq('response_type', 'bid')
      .order('amount', { ascending: false })
      .limit(20) // Show top 20 bids

    if (error) {
      console.error('Error fetching bid history:', error)
      throw error
    }

    return (data as unknown as B2BResponseWithDetails[]) || []
  } catch (error) {
    console.error('Error in getBidHistory:', error)
    return []
  }
}

// Check if user has already responded to an offer
export const hasUserResponded = async (offerId: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from('b2b_offer_responses' as any)
      .select('id')
      .eq('offer_id', offerId)
      .eq('buyer_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (error) {
      console.error('Error checking user response:', error)
      return false
    }

    return data !== null
  } catch (error) {
    console.error('Error in hasUserResponded:', error)
    return false
  }
}

// Get buyer's activity statistics
export const getBuyerActivity = async (buyerId?: string): Promise<any> => {
  try {
    const user = await getCurrentUser()
    const targetBuyerId = buyerId || user?.id

    if (!targetBuyerId) {
      throw new Error('Buyer ID is required')
    }

    const { data, error } = await supabase
      .from('b2b_buyer_activity' as any)
      .select('*')
      .eq('buyer_id', targetBuyerId)
      .single()

    if (error) {
      console.error('Error fetching buyer activity:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getBuyerActivity:', error)
    return null
  }
}
