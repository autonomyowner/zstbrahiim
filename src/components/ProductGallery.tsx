'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import type { ProductVideoAsset } from '@/data/products'

type ProductGalleryProps = {
  images: string[]
  productName: string
  video?: ProductVideoAsset
}

type GalleryMediaItem =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; thumbnail: string; durationSeconds?: number }

const ChevronLeft = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const ChevronRight = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const PlayIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
)

const ZoomIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
  </svg>
)

export const ProductGallery = ({
  images,
  productName,
  video,
}: ProductGalleryProps): JSX.Element => {
  const mediaItems: GalleryMediaItem[] = [
    ...images.map((image) => ({ type: 'image' as const, src: image })),
    ...(video
      ? [
          {
            type: 'video' as const,
            src: video.url,
            thumbnail: video.thumbnailUrl,
            durationSeconds: video.durationSeconds,
          },
        ]
      : []),
  ]

  if (mediaItems.length === 0) {
    mediaItems.push({
      type: 'image',
      src: '/perfums/placeholder.jpg',
    })
  }

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const mainImageRef = useRef<HTMLDivElement>(null)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  const selectedItem = mediaItems[selectedIndex]

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[selectedIndex] as HTMLElement
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedIndex])

  const handleThumbnailClick = (index: number): void => {
    setSelectedIndex(index)
    setIsZoomed(false)
  }

  const handleMainImageClick = (): void => {
    if (selectedItem?.type === 'image') {
      setIsZoomed(!isZoomed)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!mainImageRef.current || !isZoomed) return
    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handlePrevious = (): void => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1))
    setIsZoomed(false)
  }

  const handleNext = (): void => {
    setSelectedIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* Main Media Display */}
      <div className="relative group">
        {/* Main Image Container */}
        <div
          ref={mainImageRef}
          className={`relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl
            bg-gradient-to-br from-brand-surface-muted to-white border border-brand-border/60
            shadow-card-sm transition-all duration-500
            ${selectedItem?.type === 'image' ? 'cursor-zoom-in' : ''}
            ${isZoomed ? 'cursor-zoom-out' : ''}`}
          onClick={handleMainImageClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomPosition({ x: 50, y: 50 })}
        >
          {selectedItem?.type === 'video' ? (
            <div className="absolute inset-0 bg-brand-dark">
              <video
                controls
                poster={selectedItem.thumbnail}
                className="w-full h-full object-contain"
                preload="metadata"
                playsInline
              >
                <source src={selectedItem.src} />
                Votre navigateur ne supporte pas la lecture vidéo HTML5.
              </video>
            </div>
          ) : (
            <>
              <div className="absolute inset-0">
                <Image
                  src={selectedItem?.src || '/perfums/placeholder.jpg'}
                  alt={productName}
                  fill
                  className={`object-contain p-4 sm:p-6 lg:p-8 transition-transform duration-500 ease-out-expo
                    ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Zoom Indicator */}
              {!isZoomed && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-brand-dark/80 backdrop-blur-sm text-brand-primary p-2 sm:p-2.5 rounded-xl shadow-card-sm">
                    <ZoomIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              )}

              {/* Zoom Active Indicator */}
              {isZoomed && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <div className="bg-brand-primary text-brand-dark px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide shadow-card-sm">
                    Zoom actif
                  </div>
                </div>
              )}
            </>
          )}

          {/* Video Badge */}
          {selectedItem?.type === 'video' && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <div className="bg-brand-dark/90 backdrop-blur-sm text-brand-primary px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5">
                <PlayIcon className="w-3 h-3" />
                Vidéo
              </div>
            </div>
          )}

          {/* Image Counter */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4">
              <div className="bg-brand-dark/80 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide">
                {selectedIndex + 1} / {mediaItems.length}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2
                w-10 h-10 sm:w-12 sm:h-12
                flex items-center justify-center
                bg-white/95 hover:bg-white
                border border-brand-border/60 hover:border-brand-primary/40
                rounded-full shadow-card-sm hover:shadow-card-md
                text-text-secondary hover:text-brand-primaryDark
                opacity-0 group-hover:opacity-100
                transition-all duration-300 ease-out
                hover:scale-105 active:scale-95"
              type="button"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2
                w-10 h-10 sm:w-12 sm:h-12
                flex items-center justify-center
                bg-white/95 hover:bg-white
                border border-brand-border/60 hover:border-brand-primary/40
                rounded-full shadow-card-sm hover:shadow-card-md
                text-text-secondary hover:text-brand-primaryDark
                opacity-0 group-hover:opacity-100
                transition-all duration-300 ease-out
                hover:scale-105 active:scale-95"
              type="button"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      <div
        ref={thumbnailContainerRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1"
      >
        {mediaItems.map((item, index) => {
          const isActive = selectedIndex === index
          return (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24
                overflow-hidden rounded-xl sm:rounded-2xl
                border-2 transition-all duration-300 ease-out
                ${isActive
                  ? 'border-brand-primary shadow-glow ring-2 ring-brand-primary/20'
                  : 'border-brand-border/60 hover:border-brand-primary/40 hover:shadow-card-sm'
                }
                bg-gradient-to-br from-brand-surface-muted to-white
                group/thumb`}
              type="button"
              aria-label={item.type === 'video' ? 'Voir la vidéo' : `Voir l'image ${index + 1}`}
            >
              {item.type === 'video' ? (
                <>
                  <Image
                    src={item.thumbnail}
                    alt={`${productName} - Vidéo`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-brand-dark/40 flex items-center justify-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-brand-primary text-brand-dark' : 'bg-white/90 text-brand-dark group-hover/thumb:bg-brand-primary'}`}>
                      <PlayIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  {item.durationSeconds && (
                    <div className="absolute bottom-1 right-1 bg-brand-dark/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                      {formatDuration(item.durationSeconds)}
                    </div>
                  )}
                </>
              ) : (
                <Image
                  src={item.src}
                  alt={`${productName} - Vue ${index + 1}`}
                  fill
                  className={`object-contain p-1.5 sm:p-2 transition-all duration-300
                    ${isActive ? '' : 'group-hover/thumb:scale-105'}`}
                />
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute inset-x-0 -bottom-0.5 h-1 bg-brand-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}



