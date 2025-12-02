'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { B2BOfferWithDetails, CreateB2BResponseRequest } from '@/lib/supabase/types'
import { getBidHistory, hasUserResponded } from '@/lib/supabase/b2b-responses'
import { getCurrentUserProfile } from '@/lib/supabase/auth'
import ResponsesManagementSection from './ResponsesManagementSection'

type OfferDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  offer: B2BOfferWithDetails | null
  onSubmitResponse: (responseData: CreateB2BResponseRequest) => Promise<void>
  canRespond?: boolean
  isOwner?: boolean // Is the current user the offer owner
}

export default function OfferDetailsModal({
  isOpen,
  onClose,
  offer,
  onSubmitResponse,
  canRespond = true,
  isOwner = false,
}: OfferDetailsModalProps) {
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bidHistory, setBidHistory] = useState<any[]>([])
  const [loadingBids, setLoadingBids] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'responses'>('details')
  const [userHasResponded, setUserHasResponded] = useState(false)
  const [checkingResponse, setCheckingResponse] = useState(false)

  useEffect(() => {
    if (offer && offer.offer_type === 'auction' && isOpen) {
      loadBidHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer, isOpen])

  useEffect(() => {
    if (offer && isOpen && canRespond && !isOwner) {
      checkUserResponse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer, isOpen, canRespond, isOwner])

  const checkUserResponse = async () => {
    if (!offer) return
    setCheckingResponse(true)
    try {
      const hasResponse = await hasUserResponded(offer.id)
      setUserHasResponded(hasResponse)
    } catch (error) {
      console.error('Error checking user response:', error)
    } finally {
      setCheckingResponse(false)
    }
  }

  const loadBidHistory = async () => {
    if (!offer) return
    setLoadingBids(true)
    try {
      const bids = await getBidHistory(offer.id)
      setBidHistory(bids)
    } catch (error) {
      console.error('Error loading bid history:', error)
    } finally {
      setLoadingBids(false)
    }
  }

  if (!isOpen || !offer) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const amountValue = Number(amount)
    const quantityValue = Number(quantity)

    if (!amount || amountValue <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0'
    }

    if (offer.offer_type === 'auction') {
      const minimumBid = offer.current_bid || offer.base_price
      if (amountValue <= minimumBid) {
        newErrors.amount = `Votre enchère doit être supérieure à ${formatPrice(minimumBid)}`
      }
    }

    if (!quantity || quantityValue <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0'
    }

    if (quantityValue < offer.min_quantity) {
      newErrors.quantity = `La quantité minimale est ${offer.min_quantity} unités`
    }

    if (quantityValue > offer.available_quantity) {
      newErrors.quantity = `La quantité disponible est ${offer.available_quantity} unités`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmitResponse({
        offer_id: offer.id,
        response_type: offer.offer_type === 'auction' ? 'bid' : 'negotiation',
        amount: Number(amount),
        quantity: Number(quantity),
        message: message || undefined,
      })
      // Reset form
      setAmount('')
      setQuantity('')
      setMessage('')
      setUserHasResponded(true) // Update state to reflect new response
      onClose()
    } catch (error: any) {
      console.error('Error submitting response:', error)
      setErrors({ submit: error.message || 'Erreur lors de la soumission' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{offer.title}</h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span>{offer.seller_name}</span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {offer.seller_category === 'importateur' ? 'Importateur' : 'Grossiste'}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    offer.offer_type === 'auction'
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {offer.offer_type === 'auction' ? 'Enchère' : 'Négociable'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Tabs for owner */}
            {isOwner && (
              <div className="flex gap-4 mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    activeTab === 'details'
                      ? 'bg-brand-dark text-brand-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Détails de l&apos;offre
                </button>
                <button
                  onClick={() => setActiveTab('responses')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    activeTab === 'responses'
                      ? 'bg-brand-dark text-brand-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Réponses reçues ({offer.total_responses_count || 0})
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Show Responses Tab for Owner */}
            {isOwner && activeTab === 'responses' ? (
              <ResponsesManagementSection offerId={offer.id} offerTitle={offer.title} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                {/* Images */}
                {offer.images && offer.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {offer.images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`${offer.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{offer.description}</p>
                </div>

                {/* Tags */}
                {offer.tags && offer.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {offer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bid History for Auctions */}
                {offer.offer_type === 'auction' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Historique des enchères</h3>
                    {loadingBids ? (
                      <p className="text-gray-600">Chargement...</p>
                    ) : bidHistory.length > 0 ? (
                      <div className="space-y-2">
                        {bidHistory.slice(0, 5).map((bid, index) => (
                          <div
                            key={bid.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0 ? 'bg-brand-primary/10' : 'bg-gray-50'
                            }`}
                          >
                            <div>
                              <span className="font-medium text-gray-900">{bid.buyer_name}</span>
                              {index === 0 && (
                                <span className="ml-2 text-xs text-brand-primary font-semibold">
                                  Enchère la plus élevée
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-gray-900">{formatPrice(bid.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Aucune enchère pour le moment</p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Pricing & Action */}
              <div className="space-y-4">
                {/* Price Card */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {offer.offer_type === 'auction' ? 'Enchère actuelle' : 'Prix de base'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(offer.current_bid || offer.base_price)}
                    </div>
                    {offer.offer_type === 'auction' && offer.current_bid && (
                      <div className="text-xs text-gray-500 mt-1">
                        Prix de départ: {formatPrice(offer.base_price)}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantité disponible</span>
                      <span className="font-semibold text-gray-900">{offer.available_quantity} unités</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantité minimale</span>
                      <span className="font-semibold text-gray-900">{offer.min_quantity} unités</span>
                    </div>
                  </div>

                  {offer.offer_type === 'auction' && offer.ends_at && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Se termine le</div>
                      <div className="font-semibold text-gray-900">{formatDate(offer.ends_at)}</div>
                    </div>
                  )}
                </div>

                {/* Response Form */}
                {canRespond && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {offer.offer_type === 'auction' ? 'Placer une enchère' : 'Faire une offre'}
                    </h3>

                    {userHasResponded && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Vous avez déjà une offre en attente sur cette offre. Consultez l&apos;onglet &quot;Mes offres soumises&quot; pour la gérer ou la retirer.
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                          {offer.offer_type === 'auction' ? 'Montant de l\'enchère (DZD)' : 'Votre prix proposé (DZD)'}
                        </label>
                        <input
                          type="number"
                          id="amount"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value)
                            if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                            errors.amount ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                      </div>

                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantité souhaitée
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => {
                            setQuantity(e.target.value)
                            if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }))
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                            errors.quantity ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={`Min: ${offer.min_quantity}`}
                          min={offer.min_quantity}
                          max={offer.available_quantity}
                        />
                        {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                      </div>

                      {offer.offer_type === 'negotiable' && (
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Message (optionnel)
                          </label>
                          <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            placeholder="Ajoutez un message..."
                          />
                        </div>
                      )}

                      {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting || userHasResponded || checkingResponse}
                      >
                        {checkingResponse
                          ? 'Vérification...'
                          : isSubmitting
                          ? 'Envoi...'
                          : userHasResponded
                          ? 'Vous avez déjà une offre en attente'
                          : offer.offer_type === 'auction' ? 'Enchérir' : 'Soumettre l\'offre'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Contact Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Informations du vendeur</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-900">{offer.seller_name}</span></p>
                    <p>{offer.seller_category === 'importateur' ? 'Importateur' : 'Grossiste'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {offer.total_responses_count} offres reçues
                    </p>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
