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
    <section className="rounded-2xl border border-brand-border/50 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        {availabilityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateFilter('availability', option.value as FilterState['availability'])}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
              filters.availability === option.value
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-brand-border/20 text-text-muted hover:bg-brand-border/40 hover:text-text-primary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="hidden lg:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-7 h-7 rounded-full bg-white/95 border border-brand-border/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-brand-dark hover:text-white hover:border-brand-dark"
            aria-label="Défiler vers la gauche"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <div ref={categoriesScrollRef} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {marketplaceCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  filters.category === category.id
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-brand-border/20 text-text-muted hover:bg-brand-border/40 hover:text-text-primary'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-7 h-7 rounded-full bg-white/95 border border-brand-border/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-brand-dark hover:text-white hover:border-brand-dark"
            aria-label="Défiler vers la droite"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          id="budget-select"
          onChange={handlePriceRangeSelect}
          className="rounded-full border border-brand-border/50 bg-white px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-brand-dark/30 focus:border-brand-dark focus:outline-none"
        >
          <option value="">Budget</option>
          {priceRangeOptions.map((option, index) => (
            <option key={index} value={index}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {productCounts.inStock} disponibles
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-full p-1.5 text-text-muted transition-all duration-200 hover:bg-brand-border/30 hover:text-text-primary"
            aria-label="Réinitialiser les filtres"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
