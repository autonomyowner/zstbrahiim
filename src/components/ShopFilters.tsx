'use client'

import * as React from 'react'
import { productCategoryOptions, type FilterState } from '@/data/products'
import { BudgetSlider } from './BudgetSlider'

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
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleCategorySelect = (categoryId: string): void => {
    updateFilter('category', categoryId)
  }

  const handlePriceChange = (range: [number, number]): void => {
    updateFilter('priceRange', { min: range[0], max: range[1] })
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
        <div className="flex flex-wrap gap-3">
          {marketplaceCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                filters.category === category.id
                  ? 'border-brand-dark bg-brand-dark text-text-inverted shadow-md'
                  : 'border-brand-border text-text-muted hover:text-text-primary'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6">
        <div className="w-full rounded-2xl border border-brand-border bg-white/70 p-5 shadow-card-sm lg:max-w-sm">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <p className="font-semibold text-text-primary">Budget cible</p>
            <span>
              {filters.priceRange.min.toLocaleString()} DA - {filters.priceRange.max.toLocaleString()} DA
            </span>
          </div>
          <div className="mt-4">
            <BudgetSlider
              min={0}
              max={900000}
              step={1000}
              value={[filters.priceRange.min, filters.priceRange.max]}
              onValueChange={handlePriceChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
        <p>
          {productCounts.inStock} articles disponibles • {productCounts.outOfStock} en réapprovisionnement.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-primary hover:border-brand-dark"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Réinitialiser
        </button>
      </div>
    </section>
  )
}
