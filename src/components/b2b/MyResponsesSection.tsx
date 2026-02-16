'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import ResponseCard from './ResponseCard'

type B2BResponseStatus = 'pending' | 'accepted' | 'rejected' | 'outbid' | 'withdrawn'
type B2BResponseType = 'bid' | 'negotiation'
type B2BResponseWithDetails = {
  id: string
  offer_id: string
  buyer_id: string
  response_type: B2BResponseType
  status: B2BResponseStatus
  amount: number
  quantity: number
  message: string | null
  created_at: string
  updated_at: string
  offer_title: string
  seller_id: string
  offer_type: 'negotiable' | 'auction'
  offer_status: string
  buyer_name: string
  buyer_category: string
  seller_name: string
  seller_category: string
}

export default function MyResponsesSection() {
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<B2BResponseStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<B2BResponseType | 'all'>('all')

  const responsesData = useQuery(api.b2bResponses.getMyResponses, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    responseType: typeFilter !== 'all' ? typeFilter : undefined,
  })
  const responses = (responsesData ?? []) as any as B2BResponseWithDetails[]
  const loading = responsesData === undefined

  const withdrawResponseMutation = useMutation(api.b2bResponses.withdrawResponse)

  const handleWithdraw = async (responseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette offre ?')) {
      return
    }

    try {
      setActionLoading(responseId)
      setError(null)
      await withdrawResponseMutation({ responseId: responseId as Id<"b2bOfferResponses"> })
    } catch (err: any) {
      console.error('Error withdrawing response:', err)
      setError(err.message || 'Erreur lors du retrait de l\'offre')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = responses.filter((r) => r.status === 'pending').length
  const acceptedCount = responses.filter((r) => r.status === 'accepted').length
  const rejectedCount = responses.filter((r) => r.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mes offres soumises</h2>
        <p className="text-sm text-gray-600 mt-1">
          Suivez le statut de vos enchères et négociations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-yellow-700 mb-1">En attente</p>
          <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-green-700 mb-1">Acceptées</p>
          <p className="text-2xl font-bold text-green-900">{acceptedCount}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-red-700 mb-1">Refusées</p>
          <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Refusées</option>
            <option value="withdrawn">Retirées</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">Tous les types</option>
            <option value="bid">Enchères</option>
            <option value="negotiation">Négociations</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Responses List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement de vos offres...</p>
        </div>
      ) : responses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses.map((response) => (
            <ResponseCard
              key={response.id}
              response={response}
              onWithdraw={handleWithdraw}
              isOwner={false}
              isLoading={actionLoading === response.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">Aucune offre soumise pour le moment</p>
          <p className="text-sm text-gray-500 mt-2">
            Vos enchères et négociations apparaîtront ici une fois soumises
          </p>
        </div>
      )}
    </div>
  )
}
