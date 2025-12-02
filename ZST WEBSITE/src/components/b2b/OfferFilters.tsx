'use client'

import { useState } from 'react'
import type { B2BOfferType } from '@/lib/supabase/types'

interface OfferFiltersProps {
  onFilterChange: (filters: {
    offerType?: B2BOfferType
    minPrice?: number
    maxPrice?: number
    search?: string
  }) => void
  onSortChange: (sortBy: 'newest' | 'price_asc' | 'price_desc' | 'ending_soon') => void
  currentSort: 'newest' | 'price_asc' | 'price_desc' | 'ending_soon'
  offersCount: number
}

export default function OfferFilters({
  onFilterChange,
  onSortChange,
  currentSort,
  offersCount,
}: OfferFiltersProps) {
  const [search, setSearch] = useState('')
  const [offerType, setOfferType] = useState<B2BOfferType | ''>('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleApplyFilters = () => {
    onFilterChange({
      offerType: offerType || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search || undefined,
    })
  }

  const handleClearFilters = () => {
    setSearch('')
    setOfferType('')
    setMinPrice('')
    setMaxPrice('')
    onFilterChange({})
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // Debounce search
    const timer = setTimeout(() => {
      onFilterChange({
        search: value || undefined,
        offerType: offerType || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      })
    }, 500)
    return () => clearTimeout(timer)
  }

  return (
    <div className="space-y-4">
      {/* Top Bar: Search and Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher des offres..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:border-brand-primary transition-colors duration-200 bg-white"
        >
          <span className="font-medium">
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </span>
        </button>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
        >
          <option value="newest">Plus récentes</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="ending_soon">Fin bientôt</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Offer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d&apos;offre
              </label>
              <select
                value={offerType}
                onChange={(e) => setOfferType(e.target.value as B2BOfferType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
              >
                <option value="">Tous les types</option>
                <option value="auction">Enchères</option>
                <option value="negotiable">Négociables</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (DZD)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="0"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (DZD)
              </label>
              <input
                type="number"
                placeholder="Illimité"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors duration-200"
            >
              Appliquer les filtres
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors duration-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{offersCount} {offersCount > 1 ? 'offres trouvées' : 'offre trouvée'}</span>
      </div>
    </div>
  )
}
