'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/data/products'

type ProductGridProps = {
  products: Product[]
  displayMode: 'grid' | 'list'
  showMinQuantity?: boolean
  isLoading?: boolean
}

const formatPrice = (price: number) => {
  if (price >= 1000) {
    return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`
  }
  return price.toLocaleString()
}

const TrianglePlayIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block text-current ${className}`} aria-hidden="true">
    <svg width="12" height="14" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1.73205C1 0.977308 1.822 0.499999 2.488 0.879385L12.488 6.5132C13.154 6.89259 13.154 7.89259 12.488 8.27198L2.488 13.9058C1.822 14.2852 1 13.8079 1 13.0531V1.73205Z" fill="currentColor"/>
    </svg>
  </span>
)

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

const VideoToggleButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.preventDefault()
      event.stopPropagation()
      onClick()
    }}
    className="absolute right-2 top-2 sm:right-3 sm:top-3 z-20 inline-flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm p-2 text-white transition-all duration-200 hover:bg-black/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
    aria-label={label}
  >
    {isActive ? (
      <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    ) : (
      <TrianglePlayIcon />
    )}
  </button>
)

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border/40 bg-brand-surface-muted">
    <div className="absolute inset-0 skeleton" />
    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
      <div className="rounded-xl sm:rounded-2xl bg-white/90 p-3 sm:p-4 space-y-2.5">
        <div className="skeleton h-3 w-16 rounded-md" />
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-20 rounded-md" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  </div>
)

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
)

// Empty state component
export const ProductEmptyState = ({ message = "Aucun produit ne correspond à vos critères." }: { message?: string }) => (
  <div className="relative overflow-hidden rounded-3xl border border-brand-border/50 bg-white py-16 sm:py-20 text-center shadow-card-sm">
    {/* Decorative elements */}
    <div className="absolute top-0 left-1/4 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl" />

    <div className="relative space-y-4 px-6">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-surface-muted flex items-center justify-center">
        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <p className="text-text-muted text-sm sm:text-base max-w-xs mx-auto">
        {message}
      </p>
      <button className="btn-ghost text-sm mt-2">
        Réinitialiser les filtres
      </button>
    </div>
  </div>
)

export const ProductGrid = ({ products, displayMode, showMinQuantity = false, isLoading = false }: ProductGridProps): JSX.Element | null => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const handleVideoToggle = (productId: string, hasVideo: boolean) => {
    if (!hasVideo) return
    setActiveVideoId((prev) => (prev === productId ? null : productId))
  }

  if (isLoading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return <ProductEmptyState />
  }

  const renderMedia = (product: Product, variant: 'grid' | 'list', index: number = 0) => {
    const hasVideo = Boolean(product.video?.url)
    const isVideoActive = activeVideoId === product.id
    const poster = product.video?.thumbnailUrl || product.image
    const minQty = (product as any).minQuantity || 1

    const containerSize = variant === 'grid' ? 'w-full' : 'w-full lg:max-w-[420px]'

    return (
      <div
        className={`relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border/40 bg-neutral-950/90 ${containerSize} transition-all duration-300`}
      >
        {/* Promo badge */}
        {product.isPromo && (
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10">
            <span className="badge badge-dark text-[9px] sm:text-[10px] tracking-[0.2em]">
              PROMO
            </span>
          </div>
        )}

        {/* Min quantity badge */}
        {showMinQuantity && minQty > 1 && (
          <div className="absolute left-2 sm:left-3 z-10" style={{ top: product.isPromo ? '2.75rem' : '0.5rem' }}>
            <span className="badge badge-warning text-[9px] sm:text-[10px]">
              Min: {minQty} unités
            </span>
          </div>
        )}

        {/* Video toggle button */}
        {hasVideo && (
          <VideoToggleButton
            label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
            isActive={isVideoActive}
            onClick={() => handleVideoToggle(product.id, hasVideo)}
          />
        )}

        {/* Media content */}
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
          <div className="absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent h-2/5" />

        {/* Product info card */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 lg:p-4">
          {/* Category badge */}
          <div className="mb-1.5 sm:mb-2">
            <span className="inline-block rounded-lg bg-white/95 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark shadow-subtle">
              {product.category}
            </span>
          </div>

          {/* Info panel */}
          <div className="rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-md p-2.5 sm:p-3.5 shadow-card-sm transition-all duration-300 group-hover:bg-white/95 group-hover:shadow-card-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold text-text-primary line-clamp-1 leading-tight">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[8px] sm:text-[9px] text-text-muted line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="price text-sm sm:text-base lg:text-lg font-bold text-text-primary whitespace-nowrap">
                  {formatPrice(product.price)}
                  <span className="text-[8px] sm:text-[9px] font-medium text-text-muted ml-0.5">DA</span>
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="price-strike text-[8px] sm:text-[9px] whitespace-nowrap">
                    {formatPrice(product.originalPrice)} DA
                  </span>
                )}
              </div>
            </div>

            {/* Video action button */}
            {hasVideo && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleVideoToggle(product.id, hasVideo)
                }}
                className="pointer-events-auto mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-dark px-3 py-1.5 sm:py-2 text-brand-primary shadow-subtle transition-all duration-200 hover:shadow-card-sm hover:translate-y-[-1px] active:translate-y-0"
                aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
              >
                {isVideoActive ? (
                  <>
                    <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">Photo</span>
                  </>
                ) : (
                  <>
                    <TrianglePlayIcon className="scale-75 sm:scale-90" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">Vidéo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (displayMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product, index) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className={`group block animate-slide-up`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {renderMedia(product, 'list', index)}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
      {products.map((product, index) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className={`group block transition-transform duration-300 ease-out hover:-translate-y-1.5 sm:hover:-translate-y-2 animate-slide-up`}
          style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
        >
          {renderMedia(product, 'grid', index)}
        </Link>
      ))}
    </div>
  )
}
