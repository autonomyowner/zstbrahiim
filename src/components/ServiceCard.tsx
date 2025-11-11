'use client'

import Link from 'next/link'
import type { FreelanceService } from '@/data/freelance-services'

type ServiceCardProps = {
  service: FreelanceService
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPriceLabel = () => {
    switch (service.priceType) {
      case 'starting-at':
        return 'À partir de'
      case 'hourly':
        return 'Par heure'
      case 'fixed':
        return 'Prix fixe'
      default:
        return ''
    }
  }

  return (
    <Link href={`/marketplace/${service.slug}`}>
      <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-kitchen-lux-dark-green-100 hover:border-kitchen-lux-dark-green-400/50 h-full flex flex-col">
        {/* Provider Header */}
        <div className="p-4 border-b border-kitchen-lux-dark-green-50 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kitchen-lux-dark-green-500 to-kitchen-lux-dark-green-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {service.providerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-kitchen-lux-dark-green-900 truncate">
                {service.providerName}
              </h3>
              {service.verified && (
                <span className="text-xs bg-kitchen-lux-dark-green-100 text-kitchen-lux-dark-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  Vérifié
                </span>
              )}
              {service.topRated && (
                <span className="text-xs bg-kitchen-warm-light text-kitchen-lux-dark-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  Top
                </span>
              )}
            </div>
            <p className="text-xs text-kitchen-lux-dark-green-600">{service.experienceLevel}</p>
          </div>
        </div>

        {/* Service Title & Description */}
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-semibold text-kitchen-lux-dark-green-800 mb-2 line-clamp-2 group-hover:text-kitchen-lux-dark-green-600 transition-colors">
            {service.serviceTitle}
          </h4>
          <p className="text-sm text-kitchen-lux-dark-green-700 mb-4 line-clamp-2">
            {service.shortDescription}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {service.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-700 px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
            {service.skills.length > 3 && (
              <span className="text-xs text-kitchen-lux-dark-green-500 px-2 py-1">
                +{service.skills.length - 3}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-kitchen-lux-dark-green-600 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-kitchen-warm-light-soft">★</span>
              <span className="font-semibold text-kitchen-lux-dark-green-900">{service.rating}</span>
              <span>({service.reviewsCount})</span>
            </div>
            <div>
              {service.completedProjects} projets complétés
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-kitchen-lux-dark-green-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-kitchen-lux-dark-green-600">{getPriceLabel()}</p>
              <p className="text-lg font-bold text-kitchen-lux-dark-green-600">
                {formatPrice(service.price)}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                service.availability === 'available'
                  ? 'bg-kitchen-lux-dark-green-100 text-kitchen-lux-dark-green-700'
                  : service.availability === 'busy'
                  ? 'bg-kitchen-warm-light text-kitchen-lux-dark-green-700'
                  : 'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-600'
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
