'use client'

import { useState } from 'react'
import Image from 'next/image'

type ProductGalleryProps = {
  images: string[]
  productName: string
}

export const ProductGallery = ({
  images,
  productName,
}: ProductGalleryProps): JSX.Element => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const handleThumbnailClick = (index: number): void => {
    setSelectedImageIndex(index)
    setIsZoomed(false)
  }

  const handleMainImageClick = (): void => {
    setIsZoomed(!isZoomed)
  }

  const handlePrevious = (): void => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
  }

  const handleNext = (): void => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
      <div className="flex flex-row lg:flex-col gap-2 order-2 lg:order-1">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
              selectedImageIndex === index
                ? 'border-kitchen-lux-dark-green-600 shadow-md'
                : 'border-kitchen-lux-dark-green-200 hover:border-kitchen-lux-dark-green-400'
            }`}
            type="button"
            aria-label={`Voir l'image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${productName} - Vue ${index + 1}`}
              fill
              className="object-contain p-2"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 order-1 lg:order-2 relative">
        <div
          className={`relative aspect-square bg-white rounded-lg border border-kitchen-lux-dark-green-200 overflow-hidden cursor-zoom-in ${
            isZoomed ? 'cursor-zoom-out' : ''
          }`}
          onClick={handleMainImageClick}
        >
          <Image
            src={images[selectedImageIndex]}
            alt={productName}
            fill
            className={`object-contain p-8 transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            priority
          />
          {/* Zoom indicator */}
          {!isZoomed && (
            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-kitchen-lux-dark-green-300 rounded-full p-2 shadow-md transition-all duration-200 hover:shadow-lg"
              type="button"
              aria-label="Image précédente"
            >
              <svg
                className="w-6 h-6 text-kitchen-lux-dark-green-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-kitchen-lux-dark-green-300 rounded-full p-2 shadow-md transition-all duration-200 hover:shadow-lg"
              type="button"
              aria-label="Image suivante"
            >
              <svg
                className="w-6 h-6 text-kitchen-lux-dark-green-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}



