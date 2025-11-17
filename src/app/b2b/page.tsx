'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  B2BOfferWithDetails,
  B2BOfferType,
  CreateB2BOfferRequest,
  CreateB2BResponseRequest,
  SellerCategory,
} from '@/lib/supabase/types'
import { getCurrentUser } from '@/lib/supabase/client'
import { getAvailableOffers, createOffer } from '@/lib/supabase/b2b-offers'
import { createResponse } from '@/lib/supabase/b2b-responses'
import OfferCard from '@/components/b2b/OfferCard'
import OfferFilters from '@/components/b2b/OfferFilters'
import CreateOfferModal from '@/components/b2b/CreateOfferModal'
import OfferDetailsModal from '@/components/b2b/OfferDetailsModal'
import MyResponsesSection from '@/components/b2b/MyResponsesSection'

export default function B2BMarketplacePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [offers, setOffers] = useState<B2BOfferWithDetails[]>([])
  const [filteredOffers, setFilteredOffers] = useState<B2BOfferWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'ending_soon'>('newest')
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
  const [selectedOffer, setSelectedOffer] = useState<B2BOfferWithDetails | null>(null)

  useEffect(() => {
    loadUserAndOffers()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [offers, filters, sortBy])

  const loadUserAndOffers = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login?redirect=/b2b')
        return
      }

      setUser(currentUser)

      // Get user profile with seller_category
      const { supabase } = await import('@/lib/supabase/client')
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      setUserProfile(profile)

      // Check if user is a seller
      if (profile?.role !== 'seller') {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      // Load offers
      await loadOffers()
    } catch (error) {
      console.error('Error loading user and offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOffers = async () => {
    try {
      const availableOffers = await getAvailableOffers(filters, sortBy)
      setOffers(availableOffers)
    } catch (error) {
      console.error('Error loading offers:', error)
    }
  }

  const applyFiltersAndSort = () => {
    let result = [...offers]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (offer) =>
          offer.title.toLowerCase().includes(searchLower) ||
          offer.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply offer type filter
    if (filters.offerType) {
      result = result.filter((offer) => offer.offer_type === filters.offerType)
    }

    // Apply price filters
    if (filters.minPrice) {
      result = result.filter((offer) => offer.base_price >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      result = result.filter((offer) => offer.base_price <= filters.maxPrice!)
    }

    // Apply sorting
    result.sort((a, b) => {
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

    setFilteredOffers(result)
  }

  const handleCreateOffer = async (offerData: CreateB2BOfferRequest) => {
    try {
      await createOffer(offerData)
      alert('Offre créée avec succès!')
      await loadOffers()
    } catch (error: any) {
      console.error('Error creating offer:', error)
      throw new Error(error.message || 'Erreur lors de la création de l\'offre')
    }
  }

  const handleSubmitResponse = async (responseData: CreateB2BResponseRequest) => {
    try {
      await createResponse(responseData)
      alert(
        responseData.response_type === 'bid'
          ? 'Enchère placée avec succès!'
          : 'Offre soumise avec succès!'
      )
      await loadOffers()
    } catch (error: any) {
      console.error('Error submitting response:', error)
      throw new Error(error.message || 'Erreur lors de la soumission')
    }
  }

  const handleViewDetails = (offer: B2BOfferWithDetails) => {
    setSelectedOffer(offer)
    setShowDetailsModal(true)
  }

  const handleMakeOffer = (offer: B2BOfferWithDetails) => {
    setSelectedOffer(offer)
    setShowDetailsModal(true)
  }

  const canCreateOffers = () => {
    return userProfile?.seller_category === 'importateur' || userProfile?.seller_category === 'grossiste'
  }

  const getWelcomeMessage = () => {
    const category = userProfile?.seller_category as SellerCategory
    if (category === 'fournisseur') {
      return 'Bienvenue dans l\'espace Grossistes - Découvrez les offres disponibles pour votre activité'
    } else if (category === 'grossiste') {
      return 'Bienvenue dans l\'espace Importateurs - Trouvez les meilleures offres pour votre entreprise'
    } else if (category === 'importateur') {
      return 'Bienvenue dans l\'espace B2B - Créez et gérez vos offres pour les grossistes'
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Accès B2B Réservé aux Vendeurs Professionnels
              </h1>

              <p className="text-lg text-gray-700 mb-6">
                Le marché B2B de ZST est exclusivement accessible aux comptes vendeurs professionnels.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Pour accéder à cette section, vous devez être :
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-gray-900">Fournisseur (Détaillant)</span>
                      <p className="text-gray-600 text-sm mt-1">Accédez aux offres des grossistes et importateurs</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-gray-900">Importateur</span>
                      <p className="text-gray-600 text-sm mt-1">Créez des offres pour les grossistes</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-brand-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-gray-900">Grossiste</span>
                      <p className="text-gray-600 text-sm mt-1">Créez des offres pour les détaillants</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                >
                  Créer un compte vendeur
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg border-2 border-gray-300 transition-colors duration-200"
                >
                  Retour à l'accueil
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Marché B2B ZST
              </h1>
              <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>
            {canCreateOffers() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors duration-200"
              >
                Créer une offre
              </button>
            )}
          </div>

          {/* User Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">
                {userProfile.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{userProfile.full_name}</div>
              <div className="text-sm text-gray-600">
                {userProfile.seller_category === 'importateur'
                  ? 'Importateur'
                  : userProfile.seller_category === 'grossiste'
                  ? 'Grossiste'
                  : 'Fournisseur (Détaillant)'}
              </div>
            </div>
          </div>
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
                {filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
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
                    ? 'Créez votre première offre pour commencer'
                    : 'Revenez plus tard pour voir les nouvelles offres'}
                </p>
                {canCreateOffers() && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-6 py-2 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors duration-200"
                  >
                    Créer une offre
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
      {canCreateOffers() && (
        <CreateOfferModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOffer}
          sellerCategory={userProfile.seller_category}
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
