'use client'

import * as React from 'react'
import type { ProductNeed, FilterState } from '@/data/products'
import { cn } from '@/lib/utils'
import { BudgetSlider } from './BudgetSlider'

type ShopFiltersProps = {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  productCounts: {
    inStock: number
    outOfStock: number
  }
}

const needs: ProductNeed[] = ['Journée', 'Soirée', 'Quotidien', 'Spécial']

// Generic use case labels for display
const needLabels: Record<ProductNeed, string> = {
  'Journée': 'Usage quotidien',
  'Soirée': 'Occasions spéciales',
  'Quotidien': 'Tous les jours',
  'Spécial': 'Événements',
}

// Marketplace categories
const marketplaceCategories = [
  {
    id: 'electronics',
    label: 'Électronique & Technologie',
    subcategories: [
      'Téléphones & Accessoires',
      'Informatique',
      'Électroménager & Électronique',
    ],
  },
  {
    id: 'transportation',
    label: 'Transport & Pièces',
    subcategories: [
      'Automobiles & Véhicules',
      'Pièces détachées',
    ],
  },
  {
    id: 'home',
    label: 'Maison, Jardin & Meubles',
    subcategories: [
      'Meubles & Maison',
      'Matériaux & Équipement',
    ],
  },
  {
    id: 'personal',
    label: 'Bien-être & Mode',
    subcategories: [
      'Vêtements & Mode',
      'Santé & Beauté',
    ],
  },
  {
    id: 'lifestyle',
    label: 'Loisirs & Divertissements',
    subcategories: [
      'Loisirs & Divertissements',
      'Sport',
    ],
  },
]

export const ShopFilters = ({
  filters,
  onFiltersChange,
  productCounts,
}: ShopFiltersProps): JSX.Element => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string>(filters.category || '')
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false)
  const categoryRef = React.useRef<HTMLDivElement>(null)

  // Sync selectedCategory with filters.category
  React.useEffect(() => {
    setSelectedCategory(filters.category || '')
  }, [filters.category])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node) &&
        isCategoryOpen
      ) {
        setIsCategoryOpen(false)
      }
    }

    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCategoryOpen])

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ): void => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handlePriceChange = (range: [number, number]): void => {
    updateFilter('priceRange', { min: range[0], max: range[1] })
  }

  const toggleNeed = (need: ProductNeed): void => {
    const newNeeds = filters.needs.includes(need)
      ? filters.needs.filter((n) => n !== need)
      : [...filters.needs, need]
    updateFilter('needs', newNeeds)
  }

  const toggleBrand = (brand: string): void => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    updateFilter('brands', newBrands)
  }

  const handleCategorySelect = (
    categoryId: string,
    options?: { closeDropdown?: boolean },
  ): void => {
    setSelectedCategory(categoryId)
    updateFilter('category', categoryId)
    if (options?.closeDropdown !== false) {
      setIsCategoryOpen(false)
    }
  }

  const handleMobileCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    handleCategorySelect(event.target.value, { closeDropdown: false })
  }

  const isCategorySelected = React.useCallback(
    (categoryId: string) =>
      selectedCategory === categoryId ||
      selectedCategory.startsWith(`${categoryId}-`),
    [selectedCategory],
  )

  const isSubcategorySelected = React.useCallback(
    (categoryId: string, index: number) =>
      selectedCategory === `${categoryId}-${index}`,
    [selectedCategory],
  )

  const getSelectedCategoryLabel = (): string => {
    if (!selectedCategory) return 'Sélectionner une catégorie'
    
    // Check if it's a subcategory (format: categoryId-index)
    if (selectedCategory.includes('-')) {
      const [categoryId, indexStr] = selectedCategory.split('-')
      const category = marketplaceCategories.find((c) => c.id === categoryId)
      if (category && indexStr) {
        const index = parseInt(indexStr, 10)
        if (!isNaN(index) && category.subcategories[index]) {
          return category.subcategories[index]
        }
      }
    }
    
    // Otherwise it's a main category
    const category = marketplaceCategories.find((c) => c.id === selectedCategory)
    return category?.label || 'Sélectionner une catégorie'
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Disponibilité */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 mb-3">
          Disponibilité
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="availability"
              checked={filters.availability === 'all'}
              onChange={() => updateFilter('availability', 'all')}
              className="w-4 h-4 text-kitchen-lux-dark-green-600 focus:ring-kitchen-lux-dark-green-500"
            />
            <span className="text-sm text-kitchen-lux-dark-green-700">Tous</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="availability"
              checked={filters.availability === 'in-stock'}
              onChange={() => updateFilter('availability', 'in-stock')}
              className="w-4 h-4 text-kitchen-lux-dark-green-600 focus:ring-kitchen-lux-dark-green-500"
            />
            <span className="text-sm text-kitchen-lux-dark-green-700">
              En stock ({productCounts.inStock})
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="availability"
              checked={filters.availability === 'out-of-stock'}
              onChange={() => updateFilter('availability', 'out-of-stock')}
              className="w-4 h-4 text-kitchen-lux-dark-green-600 focus:ring-kitchen-lux-dark-green-500"
            />
            <span className="text-sm text-kitchen-lux-dark-green-700">
              Épuisé ({productCounts.outOfStock})
            </span>
          </label>
        </div>

        {/* Prix Range Slider */}
        <div className="mt-6 pt-6 border-t border-kitchen-lux-dark-green-200">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 mb-6">
            Prix
          </h3>
          <BudgetSlider
            min={0}
            max={900000}
            step={1000}
            value={[filters.priceRange.min, filters.priceRange.max]}
            onValueChange={handlePriceChange}
          />
        </div>
      </div>

      {/* Marque */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 mb-3">
          Marque
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.brands.includes('ZST')}
              onChange={() => toggleBrand('ZST')}
              className="w-4 h-4 text-kitchen-lux-dark-green-600 focus:ring-kitchen-lux-dark-green-500 rounded"
            />
            <span className="text-sm text-kitchen-lux-dark-green-700">ZST</span>
          </label>
        </div>
      </div>

      {/* Catégorie - Dropdown */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 mb-3">
          Catégorie
        </h3>
        <div className="space-y-3">
          {/* Mobile Select */}
          <div className="lg:hidden">
            <label className="block text-xs font-medium text-kitchen-lux-dark-green-600 mb-2">
              Choisir une catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={handleMobileCategoryChange}
              className="w-full rounded-lg border border-kitchen-lux-dark-green-200 bg-white px-3 py-2 text-sm text-kitchen-lux-dark-green-700 focus:border-kitchen-lux-dark-green-400 focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500"
            >
              <option value="">Toutes les catégories</option>
              {marketplaceCategories.map((category) => (
                <React.Fragment key={category.id}>
                  <option value={category.id}>{category.label}</option>
                  {category.subcategories.map((subcategory, idx) => (
                    <option key={`${category.id}-${idx}`} value={`${category.id}-${idx}`}>
                      {subcategory}
                    </option>
                  ))}
                </React.Fragment>
              ))}
            </select>
          </div>

          {/* Desktop Dropdown */}
          <div className="relative hidden lg:block" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-kitchen-lux-dark-green-700 bg-white border border-kitchen-lux-dark-green-200 rounded-lg hover:border-kitchen-lux-dark-green-400 focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500"
            >
              <span>{getSelectedCategoryLabel()}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isCategoryOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-kitchen-lux-dark-green-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-kitchen-lux-dark-green-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-kitchen-lux-dark-green-500">
                    Catégories Marketplace
                  </span>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('')}
                      className="text-xs font-medium text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                {marketplaceCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border-b border-kitchen-lux-dark-green-100 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 text-sm font-medium text-kitchen-lux-dark-green-800 hover:bg-kitchen-lux-dark-green-50 transition-colors',
                        isCategorySelected(category.id) &&
                          'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-900',
                      )}
                    >
                      {category.label}
                    </button>
                    <div className="pl-4 pb-2">
                      {category.subcategories.map((subcategory, idx) => (
                        <button
                          key={subcategory}
                          type="button"
                          onClick={() => handleCategorySelect(`${category.id}-${idx}`)}
                          className={cn(
                            'w-full text-left px-4 py-2 text-xs text-kitchen-lux-dark-green-600 hover:bg-kitchen-lux-dark-green-50 transition-colors',
                            isSubcategorySelected(category.id, idx) &&
                              'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-800 font-semibold',
                          )}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 mb-3">
          Usage
        </h3>
        <div className="space-y-2">
          {needs.map((need) => (
            <label key={need} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.needs.includes(need)}
                onChange={() => toggleNeed(need)}
                className="w-4 h-4 text-kitchen-lux-dark-green-600 focus:ring-kitchen-lux-dark-green-500 rounded"
              />
              <span className="text-sm text-kitchen-lux-dark-green-700">{needLabels[need]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden flex items-center justify-between w-full px-4 py-3 border border-kitchen-lux-dark-green-200 rounded-lg bg-white text-kitchen-lux-dark-green-800 font-medium mb-4"
        type="button"
      >
        <span className="text-sm uppercase tracking-[0.2em]">Filtres</span>
        <svg
          className={`w-5 h-5 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Mobile Filter Panel */}
      {isMobileOpen && (
        <div className="lg:hidden mb-6 p-4 border border-kitchen-lux-dark-green-200 rounded-lg bg-white">
          <FilterContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="text-lg font-elegant font-semibold text-kitchen-lux-dark-green-800 mb-6">
            Filtres
          </h2>
          <div className="p-6 border border-kitchen-lux-dark-green-200 rounded-lg bg-white">
            <FilterContent />
          </div>
        </div>
      </aside>
    </>
  )
}


