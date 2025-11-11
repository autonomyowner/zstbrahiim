'use client'

import { useState } from 'react'
import { ServiceCard } from '@/components/ServiceCard'
import { MarketplaceFilters } from '@/components/MarketplaceFilters'
import { freelanceServices, type ServiceCategory, type ExperienceLevel } from '@/data/freelance-services'

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | 'all'>('all')
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'busy'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter services based on selected filters
  const filteredServices = freelanceServices.filter((service) => {
    // Category filter
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false
    }

    // Experience filter
    if (selectedExperience !== 'all' && service.experienceLevel !== selectedExperience) {
      return false
    }

    // Availability filter
    if (selectedAvailability !== 'all' && service.availability !== selectedAvailability) {
      return false
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        service.serviceTitle.toLowerCase().includes(query) ||
        service.providerName.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.skills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Get featured services for hero section
  const featuredServices = freelanceServices.filter(s => s.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mt-4 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
            Marketplace des Talents
          </h1>
          <p className="mt-4 text-lg text-kitchen-lux-dark-green-700 max-w-2xl mx-auto">
            Trouvez le freelance parfait pour votre projet. Développeurs, designers,
            vidéastes et experts qualifiés à votre service.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un service, compétence ou prestataire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-kitchen-lux-dark-green-900 placeholder-kitchen-lux-dark-green-400 bg-white focus:outline-none focus:ring-4 focus:ring-kitchen-lux-dark-green-300 shadow-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-kitchen-lux-dark-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors">
                Rechercher
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-kitchen-lux-dark-green-800">{freelanceServices.length}</div>
              <div className="text-sm md:text-base text-kitchen-lux-dark-green-600 mt-1">Freelances</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-kitchen-lux-dark-green-800">
                {freelanceServices.reduce((sum, s) => sum + s.completedProjects, 0)}
              </div>
              <div className="text-sm md:text-base text-kitchen-lux-dark-green-600 mt-1">Projets Complétés</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-kitchen-lux-dark-green-800">
                {(freelanceServices.reduce((sum, s) => sum + s.rating, 0) / freelanceServices.length).toFixed(1)}
              </div>
              <div className="text-sm md:text-base text-kitchen-lux-dark-green-600 mt-1">Note Moyenne</div>
            </div>
          </div>
        </div>

        {/* Featured Services */}
        {featuredServices.length > 0 && !searchQuery && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-elegant text-2xl md:text-3xl font-semibold text-kitchen-lux-dark-green-800">
                Freelances Recommandés
              </h2>
              <span className="bg-kitchen-warm-light text-kitchen-lux-dark-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Top Rated
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}

        {/* Filters and Services Grid */}
        <div className="mb-12">
          <h2 className="font-elegant text-2xl md:text-3xl font-semibold text-kitchen-lux-dark-green-800 mb-6">
            {searchQuery ? `Résultats pour "${searchQuery}"` : 'Tous les Services'}
          </h2>

          <MarketplaceFilters
            selectedCategory={selectedCategory}
            selectedExperience={selectedExperience}
            selectedAvailability={selectedAvailability}
            onCategoryChange={setSelectedCategory}
            onExperienceChange={setSelectedExperience}
            onAvailabilityChange={setSelectedAvailability}
          />

          {/* Results Count */}
          <div className="mb-6 text-kitchen-lux-dark-green-700">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} trouvé{filteredServices.length !== 1 ? 's' : ''}
          </div>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-kitchen-lux-dark-green-800 mb-2">
                Aucun service trouvé
              </h3>
              <p className="text-kitchen-lux-dark-green-700 mb-6">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedExperience('all')
                  setSelectedAvailability('all')
                  setSearchQuery('')
                }}
                className="bg-kitchen-lux-dark-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-kitchen-lux-dark-green-800 to-kitchen-lux-dark-green-900 text-white py-16 md:py-20 rounded-lg">
          <div className="text-center">
            <h2 className="font-elegant text-3xl md:text-4xl font-semibold mb-4">
              Vous êtes freelance ?
            </h2>
            <p className="text-lg text-kitchen-lux-dark-green-200 mb-8 max-w-2xl mx-auto">
              Rejoignez notre marketplace et trouvez de nouveaux clients pour vos services.
            </p>
            <button className="bg-white text-kitchen-lux-dark-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-kitchen-lux-dark-green-50 transition-colors shadow-lg">
              Devenir Prestataire
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
