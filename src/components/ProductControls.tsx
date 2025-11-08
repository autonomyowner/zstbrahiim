'use client'

import { useState } from 'react'

type DisplayMode = 'grid' | 'list'
type SortOption = 'best-sellers' | 'price-asc' | 'price-desc' | 'newest' | 'highest-rated'

type ProductControlsProps = {
  productCount: number
  displayMode: DisplayMode
  onDisplayModeChange: (mode: DisplayMode) => void
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'best-sellers', label: 'Meilleures ventes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'highest-rated', label: 'Mieux notés' },
]

export const ProductControls = ({
  productCount,
  displayMode,
  onDisplayModeChange,
  sortOption,
  onSortChange,
}: ProductControlsProps): JSX.Element => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-kitchen-lux-dark-green-200 pb-4">
      <div className="text-sm font-medium text-kitchen-lux-dark-green-700">
        {productCount} {productCount === 1 ? 'Produit' : 'Produits'}
      </div>

      <div className="flex items-center gap-4">
        {/* Display Mode Toggle */}
        <div className="flex items-center gap-2 border border-kitchen-lux-dark-green-200 rounded-lg p-1">
          <button
            onClick={() => onDisplayModeChange('grid')}
            className={`p-2 rounded transition-colors duration-200 ${
              displayMode === 'grid'
                ? 'bg-kitchen-lux-dark-green-100 text-kitchen-lux-dark-green-800'
                : 'text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800'
            }`}
            aria-label="Vue en grille"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDisplayModeChange('list')}
            className={`p-2 rounded transition-colors duration-200 ${
              displayMode === 'list'
                ? 'bg-kitchen-lux-dark-green-100 text-kitchen-lux-dark-green-800'
                : 'text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800'
            }`}
            aria-label="Vue en liste"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none rounded-lg border border-kitchen-lux-dark-green-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-kitchen-lux-dark-green-800 focus:border-kitchen-lux-dark-green-400 focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-kitchen-lux-dark-green-600"
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
          </div>
        </div>
      </div>
    </div>
  )
}



