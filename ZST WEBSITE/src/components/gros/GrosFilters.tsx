'use client'

import { useState, useEffect } from 'react'

export type GrosFilterState = {
  category: string
  priceRange: { min: number; max: number }
  minQuantityRange: { min: number; max: number }
  inStock: boolean | null
  search: string
}

type GrosFiltersProps = {
  filters: GrosFilterState
  onFiltersChange: (filters: GrosFilterState) => void
  onResetFilters: () => void
  productCount: number
  categories: string[]
}

const priceRangeOptions = [
  { label: 'Tous les prix', min: 0, max: 100000 },
  { label: '0 - 5.000 DA', min: 0, max: 5000 },
  { label: '5.000 - 10.000 DA', min: 5000, max: 10000 },
  { label: '10.000 - 20.000 DA', min: 10000, max: 20000 },
  { label: '20.000 - 50.000 DA', min: 20000, max: 50000 },
  { label: '50.000+ DA', min: 50000, max: 100000 },
]

const minQuantityOptions = [
  { label: 'Toutes quantités', min: 1, max: 100000 },
  { label: '1 - 10 unités', min: 1, max: 10 },
  { label: '10 - 50 unités', min: 10, max: 50 },
  { label: '50 - 100 unités', min: 50, max: 100 },
  { label: '100 - 500 unités', min: 100, max: 500 },
  { label: '500 - 1000 unités', min: 500, max: 1000 },
  { label: '1000+ unités', min: 1000, max: 100000 },
]

export function GrosFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  productCount,
  categories,
}: GrosFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, filters, onFiltersChange])

  const updateFilter = <K extends keyof GrosFilterState>(key: K, value: GrosFilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value)
    if (index >= 0 && index < priceRangeOptions.length) {
      const option = priceRangeOptions[index]
      updateFilter('priceRange', { min: option.min, max: option.max })
    }
  }

  const handleMinQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value)
    if (index >= 0 && index < minQuantityOptions.length) {
      const option = minQuantityOptions[index]
      updateFilter('minQuantityRange', { min: option.min, max: option.max })
    }
  }

  const getCurrentPriceIndex = () => {
    return priceRangeOptions.findIndex(
      (opt) => opt.min === filters.priceRange.min && opt.max === filters.priceRange.max
    )
  }

  const getCurrentQuantityIndex = () => {
    return minQuantityOptions.findIndex(
      (opt) => opt.min === filters.minQuantityRange.min && opt.max === filters.minQuantityRange.max
    )
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-white/95 backdrop-blur-sm p-4 sm:p-6 shadow-card-sm space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher des produits..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full rounded-xl border border-brand-border/50 bg-white px-4 py-2.5 pr-10 text-sm focus:border-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark/20"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Filter - Horizontal scrollable chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">
          Catégorie
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => updateFilter('category', '')}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              filters.category === ''
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-brand-border/20 text-text-muted hover:bg-brand-border/40'
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateFilter('category', cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                filters.category === cat
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'bg-brand-border/20 text-text-muted hover:bg-brand-border/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price & Quantity Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Price Range */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">
            Prix unitaire
          </label>
          <select
            value={getCurrentPriceIndex()}
            onChange={handlePriceRangeChange}
            className="w-full rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
          >
            {priceRangeOptions.map((option, index) => (
              <option key={index} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Quantity Range */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">
            Quantité minimale
          </label>
          <select
            value={getCurrentQuantityIndex()}
            onChange={handleMinQuantityChange}
            className="w-full rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
          >
            {minQuantityOptions.map((option, index) => (
              <option key={index} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">
            Disponibilité
          </label>
          <select
            value={filters.inStock === null ? 'all' : filters.inStock ? 'in-stock' : 'out-of-stock'}
            onChange={(e) => {
              const val = e.target.value
              updateFilter('inStock', val === 'all' ? null : val === 'in-stock')
            }}
            className="w-full rounded-xl border border-brand-border/50 bg-white px-3 py-2 text-sm focus:border-brand-dark focus:outline-none"
          >
            <option value="all">Tous</option>
            <option value="in-stock">En stock</option>
            <option value="out-of-stock">Épuisé</option>
          </select>
        </div>

        {/* Results & Reset */}
        <div className="flex items-end justify-between sm:justify-end gap-3">
          <span className="text-sm text-brand-dark/60">
            {productCount} {productCount > 1 ? 'produits' : 'produit'}
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-xl bg-brand-border/20 px-4 py-2 text-xs font-medium text-brand-dark hover:bg-brand-border/40 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  )
}

export const createDefaultGrosFilters = (): GrosFilterState => ({
  category: '',
  priceRange: { min: 0, max: 100000 },
  minQuantityRange: { min: 1, max: 100000 },
  inStock: null,
  search: '',
})
