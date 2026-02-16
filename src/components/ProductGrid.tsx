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
  <div className="relative aspect-[3/5] sm:aspect-[4/5] lg:aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-100">
    <div className="absolute inset-0 skeleton" />
    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 space-y-2">
      <div className="skeleton h-2.5 w-14 rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3.5 w-1/2 rounded" />
      <div className="skeleton h-5 w-20 rounded mt-1" />
    </div>
  </div>
)

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:gap-4 xl:grid-cols-4">
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
    const hasDiscount = product.originalPrice && product.originalPrice > product.price
    const discountPct = hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0

    return (
      <div
        className={`relative aspect-[3/5] sm:aspect-[4/5] lg:aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-950 ${containerSize} transition-all duration-300 ring-1 ring-black/5 group-hover:ring-brand-primary/20`}
      >
        {/* Top badges row */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-wrap gap-1.5">
          {product.isPromo && (
            <span className="inline-flex items-center rounded-md bg-brand-primary px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-brand-dark tracking-wide shadow-sm">
              -{discountPct}%
            </span>
          )}
          {showMinQuantity && minQty > 1 && (
            <span className="inline-flex items-center rounded-md bg-amber-400 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-900 tracking-wide shadow-sm">
              Min {minQty}
            </span>
          )}
          {product.isNew && (
            <span className="inline-flex items-center rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-text-primary tracking-wide shadow-sm">
              NEW
            </span>
          )}
        </div>

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
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          </div>
        )}

        {/* Gradient overlay - stronger for text readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent h-3/5" />

        {/* Product info - directly on the gradient, no card */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-1">
            {product.category}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
            {product.name}
          </h3>

          <div className="mt-2 flex items-end justify-between gap-2">
            <div>
              <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                {formatPrice(product.price)}
                <span className="text-[10px] sm:text-xs font-medium text-white/50 ml-0.5">DA</span>
              </span>
              {hasDiscount && (
                <span className="block text-[10px] sm:text-xs text-white/40 line-through tabular-nums">
                  {formatPrice(product.originalPrice!)} DA
                </span>
              )}
            </div>

            {hasVideo && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleVideoToggle(product.id, hasVideo)
                }}
                className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1.5 text-white transition-all duration-200 hover:bg-white/25 active:scale-95"
                aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
              >
                {isVideoActive ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <TrianglePlayIcon className="scale-75" />
                )}
                <span className="text-[9px] font-semibold uppercase tracking-wider">{isVideoActive ? 'Photo' : 'Vidéo'}</span>
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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:gap-4 xl:grid-cols-4">
      {products.map((product, index) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className={`group block transition-transform duration-500 ease-out-expo hover:-translate-y-1 animate-slide-up`}
          style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
        >
          {renderMedia(product, 'grid', index)}
        </Link>
      ))}
    </div>
  )
}
