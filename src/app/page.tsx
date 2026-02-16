'use client'

import { useState, useMemo, type MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { HeroSection } from '@/components/HeroSection'
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid'
import { ShopFilters } from '@/components/ShopFilters'
import {
  type FilterState,
  type SortOption,
  matchesCategory,
  type Product,
} from '@/data/products'

const createDefaultFilters = (): FilterState => ({
  availability: 'all',
  brands: [],
  priceRange: { min: 0, max: 900000 },
  productTypes: [],
  needs: [],
  category: '',
  searchQuery: '',
})

// Custom SVG icons to avoid material symbols
const ImageIcon = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

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

// Trending card skeleton
const TrendingCardSkeleton = () => (
  <div className="flex-shrink-0 w-40 sm:w-52">
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-100">
      <div className="absolute inset-0 skeleton" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 space-y-2">
        <div className="skeleton h-2 w-10 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-16 rounded mt-1" />
      </div>
    </div>
  </div>
)

const PRODUCTS_PER_PAGE = 16

export default function HomePage(): JSX.Element {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState<SortOption>('best-sellers')
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters())
  const [activeTrendingVideoId, setActiveTrendingVideoId] = useState<string | null>(null)

  // Fetch products from Convex (fournisseur only)
  const rawProducts = useQuery(api.products.getProducts, {
    sellerCategories: ['fournisseur'],
  })

  const isLoadingProducts = rawProducts === undefined
  const databaseProducts = useMemo(() => {
    if (!rawProducts) return []
    return rawProducts as unknown as Product[]
  }, [rawProducts])

  // Load more products (client-side pagination)
  const loadMoreProducts = () => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)
  }

  // All products from database only
  const allProducts = useMemo(() => {
    return databaseProducts
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
        // Check product_category for database products
        if ('product_category' in p && p.product_category) {
          return p.product_category === filters.category
        }
        return false
      })
    }

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter((p) => {
        const fields = [p.name, p.brand, p.category, p.productType]
        return fields.some((field) => field?.toLowerCase().includes(query))
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

  // Client-side pagination: only show up to visibleCount
  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount)
  }, [sortedProducts, visibleCount])

  const hasMoreProducts = !isLoadingProducts && visibleCount < sortedProducts.length

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

  const formatPrice = (price: number) => {
    return price.toLocaleString()
  }

  return (
    <div className="space-y-6 sm:space-y-10 md:space-y-14 pb-10">
      <HeroSection stats={heroStats} />

      <section className="space-y-8 sm:space-y-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <ShopFilters
            filters={filters}
            onFiltersChange={setFilters}
            onResetFilters={handleResetFilters}
            productCounts={productCounts}
          />

          {/* Trending Section */}
          <div>
            <div className="mb-4 sm:mb-5 flex items-end justify-between">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted/60">
                  Trending
                </p>
                <h2 className="heading-elegant text-xl sm:text-2xl lg:text-3xl text-text-primary mt-0.5">
                  À la une
                </h2>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-text-muted/50 hidden sm:block">
                {trendingShowcase.length} produits
              </span>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
              {isLoadingProducts ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <TrendingCardSkeleton key={i} />
                ))
              ) : (
                trendingShowcase.map((product, index) => {
                  const hasVideo = Boolean(product.video?.url)
                  const isVideoActive = activeTrendingVideoId === product.id
                  const poster = product.video?.thumbnailUrl || product.image

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group flex-shrink-0 w-40 sm:w-52 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-950 ring-1 ring-white/5 transition-all duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:ring-brand-primary/20">
                        {/* Promo badge */}
                        {product.isPromo && (
                          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 inline-flex items-center rounded-md bg-brand-primary px-2 py-0.5 text-[8px] sm:text-[9px] font-bold text-brand-dark tracking-wide shadow-sm">
                            PROMO
                          </span>
                        )}

                        {/* Video toggle */}
                        {hasVideo && (
                          <button
                            type="button"
                            onClick={(event) => handleTrendingVideoToggle(event, product.id, hasVideo)}
                            className="absolute right-2 top-2 sm:right-3 sm:top-3 z-20 inline-flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm p-1.5 sm:p-2 text-white transition-all duration-200 hover:bg-black/70"
                            aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
                          >
                            {isVideoActive ? (
                              <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            ) : (
                              <TrianglePlayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            )}
                          </button>
                        )}

                        {/* Media */}
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
                            sizes="(max-width: 640px) 40vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            priority={index < 2}
                          />
                        )}

                        {/* Gradient overlay */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                        {/* Info - directly on gradient */}
                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                          <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-white/40">
                            {product.category}
                          </p>
                          <h3 className="mt-0.5 text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                              {formatPrice(product.price)}
                              <span className="text-[9px] sm:text-[10px] font-medium text-white/40 ml-0.5">DA</span>
                            </span>
                            {hasVideo && (
                              <button
                                type="button"
                                onClick={(event) => handleTrendingVideoToggle(event, product.id, hasVideo)}
                                className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-sm px-2 py-1 text-white transition-all hover:bg-white/25"
                                aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
                              >
                                {isVideoActive ? (
                                  <ImageIcon className="h-2.5 w-2.5" />
                                ) : (
                                  <TrianglePlayIcon className="h-2.5 w-2.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Product Grid Section */}
          <div>
            <div className="flex items-end justify-between mb-4 sm:mb-5">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted/60">
                  Catalogue
                </p>
                <h2 className="heading-elegant text-xl sm:text-2xl lg:text-3xl text-text-primary mt-0.5">
                  Tous les produits
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-text-muted/50">
                <span className="font-semibold text-text-primary">{sortedProducts.length}</span> produits
              </p>
            </div>

            {isLoadingProducts ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <ProductGrid
                products={visibleProducts}
                displayMode={displayMode}
                isLoading={isLoadingProducts}
              />
            )}

            {/* Load More Button */}
            {!isLoadingProducts && hasMoreProducts && databaseProducts.length > 0 && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMoreProducts}
                  className="inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-8 py-3 text-sm font-semibold text-text-primary transition-all duration-300 hover:border-brand-dark hover:bg-brand-dark hover:text-brand-primary shadow-subtle hover:shadow-card-sm"
                >
                  Voir plus de produits
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
