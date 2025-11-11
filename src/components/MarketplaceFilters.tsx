'use client'

import { useState } from 'react'
import type { ServiceCategory, ExperienceLevel } from '@/data/freelance-services'

type MarketplaceFiltersProps = {
  selectedCategory: ServiceCategory | 'all'
  selectedExperience: ExperienceLevel | 'all'
  selectedAvailability: 'all' | 'available' | 'busy'
  onCategoryChange: (category: ServiceCategory | 'all') => void
  onExperienceChange: (experience: ExperienceLevel | 'all') => void
  onAvailabilityChange: (availability: 'all' | 'available' | 'busy') => void
}

export function MarketplaceFilters({
  selectedCategory,
  selectedExperience,
  selectedAvailability,
  onCategoryChange,
  onExperienceChange,
  onAvailabilityChange,
}: MarketplaceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const categories: (ServiceCategory | 'all')[] = [
    'all',
    'Développement Web',
    'Design Graphique',
    'Montage Vidéo',
    'Marketing Digital',
    'Rédaction',
    'Photographie',
    'Traduction',
    'Consultation',
  ]

  const experienceLevels: (ExperienceLevel | 'all')[] = [
    'all',
    'Débutant',
    'Intermédiaire',
    'Expert',
  ]

  const availabilityOptions: ('all' | 'available' | 'busy')[] = [
    'all',
    'available',
    'busy',
  ]

  const getCategoryLabel = (category: ServiceCategory | 'all') => {
    return category === 'all' ? 'Toutes les catégories' : category
  }

  const getExperienceLabel = (experience: ExperienceLevel | 'all') => {
    return experience === 'all' ? 'Tous les niveaux' : experience
  }

  const getAvailabilityLabel = (availability: 'all' | 'available' | 'busy') => {
    switch (availability) {
      case 'all':
        return 'Tous'
      case 'available':
        return 'Disponible'
      case 'busy':
        return 'Occupé'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-between text-left font-semibold text-kitchen-lux-dark-green-800 mb-4"
      >
        <span>Filtres</span>
        <span className="text-2xl">{isOpen ? '−' : '+'}</span>
      </button>

      {/* Filters */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-3">
            Catégorie
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-kitchen-lux-dark-green-600 text-white shadow-md'
                    : 'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-100'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Experience & Availability Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-3">
              Niveau d'expérience
            </label>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => onExperienceChange(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedExperience === level
                      ? 'bg-kitchen-lux-dark-green-600 text-white shadow-md'
                      : 'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-100'
                  }`}
                >
                  {getExperienceLabel(level)}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-3">
              Disponibilité
            </label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((availability) => (
                <button
                  key={availability}
                  onClick={() => onAvailabilityChange(availability)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAvailability === availability
                      ? 'bg-kitchen-lux-dark-green-600 text-white shadow-md'
                      : 'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-100'
                  }`}
                >
                  {getAvailabilityLabel(availability)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
