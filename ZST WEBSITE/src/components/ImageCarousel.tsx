'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const images = [
  '/picturs/2.jpg',
  '/picturs/3.jpg',
  '/picturs/4.jpg',
  '/picturs/5.jpg',
  '/picturs/6.jpg',
  '/picturs/7.jpg',
  '/picturs/8.jpg',
  '/picturs/9.jpg',
  '/picturs/10.jpg',
  '/picturs/hero.jpg',
]

export const ImageCarousel = (): JSX.Element => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const handlePreviousImage = (): void => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const handleNextImage = (): void => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  return (
    <section className="border-y border-kitchen-lux-dark-green-200 bg-white/80 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-kitchen-lux-dark-green-600">
            Galerie
          </p>
          <h2 className="mt-5 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
            Nos réalisations
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-kitchen-lux-dark-green-700">
            Découvrez quelques-unes de nos créations qui transforment les espaces
            en lieux d&apos;exception pour vos événements.
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-kitchen-lux-dark-green-200 shadow-lg">
            <Image
              src={images[currentImageIndex]}
              alt={`Réalisation ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-opacity duration-500"
              priority={currentImageIndex === 0}
            />
            
            {/* Navigation buttons */}
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg"
              aria-label="Image précédente"
            >
              <svg className="h-6 w-6 text-kitchen-lux-dark-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg"
              aria-label="Image suivante"
            >
              <svg className="h-6 w-6 text-kitchen-lux-dark-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Dots indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-3 w-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'bg-kitchen-lux-dark-green-800'
                    : 'bg-kitchen-lux-dark-green-200 hover:bg-kitchen-lux-dark-green-400'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
          <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-6 py-8">
            <p className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
              50+
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.35em] text-kitchen-lux-dark-green-600">
              Événements réalisés
            </p>
          </div>
          <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-6 py-8">
            <p className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
              5+
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.35em] text-kitchen-lux-dark-green-600">
              Années d&apos;expérience
            </p>
          </div>
          <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-6 py-8">
            <p className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
              Équipe
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.35em] text-kitchen-lux-dark-green-600">
              Professionnelle
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
