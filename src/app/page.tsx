'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { ShopFilters } from '@/components/ShopFilters'
import { ProductControls } from '@/components/ProductControls'
import { womenPerfumes, type FilterState, type SortOption, matchesCategory, type Product } from '@/data/products'
import { winterClothes } from '@/data/winter-clothes'
import { getProducts } from '@/lib/supabase/products'

export default function HomePage(): JSX.Element {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState<SortOption>('best-sellers')
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    availability: 'all',
    brands: [], // Empty array means show all brands
    priceRange: { min: 0, max: 100000 },
    productTypes: [],
    needs: [],
    category: '',
  })

  // Fetch products from database
  useEffect(() => {
    const fetchDatabaseProducts = async () => {
      try {
        setIsLoadingProducts(true)
        const products = await getProducts()
        setDatabaseProducts(products)
      } catch (error) {
        console.error('Error fetching database products:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchDatabaseProducts()
  }, [])

  // Combine all products (static perfumes + winter clothes + database products)
  const allProducts = useMemo(() => {
    return [...womenPerfumes, ...winterClothes, ...databaseProducts]
  }, [databaseProducts])

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Availability filter
    if (filters.availability === 'in-stock') {
      result = result.filter((p) => p.inStock)
    } else if (filters.availability === 'out-of-stock') {
      result = result.filter((p) => !p.inStock)
    }

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand))
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max,
    )

    // Product type filter
    if (filters.productTypes.length > 0) {
      result = result.filter((p) => filters.productTypes.includes(p.productType))
    }

    // Need filter
    if (filters.needs.length > 0) {
      result = result.filter((p) => p.need && filters.needs.includes(p.need))
    }

    // Category filter - support both static and database products
    if (filters.category) {
      result = result.filter((p) => {
        // For static products, use matchesCategory
        if (matchesCategory(p.category, filters.category)) {
          return true
        }
        // For database products, check product_category field if it exists
        const dbProduct = p as any
        if (dbProduct.product_category) {
          return dbProduct.product_category === filters.category
        }
        return false
      })
    }

    return result
  }, [filters, allProducts])

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]

    switch (sortOption) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'newest':
        return sorted.sort((a, b) => {
          const aNew = a.isNew ? 1 : 0
          const bNew = b.isNew ? 1 : 0
          return bNew - aNew
        })
      case 'highest-rated':
        return sorted.sort((a, b) => {
          const aRating = a.rating || 0
          const bRating = b.rating || 0
          return bRating - aRating
        })
      case 'best-sellers':
      default:
        // For best sellers, prioritize products with promo and higher ratings
        return sorted.sort((a, b) => {
          const aScore = (a.isPromo ? 2 : 0) + (a.rating || 0)
          const bScore = (b.isPromo ? 2 : 0) + (b.rating || 0)
          return bScore - aScore
        })
    }
  }, [filteredProducts, sortOption])

  // Calculate product counts for filters
  const productCounts = useMemo(() => {
    const inStock = allProducts.filter((p) => p.inStock).length
    const outOfStock = allProducts.filter((p) => !p.inStock).length
    return { inStock, outOfStock }
  }, [allProducts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mt-4 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
            Marketplace - Collection ZST
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop only, handled by ShopFilters */}
          <ShopFilters
            filters={filters}
            onFiltersChange={setFilters}
            productCounts={productCounts}
          />

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

            {isLoadingProducts ? (
              <div className="text-center py-12">
                <p className="text-kitchen-lux-dark-green-700">
                  Chargement des produits...
                </p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <ProductGrid products={sortedProducts} displayMode={displayMode} />
            ) : (
              <div className="text-center py-12">
                <p className="text-kitchen-lux-dark-green-700">
                  Aucun produit ne correspond à vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 