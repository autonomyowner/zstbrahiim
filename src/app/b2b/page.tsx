'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import OfferCard from '@/components/b2b/OfferCard'
import OfferFilters from '@/components/b2b/OfferFilters'
import CreateOfferModal from '@/components/b2b/CreateOfferModal'
import OfferDetailsModal from '@/components/b2b/OfferDetailsModal'
import MyResponsesSection from '@/components/b2b/MyResponsesSection'

type B2BOfferType = 'negotiable' | 'auction'
type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'ending_soon'

export default function B2BMarketplacePage() {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()

  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [filters, setFilters] = useState<{
    offerType?: B2BOfferType
    minPrice?: number
    maxPrice?: number
    search?: string
  }>({})

  // Active tab
  const [activeTab, setActiveTab] = useState<'offers' | 'my_responses'>('offers')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)

  // Convex queries and mutations
  const rawOffers = useQuery(api.b2bOffers.getAvailableOffers, {})
  const createOfferMutation = useMutation(api.b2bOffers.createOffer)
  const createResponseMutation = useMutation(api.b2bResponses.createResponse)

  // Derive access state from user
  const accessDenied = !isLoading && (!user || user.role !== 'seller')
  const loading = isLoading

  // Map Convex offers to the shape the child components expect (snake_case)
  const offers = useMemo(() => {
    if (!rawOffers) return []
    return rawOffers.map((offer: any) => ({
      ...offer,
      // Map camelCase Convex fields to snake_case for child components
      offer_type: offer.offerType ?? offer.offer_type,
      base_price: offer.basePrice ?? offer.base_price,
      min_quantity: offer.minQuantity ?? offer.min_quantity,
      available_quantity: offer.availableQuantity ?? offer.available_quantity,
      current_bid: offer.currentBid ?? offer.current_bid ?? null,
      highest_bidder_id: offer.highestBidderId ?? offer.highest_bidder_id ?? null,
      ends_at: offer.endsAt ?? offer.ends_at ?? null,
      starts_at: offer.startsAt ?? offer.starts_at ?? null,
      created_at: offer.createdAt ?? offer.created_at,
      updated_at: offer.updatedAt ?? offer.updated_at,
      target_category: offer.targetCategory ?? offer.target_category,
      // These are already snake_case from getOfferWithDetails
      seller_name: offer.seller_name,
      seller_category: offer.seller_category,
      seller_email: offer.seller_email,
      pending_responses_count: offer.pending_responses_count,
      total_responses_count: offer.total_responses_count,
      highest_bid_amount: offer.highest_bid_amount,
      display_status: offer.display_status,
      seconds_remaining: offer.seconds_remaining,
    }))
  }, [rawOffers])

  // Apply client-side filters and sorting
  const filteredOffers = useMemo(() => {
    let result = [...offers]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (offer: any) =>
          offer.title.toLowerCase().includes(searchLower) ||
          offer.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply offer type filter
    if (filters.offerType) {
      result = result.filter((offer: any) => offer.offer_type === filters.offerType)
    }

    // Apply price filters
    if (filters.minPrice) {
      result = result.filter((offer: any) => offer.base_price >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      result = result.filter((offer: any) => offer.base_price <= filters.maxPrice!)
    }

    // Apply sorting
    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price_asc':
          return a.base_price - b.base_price
        case 'price_desc':
          return b.base_price - a.base_price
        case 'ending_soon':
          if (a.ends_at && b.ends_at) {
            return new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()
          }
          return 0
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [offers, filters, sortBy])

  const handleCreateOffer = async (offerData: any) => {
    try {
      await createOfferMutation({
        title: offerData.title,
        description: offerData.description,
        images: offerData.images || [],
        tags: offerData.tags || [],
        basePrice: offerData.base_price,
        minQuantity: offerData.min_quantity,
        availableQuantity: offerData.available_quantity,
        offerType: offerData.offer_type,
        startsAt: offerData.starts_at ? new Date(offerData.starts_at).getTime() : undefined,
        endsAt: offerData.ends_at ? new Date(offerData.ends_at).getTime() : undefined,
      })
      alert('Offre cr\u00E9\u00E9e avec succ\u00E8s!')
    } catch (error: any) {
      console.error('Error creating offer:', error)
      throw new Error(error.message || 'Erreur lors de la cr\u00E9ation de l\'offre')
    }
  }

  const handleSubmitResponse = async (responseData: any) => {
    try {
      await createResponseMutation({
        offerId: responseData.offer_id,
        responseType: responseData.response_type,
        amount: responseData.amount,
        quantity: responseData.quantity,
        message: responseData.message,
      })
      alert(
        responseData.response_type === 'bid'
          ? 'Ench\u00E8re plac\u00E9e avec succ\u00E8s!'
          : 'Offre soumise avec succ\u00E8s!'
      )
    } catch (error: any) {
      console.error('Error submitting response:', error)
      throw new Error(error.message || 'Erreur lors de la soumission')
    }
  }

  const handleViewDetails = (offer: any) => {
    setSelectedOffer(offer)
    setShowDetailsModal(true)
  }

  const handleMakeOffer = (offer: any) => {
    setSelectedOffer(offer)
    setShowDetailsModal(true)
  }

  const canCreateOffers = () => {
    return user?.sellerCategory === 'importateur' || user?.sellerCategory === 'grossiste'
  }

  const getWelcomeMessage = () => {
    const category = user?.sellerCategory
    if (category === 'fournisseur') {
      return 'Bienvenue dans l\'espace Grossistes - D\u00E9couvrez les offres disponibles pour votre activit\u00E9'
    } else if (category === 'grossiste') {
      return 'Bienvenue dans l\'espace Importateurs - Trouvez les meilleures offres pour votre entreprise'
    } else if (category === 'importateur') {
      return 'Bienvenue dans l\'espace B2B - Cr\u00E9ez et g\u00E9rez vos offres pour les grossistes'
    }
    return 'Bienvenue dans l\'espace B2B'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Acc&egrave;s B2B R&eacute;serv&eacute; aux Vendeurs Professionnels
              </h1>

              <p className="text-lg text-gray-700 mb-6">
                Le march&eacute; B2B de ZST est exclusivement accessible aux comptes vendeurs professionnels.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Pour acc&eacute;der &agrave; cette section, vous devez &ecirc;tre :
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-gray-900">Fournisseur (D&eacute;taillant)</span>
                      <p className="text-gray-600 text-sm mt-1">Acc&eacute;dez aux offres des grossistes et importateurs</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-gray-900">Importateur</span>
                      <p className="text-gray-600 text-sm mt-1">Cr&eacute;ez des offres pour les grossistes</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-gray-900">Grossiste</span>
                      <p className="text-gray-600 text-sm mt-1">Cr&eacute;ez des offres pour les d&eacute;taillants</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user && (
                  <button
                    onClick={() => router.push('/auth/login?redirect=/b2b')}
                    className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                  >
                    Se connecter
                  </button>
                )}
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                >
                  Cr&eacute;er un compte vendeur
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg border-2 border-gray-300 transition-colors duration-200"
                >
                  Retour &agrave; l&apos;accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                March&eacute; B2B ZST
              </h1>
              <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>
            {canCreateOffers() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors duration-200"
              >
                Cr&eacute;er une offre
              </button>
            )}
          </div>

          {/* User Info Card */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user.fullName}</div>
                <div className="text-sm text-gray-600">
                  {user.sellerCategory === 'importateur'
                    ? 'Importateur'
                    : user.sellerCategory === 'grossiste'
                    ? 'Grossiste'
                    : 'Fournisseur (D\u00E9taillant)'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'offers'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Offres disponibles
            </button>
            <button
              onClick={() => setActiveTab('my_responses')}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === 'my_responses'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes offres soumises
            </button>
          </div>
        </div>

        {activeTab === 'offers' ? (
          <>
            {/* Filters */}
            <div className="mb-8">
              <OfferFilters
                onFilterChange={(newFilters) => setFilters(newFilters)}
                onSortChange={(newSort) => setSortBy(newSort)}
                currentSort={sortBy}
                offersCount={filteredOffers.length}
              />
            </div>

            {/* Offers Grid */}
            {filteredOffers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffers.map((offer: any) => (
                  <OfferCard
                    key={offer.id || offer._id}
                    offer={offer}
                    onViewDetails={handleViewDetails}
                    onMakeOffer={handleMakeOffer}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg mb-2">Aucune offre disponible pour le moment</p>
                <p className="text-gray-500 text-sm">
                  {canCreateOffers()
                    ? 'Cr\u00E9ez votre premi\u00E8re offre pour commencer'
                    : 'Revenez plus tard pour voir les nouvelles offres'}
                </p>
                {canCreateOffers() && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-6 py-2 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors duration-200"
                  >
                    Cr&eacute;er une offre
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <MyResponsesSection />
        )}
      </div>

      {/* Modals */}
      {canCreateOffers() && user?.sellerCategory && (user.sellerCategory === 'importateur' || user.sellerCategory === 'grossiste') && (
        <CreateOfferModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOffer}
          sellerCategory={user.sellerCategory}
        />
      )}

      <OfferDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedOffer(null)
        }}
        offer={selectedOffer}
        onSubmitResponse={handleSubmitResponse}
        canRespond={true}
      />
    </div>
  )
}
