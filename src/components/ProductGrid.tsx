'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/data/products'

type ProductGridProps = {
  products: Product[]
  displayMode: 'grid' | 'list'
  showMinQuantity?: boolean
}

const formatPrice = (price: number) => `${price.toLocaleString()} DA`

const TrianglePlayIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block text-current ${className}`} aria-hidden="true">
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1.73205C1 0.977308 1.822 0.499999 2.488 0.879385L12.488 6.5132C13.154 6.89259 13.154 7.89259 12.488 8.27198L2.488 13.9058C1.822 14.2852 1 13.8079 1 13.0531V1.73205Z" fill="currentColor"/>
    </svg>
  </span>
)

const PromoBadge = () => (
  <span className="inline-flex items-center rounded-full bg-brand-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-inverted">
    Promo
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
    className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90"
    aria-label={label}
  >
    {isActive ? (
      <ImageIcon className="w-4 h-4" />
    ) : (
      <TrianglePlayIcon />
    )}
    <span className="sr-only">{label}</span>
  </button>
)

export const ProductGrid = ({ products, displayMode, showMinQuantity = false }: ProductGridProps): JSX.Element => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const handleVideoToggle = (productId: string, hasVideo: boolean) => {
    if (!hasVideo) return
    setActiveVideoId((prev) => (prev === productId ? null : productId))
  }

  const renderMedia = (product: Product, variant: 'grid' | 'list') => {
    const hasVideo = Boolean(product.video?.url)
    const isVideoActive = activeVideoId === product.id
    const poster = product.video?.thumbnailUrl || product.image
    const minQty = (product as any).minQuantity || 1

    const containerSize =
      variant === 'grid'
        ? 'w-full'
        : 'w-full lg:max-w-[420px]'

    return (
      <div
        className={`relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[9/16] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-brand-border bg-neutral-950/80 ${containerSize} transition-all duration-300`}
      >
        {product.isPromo && (
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 lg:left-4 lg:top-4 z-10">
            <span className="inline-flex items-center rounded-full bg-brand-dark px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-inverted shadow-lg">
              Promo
            </span>
          </div>
        )}
        {showMinQuantity && minQty > 1 && (
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 lg:left-4 lg:top-4 z-10" style={{ top: product.isPromo ? '2.5rem' : undefined }}>
            <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-semibold text-white shadow-lg">
              Min: {minQty} unités
            </span>
          </div>
        )}
        {hasVideo && (
          <VideoToggleButton
            label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
            isActive={isVideoActive}
            onClick={() => handleVideoToggle(product.id, hasVideo)}
          />
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
          <div className="absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}

        {/* Subtle gradient overlay for better text readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent h-1/3" />

        {/* Minimal info overlay - only shows on hover on desktop */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 lg:p-4 transition-all duration-300">
          {/* Category badge - always visible */}
          <div className="mb-1.5 sm:mb-2">
            <span className="inline-block rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-brand-dark shadow-sm">
              {product.category}
            </span>
          </div>

          {/* Product info - compact and elegant */}
          <div className="rounded-xl sm:rounded-2xl bg-white/85 backdrop-blur-md p-2 sm:p-3 shadow-xl transition-all duration-300 group-hover:bg-white/95">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm lg:text-base font-black text-neutral-900 line-clamp-1 leading-tight">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[9px] sm:text-[10px] text-neutral-600 line-clamp-1 leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {product.description}
                </p>
              </div>

              {/* Price - prominent */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm sm:text-base lg:text-lg font-black text-neutral-900 whitespace-nowrap">
                  {(product.price / 1000).toFixed(0)}K
                  <span className="text-[9px] sm:text-[10px] font-medium ml-0.5">DA</span>
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[9px] sm:text-[10px] text-neutral-500 line-through whitespace-nowrap">
                    {(product.originalPrice / 1000).toFixed(0)}K DA
                  </span>
                )}
              </div>
            </div>

            {/* Video button - integrated into bottom bar */}
            {hasVideo && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleVideoToggle(product.id, hasVideo)
                }}
                className="pointer-events-auto mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 sm:py-2 text-white shadow-md transition hover:bg-neutral-800 hover:shadow-lg"
                aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
              >
                {isVideoActive ? (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Photo</span>
                  </>
                ) : (
                  <>
                    <TrianglePlayIcon className="scale-90 sm:scale-100" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Vidéo</span>
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
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            {renderMedia(product, 'list')}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group block transition-transform duration-300 hover:-translate-y-1 sm:hover:-translate-y-2"
        >
          {renderMedia(product, 'grid')}
        </Link>
      ))}
    </div>
  )
}

