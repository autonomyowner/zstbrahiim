'use client'

import { useState, useMemo, useEffect, type MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeroSection } from '@/components/HeroSection'
import { ProductGrid } from '@/components/ProductGrid'
import { ShopFilters } from '@/components/ShopFilters'
import {
  womenPerfumes,
  type FilterState,
  type SortOption,
  matchesCategory,
  type Product,
} from '@/data/products'
import { getProducts } from '@/lib/supabase/products'

const createDefaultFilters = (): FilterState => ({
  availability: 'all',
  brands: [],
  priceRange: { min: 0, max: 900000 },
  productTypes: [],
  needs: [],
  category: '',
})

export default function HomePage(): JSX.Element {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState<SortOption>('best-sellers')
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTrendingVideoId, setActiveTrendingVideoId] = useState<string | null>(null)

  // Fetch products from database
  useEffect(() => {
    const fetchDatabaseProducts = async () => {
      try {
        setIsLoadingProducts(true)
        const products = await getProducts()
        const filtered = (products as Product[]).filter(
          (product) =>
            product.sellerCategory !== 'importateur' && product.sellerCategory !== 'grossiste'
        )
        setDatabaseProducts(filtered)
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
    return [...womenPerfumes, ...databaseProducts]
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
        if (matchesCategory(p.category, filters.category)) {
          return true
        }
        const dbProduct = p as any
        if (dbProduct.product_category) {
          return dbProduct.product_category === filters.category
        }
        return false
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) => {
        const fields = [p.name, p.brand, p.category, p.productType]
        return fields.some((field) => field?.toLowerCase().includes(query))
      })
    }

    return result
  }, [filters, allProducts, searchQuery])

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

  const heroStats = [
    { label: 'Listings actives', value: `${allProducts.length}+` },
    { label: 'Sellers vérifiés', value: '45+' },
    { label: 'Commandes sécurisées', value: '3K+' },
  ]

  const trendingShowcase = sortedProducts.slice(0, 6)

  const handleResetFilters = () => setFilters(createDefaultFilters())

  const TrianglePlayIcon = ({ className = '' }: { className?: string }) => (
    <svg
      viewBox="0 0 14 16"
      className={className}
      fill="currentColor"
      role="presentation"
      aria-hidden="true"
    >
      <path d="M3 2.5L12 8l-9 5.5V2.5z" />
    </svg>
  )

  const handleTrendingVideoToggle = (
    event: MouseEvent<HTMLButtonElement>,
    productId: string,
    hasVideo: boolean,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (!hasVideo) return
    setActiveTrendingVideoId((prev) => (prev === productId ? null : productId))
  }

  return (
    <div className="space-y-12 pb-10">
      <HeroSection stats={heroStats} />

      <section className="space-y-10 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
          <ShopFilters
            filters={filters}
            onFiltersChange={setFilters}
            onResetFilters={handleResetFilters}
            productCounts={productCounts}
          />

          <div className="rounded-2xl sm:rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-5 sm:p-8 shadow-card-md">
            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-muted">
                  Trending
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-1 break-words">
                  Produits à la une
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-bold text-brand-dark hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap">
                Voir tout →
              </span>
            </div>
            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {trendingShowcase.map((product) => {
                const hasVideo = Boolean(product.video?.url)
                const isVideoActive = activeTrendingVideoId === product.id
                const poster = product.video?.thumbnailUrl || product.image

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex-shrink-0 w-44 sm:w-60 transition-transform duration-300 hover:-translate-y-2"
                  >
                    <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] border border-brand-border bg-neutral-950/80 shadow-card-sm">
                      {product.isPromo && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-dark px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                          Promo
                        </span>
                      )}
                      {hasVideo && (
                        <button
                          type="button"
                          onClick={(event) => handleTrendingVideoToggle(event, product.id, hasVideo)}
                          className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90"
                          aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
                        >
                          {isVideoActive ? (
                            <span className="material-symbols-outlined text-base">image</span>
                          ) : (
                            <TrianglePlayIcon className="h-4 w-4" />
                          )}
                          <span className="sr-only">{isVideoActive ? 'Photo' : 'Regarder'}</span>
                        </button>
                      )}
                      {hasVideo && isVideoActive ? (
                        <video
                          key={product.video?.url}
                          src={product.video?.url}
                          poster={poster}
                          className="absolute inset-0 h-full w-full object-cover"
                          controls
                          playsInline
                          muted
                          loop
                          autoPlay
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                        />
                      ) : (
                        <Image
                          src={product.image || '/perfums/6800.jpg'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 40vw, 20vw"
                          className="absolute inset-0 object-cover"
                          priority={false}
                        />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/75 p-4 text-black shadow-lg backdrop-blur">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-dark">
                          {product.category}
                        </p>
                        <h3 className="mt-1 text-base font-black text-neutral-900 line-clamp-1">{product.name}</h3>
                        <p className="mt-1 text-[11px] text-neutral-700 line-clamp-2">
                          {product.description || product.productType}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-black text-neutral-900">
                            {product.price.toLocaleString()} <span className="text-xs font-medium">DA</span>
                          </span>
                          {hasVideo && (
                            <button
                              type="button"
                              onClick={(event) => handleTrendingVideoToggle(event, product.id, hasVideo)}
                              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-neutral-900 p-2.5 text-white shadow-md transition hover:bg-neutral-800"
                              aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
                            >
                              {isVideoActive ? (
                                <span className="material-symbols-outlined text-base">image</span>
                              ) : (
                                <TrianglePlayIcon className="h-4 w-4" />
                              )}
                              <span className="sr-only">{isVideoActive ? 'Photo' : 'Regarder'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="rounded-3xl border border-brand-border bg-white/80 py-12 text-center text-text-muted shadow-card-sm">
              Chargement des produits...
            </div>
          ) : sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} displayMode={displayMode} />
          ) : (
            <div className="rounded-3xl border border-brand-border bg-white/80 py-12 text-center text-text-muted shadow-card-sm">
              Aucun produit ne correspond à vos critères.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}