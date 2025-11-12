'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { freelanceServices } from '@/data/freelance-services'
import { getServiceBySlug } from '@/lib/supabase/services'

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchService = async () => {
      // Try static services first
      let foundService = freelanceServices.find(s => s.slug === slug)
      
      // If not found, try database
      if (!foundService) {
        foundService = await getServiceBySlug(slug)
      }
      
      setService(foundService)
      setLoading(false)
    }
    
    fetchService()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kitchen-lux-dark-green-900 mx-auto mb-4"></div>
          <p className="text-kitchen-lux-dark-green-700">Chargement du service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 mb-4">Service non trouvé</h1>
          <p className="text-kitchen-lux-dark-green-700 mb-8">Le service que vous recherchez n&apos;existe pas.</p>
          <Link
            href="/freelance"
            className="bg-kitchen-lux-dark-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors"
          >
            Retour au Freelance
          </Link>
        </div>
      </div>
    )
  }

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

  const handleContactProvider = () => {
    const message = `Bonjour ${service.providerName}, je suis intéressé(e) par votre service: "${service.serviceTitle}". Pouvez-vous me donner plus d'informations?`
    const whatsappUrl = `https://wa.me/213797339451?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-kitchen-lux-dark-green-100 mb-8">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-kitchen-lux-dark-green-600">
            <Link href="/" className="hover:text-kitchen-lux-dark-green-600 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/freelance" className="hover:text-kitchen-lux-dark-green-600 transition-colors">
              Freelance
            </Link>
            <span>/</span>
            <span className="text-kitchen-lux-dark-green-800 font-medium">{service.serviceTitle}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Title & Category */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-kitchen-lux-dark-green-100 text-kitchen-lux-dark-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {service.category}
                    </span>
                    {service.featured && (
                      <span className="bg-kitchen-lux-dark-green-200 text-kitchen-lux-dark-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Recommandé
                      </span>
                    )}
                    {service.topRated && (
                      <span className="bg-kitchen-warm-light text-kitchen-lux-dark-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Top Rated
                      </span>
                    )}
                  </div>
                  <h1 className="font-elegant text-2xl md:text-3xl font-semibold text-kitchen-lux-dark-green-800 mb-2">
                    {service.serviceTitle}
                  </h1>
                  <p className="text-kitchen-lux-dark-green-700">{service.shortDescription}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-kitchen-warm-light-soft text-lg">★</span>
                  <span className="font-bold text-kitchen-lux-dark-green-800">{service.rating}</span>
                  <span className="text-kitchen-lux-dark-green-600">({service.reviewsCount} avis)</span>
                </div>
                <div className="text-kitchen-lux-dark-green-600">
                  {service.completedProjects} projets complétés
                </div>
                <div className="text-kitchen-lux-dark-green-600">
                  Répond en {service.responseTime}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-elegant text-xl font-semibold text-kitchen-lux-dark-green-800 mb-4">
                Description du service
              </h2>
              <div className="prose prose-slate max-w-none">
                {service.description.split('\n').map((paragraph: string, index: number) => {
                  // Check if it's a heading (starts with **)
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="font-semibold text-kitchen-lux-dark-green-800 mt-6 mb-3 text-lg">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    )
                  }
                  // Check if it's a list item (starts with -)
                  if (paragraph.trim().startsWith('-')) {
                    return (
                      <li key={index} className="text-kitchen-lux-dark-green-700 ml-6">
                        {paragraph.replace(/^-\s*/, '')}
                      </li>
                    )
                  }
                  // Regular paragraph
                  if (paragraph.trim()) {
                    return (
                      <p key={index} className="text-kitchen-lux-dark-green-700 mb-4">
                        {paragraph}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-elegant text-xl font-semibold text-kitchen-lux-dark-green-800 mb-4">
                Compétences
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-700 px-4 py-2 rounded-lg font-medium hover:bg-kitchen-lux-dark-green-100 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {service.portfolio.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-elegant text-xl font-semibold text-kitchen-lux-dark-green-800 mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.portfolio.map((item, index) => (
                    <div key={index} className="border border-kitchen-lux-dark-green-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-kitchen-lux-dark-green-800 mb-1">{item.title}</h3>
                        <p className="text-sm text-kitchen-lux-dark-green-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Provider Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kitchen-lux-dark-green-500 to-kitchen-lux-dark-green-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {service.providerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-kitchen-lux-dark-green-800 text-lg">
                      {service.providerName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {service.verified && (
                        <span className="text-xs bg-kitchen-lux-dark-green-100 text-kitchen-lux-dark-green-700 px-2 py-0.5 rounded-full font-medium">
                          Vérifié
                        </span>
                      )}
                      <span className="text-sm text-kitchen-lux-dark-green-600">
                        {service.experienceLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-kitchen-lux-dark-green-600">Langues:</span>
                    <span className="font-medium text-kitchen-lux-dark-green-800">
                      {service.languages.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-kitchen-lux-dark-green-600">Délai:</span>
                    <span className="font-medium text-kitchen-lux-dark-green-800">
                      {service.deliveryTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-kitchen-lux-dark-green-600">Révisions:</span>
                    <span className="font-medium text-kitchen-lux-dark-green-800">
                      {service.revisions === 'unlimited' ? 'Illimitées' : service.revisions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-kitchen-lux-dark-green-600">Disponibilité:</span>
                    <span
                      className={`font-medium ${
                        service.availability === 'available'
                          ? 'text-kitchen-lux-dark-green-600'
                          : service.availability === 'busy'
                          ? 'text-kitchen-warm-light-soft'
                          : 'text-kitchen-lux-dark-green-600'
                      }`}
                    >
                      {service.availability === 'available'
                        ? 'Disponible'
                        : service.availability === 'busy'
                        ? 'Occupé'
                        : 'Indisponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <div className="text-sm text-kitchen-lux-dark-green-600 mb-1">{getPriceLabel()}</div>
                  <div className="text-3xl font-bold text-kitchen-lux-dark-green-600">
                    {formatPrice(service.price)}
                  </div>
                </div>

                <button
                  onClick={handleContactProvider}
                  className="w-full bg-kitchen-lux-dark-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-kitchen-lux-dark-green-700 transition-colors shadow-lg hover:shadow-xl mb-3"
                >
                  Contacter le prestataire
                </button>

                <Link
                  href="/freelance"
                  className="block text-center text-kitchen-lux-dark-green-600 font-semibold hover:text-kitchen-lux-dark-green-700 transition-colors"
                >
                  Voir d&apos;autres services
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 rounded-lg p-6">
                <h3 className="font-semibold text-kitchen-lux-dark-green-800 mb-4">Garanties</h3>
                <div className="space-y-3 text-sm text-kitchen-lux-dark-green-700">
                  <div className="flex items-start gap-2">
                    <span className="text-kitchen-lux-dark-green-600 mt-0.5">✓</span>
                    <span>Prestataire vérifié et qualifié</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-kitchen-lux-dark-green-600 mt-0.5">✓</span>
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-kitchen-lux-dark-green-600 mt-0.5">✓</span>
                    <span>Communication directe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-kitchen-lux-dark-green-600 mt-0.5">✓</span>
                    <span>Support client disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
