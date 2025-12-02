'use client'

import type { B2BResponseWithDetails } from '@/lib/supabase/types'

type ResponseCardProps = {
  response: B2BResponseWithDetails
  onAccept?: (responseId: string) => void
  onReject?: (responseId: string) => void
  onWithdraw?: (responseId: string) => void
  isOwner?: boolean // Is the current user the seller (offer owner)?
  isLoading?: boolean
}

export default function ResponseCard({
  response,
  onAccept,
  onReject,
  onWithdraw,
  isOwner = false,
  isLoading = false,
}: ResponseCardProps) {
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
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const getStatusBadge = () => {
    switch (response.status) {
      case 'pending':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            En attente
          </span>
        )
      case 'accepted':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Accepté
          </span>
        )
      case 'rejected':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Refusé
          </span>
        )
      case 'withdrawn':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Retiré
          </span>
        )
      default:
        return null
    }
  }

  const getResponseTypeLabel = () => {
    return response.response_type === 'bid' ? 'Enchère' : 'Négociation'
  }

  const isPending = response.status === 'pending'
  const canManage = isOwner && isPending && !isLoading
  const canWithdraw = !isOwner && isPending && !isLoading

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card-sm hover:shadow-card-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">
              {isOwner ? response.buyer_name : response.offer_title}
            </h3>
            <span className="px-2 py-1 text-xs font-medium rounded bg-brand-primary/10 text-brand-primary">
              {getResponseTypeLabel()}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {formatDate(response.created_at)}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Offer Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">
            {response.response_type === 'bid' ? 'Montant de l&apos;enchère' : 'Prix proposé'}
          </span>
          <span className="text-lg font-bold text-gray-900">{formatPrice(response.amount)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">Quantité</span>
          <span className="font-semibold text-gray-900">{response.quantity} unités</span>
        </div>

        {!isOwner && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Vendeur</span>
            <span className="font-medium text-gray-900">{response.seller_name}</span>
          </div>
        )}
      </div>

      {/* Message */}
      {response.message && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Message</p>
          <p className="text-sm text-gray-700">{response.message}</p>
        </div>
      )}

      {/* Actions for Owner (Seller) */}
      {canManage && onAccept && onReject && response.response_type === 'negotiation' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onAccept(response.id)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accepter
          </button>
          <button
            onClick={() => onReject(response.id)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refuser
          </button>
        </div>
      )}

      {/* Reject only for bids */}
      {canManage && onReject && response.response_type === 'bid' && (
        <div className="mt-4">
          <button
            onClick={() => onReject(response.id)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refuser l&apos;enchère
          </button>
        </div>
      )}

      {/* Actions for Buyer */}
      {canWithdraw && onWithdraw && (
        <div className="mt-4">
          <button
            onClick={() => onWithdraw(response.id)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retirer l&apos;offre
          </button>
        </div>
      )}

      {/* Info for completed responses */}
      {response.status === 'accepted' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Cette {response.response_type === 'bid' ? 'enchère' : 'négociation'} a été acceptée.
            {isOwner && ' Contactez l\'acheteur pour finaliser la transaction.'}
          </p>
        </div>
      )}
    </div>
  )
}
