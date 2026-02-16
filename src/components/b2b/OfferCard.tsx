'use client'

import { useState, useEffect } from 'react'
type B2BOfferWithDetails = {
  id: string
  seller_id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  base_price: number
  min_quantity: number
  available_quantity: number
  offer_type: 'negotiable' | 'auction'
  status: string
  current_bid: number | null
  starts_at: string | null
  ends_at: string | null
  seller_name: string
  seller_category: string
  pending_responses_count: number
  total_responses_count: number
  highest_bid_amount: number | null
  display_status: string
  seconds_remaining: number | null
}

interface OfferCardProps {
  offer: B2BOfferWithDetails
  onViewDetails: (offer: B2BOfferWithDetails) => void
  onMakeOffer?: (offer: B2BOfferWithDetails) => void
}

export default function OfferCard({ offer, onViewDetails, onMakeOffer }: OfferCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Calculate time remaining for auctions
  useEffect(() => {
    if (offer.offer_type !== 'auction' || !offer.ends_at) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const endTime = new Date(offer.ends_at!).getTime()
      const distance = endTime - now

      if (distance < 0) {
        setTimeRemaining('Expired')
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}j ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [offer.offer_type, offer.ends_at])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const getStatusBadge = () => {
    if (offer.display_status === 'ending_soon') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">Bientôt terminé</span>
    }
    if (offer.offer_type === 'auction') {
      return <span className="px-2 py-1 text-xs font-medium bg-brand-primary/10 text-brand-primary rounded">Enchère</span>
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Négociable</span>
  }

  const getOfferTypeLabel = () => {
    return offer.offer_type === 'auction' ? 'Enchère' : 'Négociation'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-brand-primary/50 hover:shadow-md transition-all duration-200">
      <div className="p-4">
        {/* Header: Seller Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{offer.seller_name}</h3>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                {offer.total_responses_count} offres
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                {offer.seller_category === 'importateur' ? 'Importateur' : 'Grossiste'}
              </span>
            </div>
          </div>
        </div>

        {/* Offer Title */}
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-brand-primary cursor-pointer"
            onClick={() => onViewDetails(offer)}>
          {offer.title}
        </h4>

        {/* Price & Quantity Section */}
        <div className="space-y-3 mb-4">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {offer.offer_type === 'auction' ? 'Enchère actuelle' : 'Prix de base'}
            </span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(offer.current_bid || offer.base_price)}
              </div>
              {offer.offer_type === 'auction' && offer.current_bid && (
                <div className="text-xs text-gray-500">
                  Base: {formatPrice(offer.base_price)}
                </div>
              )}
            </div>
          </div>

          {/* Available Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Quantité disponible</span>
            <span className="text-sm font-semibold text-gray-900">{offer.available_quantity} unités</span>
          </div>

          {/* Min Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Quantité minimale</span>
            <span className="text-sm font-semibold text-gray-900">{offer.min_quantity} unités</span>
          </div>

          {/* Auction Timer */}
          {offer.offer_type === 'auction' && timeRemaining && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">Temps restant</span>
              <span className={`text-sm font-bold ${
                offer.display_status === 'ending_soon' ? 'text-red-600' : 'text-brand-primary'
              }`}>
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(offer)}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded transition-colors duration-200"
          >
            Voir détails
          </button>
          {onMakeOffer && (
            <button
              onClick={() => onMakeOffer(offer)}
              className="flex-1 py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded transition-colors duration-200"
            >
              {offer.offer_type === 'auction' ? 'Enchérir' : 'Faire une offre'}
            </button>
          )}
        </div>

        {/* Footer: Response Count */}
        {offer.pending_responses_count > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              {offer.pending_responses_count} {offer.pending_responses_count > 1 ? 'offres en attente' : 'offre en attente'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
