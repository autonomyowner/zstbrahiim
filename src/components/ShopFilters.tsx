'use client'

import * as React from 'react'
import { productCategoryOptions, type FilterState } from '@/data/products'

type ShopFiltersProps = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onResetFilters: () => void
  productCounts: {
    inStock: number
    outOfStock: number
  }
}

const marketplaceCategories = [
  { id: '', label: 'Toutes les annonces' },
  ...productCategoryOptions.map((category) => ({
    id: category,
    label: category,
  })),
  { id: 'winter', label: 'Winter drop' },
  { id: 'services', label: 'Services & B2B' },
  { id: 'freelance', label: 'Freelancers' },
]

export const ShopFilters = ({
  filters,
  onFiltersChange,
  onResetFilters,
  productCounts,
}: ShopFiltersProps): JSX.Element => {
  const categoriesScrollRef = React.useRef<HTMLDivElement>(null)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleCategorySelect = (categoryId: string): void => {
    updateFilter('category', categoryId)
  }

  const scrollCategories = (direction: 'left' | 'right'): void => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft = categoriesScrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      categoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const handlePriceChange = (range: [number, number]): void => {
    updateFilter('priceRange', { min: range[0], max: range[1] })
  }

  const priceRangeOptions = [
    { label: '0 DA - 10.000 DA', min: 0, max: 10000 },
    { label: '10.000 DA - 50.000 DA', min: 10000, max: 50000 },
    { label: '50.000 DA - 100.000 DA', min: 50000, max: 100000 },
  ]

  const handlePriceRangeSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedIndex = parseInt(event.target.value)
    if (selectedIndex >= 0) {
      const selectedRange = priceRangeOptions[selectedIndex]
      updateFilter('priceRange', { min: selectedRange.min, max: selectedRange.max })
    }
  }

  const availabilityOptions = [
    { value: 'all', label: 'Tous', count: filters.availability === 'all' ? productCounts.inStock + productCounts.outOfStock : undefined },
    { value: 'in-stock', label: `En stock (${productCounts.inStock})` },
    { value: 'out-of-stock', label: `Épuisé (${productCounts.outOfStock})` },
  ]

  return (
    <section className="rounded-3xl border border-brand-border bg-white/90 p-6 shadow-card-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        {availabilityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateFilter('availability', option.value as FilterState['availability'])}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              filters.availability === option.value
                ? 'border-brand-dark bg-brand-dark text-text-inverted'
                : 'border-brand-border text-text-muted hover:border-brand-dark/40'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
          Catégories rapides
        </p>
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white border border-brand-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-dark hover:text-white"
            aria-label="Défiler vers la gauche"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <div ref={categoriesScrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {marketplaceCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`flex-shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  filters.category === category.id
                    ? 'border-brand-dark bg-brand-dark text-text-inverted shadow-md'
                    : 'border-brand-border text-text-muted hover:text-text-primary'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white border border-brand-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-dark hover:text-white"
            aria-label="Défiler vers la droite"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6">
        <div className="w-full rounded-2xl border border-brand-border bg-white/70 p-5 shadow-card-sm lg:max-w-sm">
          <label htmlFor="budget-select" className="block text-sm font-semibold text-text-primary mb-3">
            Budget cible
          </label>
          <select
            id="budget-select"
            onChange={handlePriceRangeSelect}
            className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-text-primary shadow-sm transition hover:border-brand-dark focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          >
            <option value="">Sélectionner une fourchette de prix</option>
            {priceRangeOptions.map((option, index) => (
              <option key={index} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
        <p>
          {productCounts.inStock} articles disponibles • {productCounts.outOfStock} en réapprovisionnement.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center justify-center rounded-full border border-brand-border p-2 text-text-primary hover:border-brand-dark hover:bg-brand-dark hover:text-white transition"
          aria-label="Réinitialiser les filtres"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
        </button>
      </div>
    </section>
  )
}
