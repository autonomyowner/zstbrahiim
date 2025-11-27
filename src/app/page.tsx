'use client'

import { useState, useMemo, useEffect, type MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeroSection } from '@/components/HeroSection'
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid'
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
  <div className="flex-shrink-0 w-40 sm:w-56">
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border/40 bg-brand-surface-muted">
      <div className="absolute inset-0 skeleton" />
      <div className="absolute inset-x-3 bottom-3">
        <div className="rounded-xl sm:rounded-2xl bg-white/90 p-3 sm:p-4 space-y-2">
          <div className="skeleton h-2 w-12 rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="flex justify-between items-center pt-1">
            <div className="skeleton h-5 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const PRODUCTS_PER_PAGE = 16

export default function HomePage(): JSX.Element {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState<SortOption>('best-sellers')
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreProducts, setHasMoreProducts] = useState(true)
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTrendingVideoId, setActiveTrendingVideoId] = useState<string | null>(null)

  // Fetch initial products from database
  useEffect(() => {
    const controller = new AbortController()

    const fetchDatabaseProducts = async () => {
      try {
        setIsLoadingProducts(true)
        const products = await getProducts(undefined, { limit: PRODUCTS_PER_PAGE, offset: 0 })

        if (controller.signal.aborted) return

        const filtered = (products as Product[]).filter(
          (product) =>
            product.sellerCategory !== 'importateur' && product.sellerCategory !== 'grossiste'
        )
        setDatabaseProducts(filtered)
        setHasMoreProducts(filtered.length >= PRODUCTS_PER_PAGE)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching database products:', error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false)
        }
      }
    }

    fetchDatabaseProducts()

    return () => controller.abort()
  }, [])

  // Load more products
  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMoreProducts) return

    try {
      setIsLoadingMore(true)
      const offset = databaseProducts.length
      const products = await getProducts(undefined, { limit: PRODUCTS_PER_PAGE, offset })

      const filtered = (products as Product[]).filter(
        (product) =>
          product.sellerCategory !== 'importateur' && product.sellerCategory !== 'grossiste'
      )

      if (filtered.length < PRODUCTS_PER_PAGE) {
        setHasMoreProducts(false)
      }

      setDatabaseProducts((prev) => [...prev, ...filtered])
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

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
        // Check product_category for database products
        if ('product_category' in p && p.product_category) {
          return p.product_category === filters.category
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
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`
    }
    return price.toLocaleString()
  }

  return (
    <div className="space-y-10 sm:space-y-14 pb-10">
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
          <div className="rounded-2xl sm:rounded-3xl border border-brand-border/50 bg-white p-5 sm:p-7 shadow-card-sm transition-shadow duration-300 hover:shadow-card-md">
            <div className="mb-5 sm:mb-6">
              <p className="section-label">
                Trending
              </p>
              <h2 className="heading-elegant text-xl sm:text-2xl lg:text-3xl text-text-primary mt-1">
                Produits à la une
              </h2>
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
                      className="group flex-shrink-0 w-40 sm:w-56 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border/40 bg-neutral-950/90 shadow-card-sm transition-all duration-300 group-hover:shadow-card-md group-hover:-translate-y-1.5">
                        {/* Promo badge */}
                        {product.isPromo && (
                          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 badge badge-dark text-[8px] sm:text-[9px] tracking-[0.15em]">
                            PROMO
                          </span>
                        )}

                        {/* Video toggle */}
                        {hasVideo && (
                          <button
                            type="button"
                            onClick={(event) => handleTrendingVideoToggle(event, product.id, hasVideo)}
                            className="absolute right-2 top-2 sm:right-3 sm:top-3 z-20 inline-flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm p-1.5 sm:p-2 text-white transition-all duration-200 hover:bg-black/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
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
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            priority={index < 2}
                          />
                        )}

                        {/* Gradient overlay */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                        {/* Info card */}
                        <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-md p-2.5 sm:p-3.5 shadow-card-sm transition-all duration-300 group-hover:bg-white/95">
                          <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                            {product.category}
                          </p>
                          <h3 className="mt-0.5 sm:mt-1 text-sm sm:text-base font-bold text-text-primary line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 text-[9px] sm:text-[10px] text-text-muted line-clamp-1 sm:line-clamp-2">
                            {product.description || product.productType}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="price text-base sm:text-lg font-bold text-text-primary">
                              {formatPrice(product.price)}
                              <span className="text-[9px] sm:text-[10px] font-medium text-text-muted ml-0.5">DA</span>
                            </span>
                            {hasVideo && (
                              <button
                                type="button"
                                onClick={(event) => handleTrendingVideoToggle(event, product.id, hasVideo)}
                                className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-brand-dark p-2 sm:p-2.5 text-brand-primary shadow-subtle transition-all duration-200 hover:shadow-card-sm hover:scale-105"
                                aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
                              >
                                {isVideoActive ? (
                                  <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                ) : (
                                  <TrianglePlayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div>
                <p className="section-label">Catalogue</p>
                <h2 className="heading-elegant text-xl sm:text-2xl lg:text-3xl text-text-primary mt-1">
                  Tous les produits
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-muted">
                <span className="font-semibold text-text-primary">{sortedProducts.length}</span> produits
              </p>
            </div>

            {isLoadingProducts ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <ProductGrid
                products={sortedProducts}
                displayMode={displayMode}
                isLoading={isLoadingProducts}
              />
            )}

            {/* Load More Button */}
            {!isLoadingProducts && hasMoreProducts && databaseProducts.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreProducts}
                  disabled={isLoadingMore}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-dark/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-card-sm hover:shadow-card-md"
                >
                  {isLoadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Voir plus de produits'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
