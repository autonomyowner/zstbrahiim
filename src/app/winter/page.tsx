'use client'

import { useState, useMemo } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductControls } from '@/components/ProductControls'
import { winterClothes } from '@/data/winter-clothes'

type SortOption = 'best-sellers' | 'price-asc' | 'price-desc' | 'newest' | 'highest-rated'

export default function WinterPage(): JSX.Element {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState<SortOption>('best-sellers')

  // Sort products
  const sortedProducts = useMemo(() => {
    const result = [...winterClothes]

    switch (sortOption) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price)
      case 'newest':
        return result.sort((a, b) => {
          const aNew = a.isNew ? 1 : 0
          const bNew = b.isNew ? 1 : 0
          return bNew - aNew
        })
      case 'highest-rated':
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'best-sellers':
      default:
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
  }, [sortOption])

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mt-4 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
            Collection Hiver
          </h1>
          <p className="mt-4 text-lg text-kitchen-lux-dark-green-700">
            Découvrez notre sélection de vestes d&apos;hiver de qualité
          </p>
        </div>

        {/* Products Section */}
        <div className="flex-1">
          <div className="mb-6">
            <ProductControls
              productCount={sortedProducts.length}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          {sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} displayMode={displayMode} />
          ) : (
            <div className="text-center py-12">
              <p className="text-kitchen-lux-dark-green-700">
                Aucun produit disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

