'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/data/products'

type ProductGridProps = {
  products: Product[]
  displayMode: 'grid' | 'list'
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
  <span className="inline-flex items-center gap-1 rounded-full bg-brand-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-inverted">
    Promo
    <span className="material-symbols-outlined text-sm">bolt</span>
  </span>
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
      <span className="material-symbols-outlined text-base">image</span>
    ) : (
      <TrianglePlayIcon />
    )}
    <span className="sr-only">{label}</span>
  </button>
)

export const ProductGrid = ({ products, displayMode }: ProductGridProps): JSX.Element => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const handleVideoToggle = (productId: string, hasVideo: boolean) => {
    if (!hasVideo) return
    setActiveVideoId((prev) => (prev === productId ? null : productId))
  }

  const renderMedia = (product: Product, variant: 'grid' | 'list') => {
    const hasVideo = Boolean(product.video?.url)
    const isVideoActive = activeVideoId === product.id
    const poster = product.video?.thumbnailUrl || product.image

    const containerSize =
      variant === 'grid'
        ? 'w-full'
        : 'w-full lg:max-w-[420px]'

    return (
      <div
        className={`relative aspect-[9/16] overflow-hidden rounded-[32px] border border-brand-border bg-neutral-950/80 ${containerSize}`}
      >
        {product.isPromo && (
          <div className="absolute left-4 top-4 z-10">
            <PromoBadge />
          </div>
        )}
        {hasVideo && (
          <VideoToggleButton
            label={isVideoActive ? 'Photo' : 'Regarder'}
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
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 20vw"
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-2/5" />
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/70 p-4 text-black shadow-lg backdrop-blur-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-dark">
            {product.category}
          </p>
          <h3 className="mt-1 text-lg font-black text-neutral-900 line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-xs text-neutral-700 line-clamp-2">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-black text-neutral-900">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-500 line-through">{formatPrice(product.originalPrice)}</span>
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
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-neutral-900 p-3 text-white shadow-md transition hover:bg-neutral-800"
            aria-label={isVideoActive ? 'Voir la photo' : 'Regarder la vidéo'}
              >
            {isVideoActive ? (
              <span className="material-symbols-outlined text-base">image</span>
            ) : (
              <TrianglePlayIcon />
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group block transition-transform duration-300 hover:-translate-y-2"
        >
          {renderMedia(product, 'grid')}
        </Link>
      ))}
    </div>
  )
}

