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

// Marketplace categories synced with mobile app
const marketplaceCategories = [
  { id: '', label: 'Tous' },
  ...productCategoryOptions.map((category) => ({
    id: category,
    label: category,
  })),
]

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)

export const ShopFilters = ({
  filters,
  onFiltersChange,
  onResetFilters,
  productCounts,
}: ShopFiltersProps): JSX.Element => {
  const categoriesScrollRef = React.useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(true)
  const [showFilterSheet, setShowFilterSheet] = React.useState(false)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleCategorySelect = (categoryId: string): void => {
    updateFilter('category', categoryId)
  }

  const checkScrollPosition = React.useCallback(() => {
    if (categoriesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  React.useEffect(() => {
    checkScrollPosition()
    const ref = categoriesScrollRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScrollPosition)
      return () => ref.removeEventListener('scroll', checkScrollPosition)
    }
  }, [checkScrollPosition])

  const scrollCategories = (direction: 'left' | 'right'): void => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 200
      const newScrollLeft = categoriesScrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      categoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const priceRangeOptions = [
    { label: '0 - 10K DA', min: 0, max: 10000 },
    { label: '10K - 50K DA', min: 10000, max: 50000 },
    { label: '50K - 100K DA', min: 50000, max: 100000 },
    { label: '100K+ DA', min: 100000, max: 900000 },
  ]

  const handlePriceRangeSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedIndex = parseInt(event.target.value)
    if (selectedIndex >= 0) {
      const selectedRange = priceRangeOptions[selectedIndex]
      updateFilter('priceRange', { min: selectedRange.min, max: selectedRange.max })
    }
  }

  const availabilityOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'in-stock', label: `En stock` },
    { value: 'out-of-stock', label: `Épuisé` },
  ]

  const hasActiveFilters = filters.category !== '' || filters.availability !== 'all' || filters.priceRange.min > 0 || filters.priceRange.max < 900000 || filters.searchQuery !== ''

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-brand-border/30 bg-white p-4 sm:p-5 shadow-subtle">
      {/* Search bar + filter trigger on mobile */}
      <div className="mb-4 sm:mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full rounded-full border border-brand-border bg-brand-surface-muted pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-200 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[44px]"
            />
          </div>
          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setShowFilterSheet(true)}
            className="md:hidden flex-shrink-0 rounded-full border border-brand-border bg-brand-surface-muted px-4 min-h-[44px] text-xs font-semibold text-text-primary transition-all hover:border-brand-dark/40"
          >
            Filtres
            {hasActiveFilters && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-dark text-[9px] text-brand-primary">!</span>
            )}
          </button>
        </div>
      </div>

      {/* Availability filters - hidden on mobile (in bottom sheet) */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        {availabilityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateFilter('availability', option.value as FilterState['availability'])}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${
              filters.availability === option.value
                ? 'bg-brand-dark text-brand-primary shadow-subtle'
                : 'bg-brand-surface-muted text-text-muted hover:bg-brand-border/40 hover:text-text-primary'
            }`}
          >
            {option.label}
            {option.value === 'in-stock' && (
              <span className="ml-1.5 text-[10px] opacity-70">({productCounts.inStock})</span>
            )}
            {option.value === 'out-of-stock' && (
              <span className="ml-1.5 text-[10px] opacity-70">({productCounts.outOfStock})</span>
            )}
          </button>
        ))}
      </div>

      {/* Category filters - always visible (horizontal scroll works great on mobile) */}
      <div className="mt-3 md:mt-5">
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className={`hidden lg:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-white border border-brand-border shadow-card-sm transition-all duration-200 hover:bg-brand-dark hover:text-brand-primary hover:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${
              showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Défiler vers la gauche"
          >
            <ChevronLeftIcon />
          </button>

          <div
            ref={categoriesScrollRef}
            className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth"
          >
            {marketplaceCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`flex-shrink-0 rounded-full px-3.5 sm:px-4 py-2 sm:py-2 text-xs sm:text-[13px] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 min-h-[36px] ${
                  filters.category === category.id
                    ? 'bg-brand-dark text-brand-primary shadow-subtle'
                    : 'bg-brand-surface-muted text-text-muted hover:bg-brand-border/40 hover:text-text-primary'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className={`hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-white border border-brand-border shadow-card-sm transition-all duration-200 hover:bg-brand-dark hover:text-brand-primary hover:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${
              showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Défiler vers la droite"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Bottom row: Budget dropdown + stats + reset - hidden on mobile */}
      <div className="hidden md:flex mt-5 flex-wrap items-center gap-3 pt-4 border-t border-brand-border/30">
        <div className="relative">
          <select
            id="budget-select"
            onChange={handlePriceRangeSelect}
            className="appearance-none rounded-full border border-brand-border bg-white pl-4 pr-8 py-2 text-[13px] font-medium text-text-primary cursor-pointer transition-all duration-200 hover:border-brand-dark/40 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="">Budget</option>
            {priceRangeOptions.map((option, index) => (
              <option key={index} value={index}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-3.5 h-3.5 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[13px] text-text-muted font-medium">
            <span className="font-semibold text-text-primary">{productCounts.inStock}</span> disponibles
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="group inline-flex items-center gap-1.5 rounded-full bg-brand-surface-muted px-3 py-1.5 text-xs font-medium text-text-muted transition-all duration-200 hover:bg-brand-dark hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              aria-label="Réinitialiser les filtres"
            >
              <span className="transition-transform duration-200 group-hover:rotate-180">
                <RefreshIcon />
              </span>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilterSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 animate-slide-up-sheet safe-area-pb" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">Filtres</h3>
              <button
                type="button"
                onClick={() => setShowFilterSheet(false)}
                className="rounded-full bg-brand-surface-muted px-4 py-2 text-xs font-semibold text-text-primary min-h-[44px]"
              >
                Fermer
              </button>
            </div>

            {/* Availability */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-3">Disponibilité</p>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFilter('availability', option.value as FilterState['availability'])}
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
                      filters.availability === option.value
                        ? 'bg-brand-dark text-brand-primary shadow-subtle'
                        : 'bg-brand-surface-muted text-text-muted'
                    }`}
                  >
                    {option.label}
                    {option.value === 'in-stock' && ` (${productCounts.inStock})`}
                    {option.value === 'out-of-stock' && ` (${productCounts.outOfStock})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-3">Budget</p>
              <div className="flex flex-wrap gap-2">
                {priceRangeOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => updateFilter('priceRange', { min: option.min, max: option.max })}
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
                      filters.priceRange.min === option.min && filters.priceRange.max === option.max
                        ? 'bg-brand-dark text-brand-primary shadow-subtle'
                        : 'bg-brand-surface-muted text-text-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-brand-border/30">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    onResetFilters()
                    setShowFilterSheet(false)
                  }}
                  className="flex-1 rounded-xl border border-brand-border bg-white py-3.5 text-sm font-bold text-text-primary min-h-[48px]"
                >
                  Réinitialiser
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 rounded-xl bg-brand-dark py-3.5 text-sm font-bold text-brand-primary min-h-[48px]"
              >
                Voir {productCounts.inStock} produits
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
