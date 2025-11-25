'use client'

import { useState, useEffect } from 'react'
import type { B2BResponseWithDetails, B2BResponseStatus, B2BResponseType } from '@/lib/supabase/types'
import {
  getOfferResponses,
  acceptNegotiation,
  rejectResponse,
} from '@/lib/supabase/b2b-responses'
import ResponseCard from './ResponseCard'

type ResponsesManagementSectionProps = {
  offerId: string
  offerTitle: string
}

export default function ResponsesManagementSection({
  offerId,
  offerTitle,
}: ResponsesManagementSectionProps) {
  const [responses, setResponses] = useState<B2BResponseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<B2BResponseStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<B2BResponseType | 'all'>('all')

  useEffect(() => {
    loadResponses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId, statusFilter, typeFilter])

  const loadResponses = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      if (typeFilter !== 'all') {
        filters.responseType = typeFilter
      }

      const data = await getOfferResponses(offerId, filters)
      setResponses(data)
    } catch (err: any) {
      console.error('Error loading responses:', err)
      setError(err.message || 'Erreur lors du chargement des réponses')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (responseId: string) => {
    try {
      setActionLoading(responseId)
      setError(null)
      await acceptNegotiation(responseId)
      await loadResponses() // Reload to show updated status
    } catch (err: any) {
      console.error('Error accepting response:', err)
      setError(err.message || 'Erreur lors de l\'acceptation')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (responseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser cette offre ?')) {
      return
    }

    try {
      setActionLoading(responseId)
      setError(null)
      await rejectResponse(responseId)
      await loadResponses() // Reload to show updated status
    } catch (err: any) {
      console.error('Error rejecting response:', err)
      setError(err.message || 'Erreur lors du refus')
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
        <h3 className="text-xl font-bold text-gray-900">{offerTitle}</h3>
        <p className="text-sm text-gray-600 mt-1">Gérez les offres et enchères reçues</p>
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
          <p className="mt-4 text-gray-600">Chargement des réponses...</p>
        </div>
      ) : responses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses.map((response) => (
            <ResponseCard
              key={response.id}
              response={response}
              onAccept={handleAccept}
              onReject={handleReject}
              isOwner={true}
              isLoading={actionLoading === response.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">Aucune réponse pour le moment</p>
          <p className="text-sm text-gray-500 mt-2">
            Les offres et enchères apparaîtront ici une fois reçues
          </p>
        </div>
      )}
    </div>
  )
}
