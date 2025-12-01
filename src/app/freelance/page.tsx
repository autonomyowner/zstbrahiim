'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { freelanceServices, type ServiceCategory, type ExperienceLevel, type FreelanceService } from '@/data/freelance-services'
import { getFreelanceServices } from '@/lib/supabase/services'

const SERVICES_PER_PAGE = 9

// Skeleton loader for service cards
const ServiceCardSkeleton = () => (
  <div className="group relative bg-white rounded-2xl overflow-hidden border border-brand-border/50 animate-pulse">
    <div className="p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-brand-border/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-brand-border/50 rounded" />
          <div className="h-3 w-16 bg-brand-border/50 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-5 w-full bg-brand-border/50 rounded" />
        <div className="h-5 w-3/4 bg-brand-border/50 rounded" />
      </div>
      <div className="h-4 w-full bg-brand-border/50 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-brand-border/50 rounded-full" />
        <div className="h-6 w-20 bg-brand-border/50 rounded-full" />
        <div className="h-6 w-14 bg-brand-border/50 rounded-full" />
      </div>
      <div className="pt-4 border-t border-brand-border/30 flex justify-between">
        <div className="h-6 w-24 bg-brand-border/50 rounded" />
        <div className="h-6 w-20 bg-brand-border/50 rounded-full" />
      </div>
    </div>
  </div>
)

// Service Card Component
const ServiceCard = ({ service, index }: { service: FreelanceService; index: number }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString()
  }

  const getPriceLabel = () => {
    switch (service.priceType) {
      case 'starting-at': return 'À partir de'
      case 'hourly': return '/heure'
      case 'fixed': return 'Prix fixe'
      default: return ''
    }
  }

  return (
    <Link
      href={`/freelance/${service.slug}`}
      className="group relative block"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden border border-brand-border/50 transition-all duration-500 hover:border-brand-primary/30 hover:shadow-xl hover:-translate-y-1 animate-slide-up h-full">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Featured badge */}
        {service.featured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
              Featured
            </span>
          </div>
        )}

        <div className="relative p-6">
          {/* Provider Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-primary/20">
                {service.providerName.charAt(0)}
              </div>
              {service.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-success flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-brand-text truncate">{service.providerName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-brand-text-muted">{service.experienceLevel}</span>
                {service.topRated && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                    Top
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Service Title */}
          <h4 className="font-display text-lg font-semibold text-brand-text leading-snug mb-3 line-clamp-2 group-hover:text-brand-primary-dark transition-colors duration-300">
            {service.serviceTitle}
          </h4>

          {/* Short Description */}
          <p className="text-sm text-brand-text-muted leading-relaxed mb-4 line-clamp-2">
            {service.shortDescription}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {service.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium bg-brand-surface-muted text-brand-text-secondary px-2.5 py-1 rounded-full border border-brand-border/50"
              >
                {skill}
              </span>
            ))}
            {service.skills.length > 3 && (
              <span className="text-[11px] font-medium text-brand-text-muted px-2 py-1">
                +{service.skills.length - 3}
              </span>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-brand-text-muted mb-5">
            <div className="flex items-center gap-1">
              <span className="text-brand-primary font-bold">{service.rating}</span>
              <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-brand-text-muted">({service.reviewsCount})</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-brand-border" />
            <span>{service.completedProjects} projets</span>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-brand-border/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-text-muted block">
                {getPriceLabel()}
              </span>
              <span className="text-xl font-bold text-brand-text">
                {formatPrice(service.price)}
                <span className="text-sm font-normal text-brand-text-muted ml-1">DA</span>
              </span>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                service.availability === 'available'
                  ? 'bg-accent-success/10 text-accent-success'
                  : service.availability === 'busy'
                  ? 'bg-accent-warning/10 text-accent-warning'
                  : 'bg-brand-surface-muted text-brand-text-muted'
              }`}
            >
              {service.availability === 'available'
                ? 'Disponible'
                : service.availability === 'busy'
                ? 'Occupé'
                : 'Indisponible'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Category filter pill
const CategoryPill = ({
  label,
  isActive,
  onClick,
  count
}: {
  label: string
  isActive: boolean
  onClick: () => void
  count?: number
}) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
      isActive
        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
        : 'bg-white text-brand-text-secondary hover:bg-brand-surface-muted border border-brand-border/50 hover:border-brand-primary/30'
    }`}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1.5 text-[10px] ${isActive ? 'text-white/80' : 'text-brand-text-muted'}`}>
        ({count})
      </span>
    )}
  </button>
)

export default function FreelancePage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | 'all'>('all')
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'busy'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [databaseServices, setDatabaseServices] = useState<FreelanceService[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [visibleCount, setVisibleCount] = useState(SERVICES_PER_PAGE)

  // Fetch database services with abort controller
  useEffect(() => {
    const controller = new AbortController()

    const fetchServices = async () => {
      try {
        setIsLoadingServices(true)
        const services = await getFreelanceServices()
        if (!controller.signal.aborted) {
          setDatabaseServices(services as FreelanceService[])
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching database services:', error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingServices(false)
        }
      }
    }

    fetchServices()
    return () => controller.abort()
  }, [])

  // Combine and memoize all services
  const allServices = useMemo(() => {
    return [...freelanceServices, ...databaseServices]
  }, [databaseServices])

  // Memoized category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allServices.length }
    allServices.forEach(service => {
      counts[service.category] = (counts[service.category] || 0) + 1
    })
    return counts
  }, [allServices])

  // Memoized filtered services
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      if (selectedCategory !== 'all' && service.category !== selectedCategory) return false
      if (selectedExperience !== 'all' && service.experienceLevel !== selectedExperience) return false
      if (selectedAvailability !== 'all' && service.availability !== selectedAvailability) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          service.serviceTitle.toLowerCase().includes(query) ||
          service.providerName.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.skills.some((skill: string) => skill.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [allServices, selectedCategory, selectedExperience, selectedAvailability, searchQuery])

  // Featured services
  const featuredServices = useMemo(() => {
    return freelanceServices.filter(s => s.featured).slice(0, 3)
  }, [])

  // Visible services for pagination
  const visibleServices = useMemo(() => {
    return filteredServices.slice(0, visibleCount)
  }, [filteredServices, visibleCount])

  // Load more handler
  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + SERVICES_PER_PAGE)
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setSelectedCategory('all')
    setSelectedExperience('all')
    setSelectedAvailability('all')
    setSearchQuery('')
    setVisibleCount(SERVICES_PER_PAGE)
  }, [])

  // Stats
  const stats = useMemo(() => ({
    freelancers: allServices.length,
    projects: allServices.reduce((sum, s) => sum + s.completedProjects, 0),
    avgRating: (allServices.reduce((sum, s) => sum + s.rating, 0) / allServices.length).toFixed(1)
  }), [allServices])

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

  return (
    <div className="min-h-screen bg-brand-background-light">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 bg-brand-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold uppercase tracking-widest text-brand-primary mb-6">
              Marketplace des Talents
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-text leading-tight mb-6">
              Trouvez le freelance
              <span className="block text-brand-primary">parfait</span>
            </h1>
            <p className="text-lg text-brand-text-muted max-w-2xl mx-auto leading-relaxed">
              Développeurs, designers, vidéastes et experts qualifiés prêts à transformer vos idées en réalité.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary/20 to-brand-primary-light/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-brand-border/50 overflow-hidden">
                <svg className="w-5 h-5 text-brand-text-muted ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un service, compétence ou prestataire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-4 text-brand-text placeholder-brand-text-muted bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-2 mr-2 text-brand-text-muted hover:text-brand-text transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { value: `${stats.freelancers}+`, label: 'Freelances' },
              { value: `${stats.projects}+`, label: 'Projets' },
              { value: stats.avgRating, label: 'Note moyenne' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-brand-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Featured Section */}
          {featuredServices.length > 0 && !searchQuery && selectedCategory === 'all' && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-text">
                    Recommandés
                  </h2>
                  <p className="text-brand-text-muted mt-1">Les meilleurs talents de la plateforme</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-text">
                {searchQuery ? `Résultats pour "${searchQuery}"` : 'Tous les services'}
              </h2>
              <span className="text-sm text-brand-text-muted">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {categories.map((category) => (
                <CategoryPill
                  key={category}
                  label={category === 'all' ? 'Tous' : category}
                  isActive={selectedCategory === category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setVisibleCount(SERVICES_PER_PAGE)
                  }}
                  count={categoryCounts[category]}
                />
              ))}
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-wrap gap-3 mt-4">
              <select
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value as ExperienceLevel | 'all')
                  setVisibleCount(SERVICES_PER_PAGE)
                }}
                className="px-4 py-2 rounded-xl bg-white border border-brand-border/50 text-sm text-brand-text-secondary focus:outline-none focus:border-brand-primary/50 transition-colors"
              >
                <option value="all">Tous niveaux</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Expert">Expert</option>
              </select>

              <select
                value={selectedAvailability}
                onChange={(e) => {
                  setSelectedAvailability(e.target.value as 'all' | 'available' | 'busy')
                  setVisibleCount(SERVICES_PER_PAGE)
                }}
                className="px-4 py-2 rounded-xl bg-white border border-brand-border/50 text-sm text-brand-text-secondary focus:outline-none focus:border-brand-primary/50 transition-colors"
              >
                <option value="all">Disponibilité</option>
                <option value="available">Disponible</option>
                <option value="busy">Occupé</option>
              </select>

              {(selectedCategory !== 'all' || selectedExperience !== 'all' || selectedAvailability !== 'all' || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-brand-primary hover:bg-brand-primary/5 transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Services Grid */}
          {isLoadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : visibleServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < filteredServices.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3.5 rounded-xl bg-brand-text text-white font-semibold transition-all duration-300 hover:bg-brand-text/90 hover:shadow-lg"
                  >
                    Voir plus ({filteredServices.length - visibleCount} restants)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-surface-muted flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-text mb-2">Aucun service trouvé</h3>
              <p className="text-brand-text-muted mb-6">Essayez de modifier vos filtres ou votre recherche</p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold transition-all duration-300 hover:bg-brand-primary-dark hover:shadow-lg"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-20 relative overflow-hidden rounded-3xl bg-brand-text p-8 sm:p-12 lg:p-16">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Vous êtes freelance ?
              </h2>
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                Rejoignez notre plateforme et connectez-vous avec des clients qui recherchent vos compétences.
              </p>
              <Link
                href="/register?role=freelancer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-primary text-brand-text font-bold transition-all duration-300 hover:bg-brand-primary-light hover:shadow-xl hover:shadow-brand-primary/25"
              >
                Devenir prestataire
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
