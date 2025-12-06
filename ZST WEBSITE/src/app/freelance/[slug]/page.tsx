'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getServiceBySlug } from '@/lib/supabase/services'

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchService = async () => {
      const foundService = await getServiceBySlug(slug)
      setService(foundService)
      setLoading(false)
    }

    fetchService()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Chargement du service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-elegant font-semibold text-text-primary mb-4">Service non trouvé</h1>
          <p className="text-text-muted mb-8">Le service que vous recherchez n&apos;existe pas.</p>
          <Link
            href="/freelance"
            className="bg-brand-primary text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-brand-primaryLight transition-colors"
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
    <div className="min-h-screen bg-brand-light px-4 py-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-border mb-8">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/freelance" className="hover:text-brand-primary transition-colors">
              Freelance
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium">{service.serviceTitle}</span>
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
                    <span className="bg-brand-primaryMuted text-brand-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {service.category}
                    </span>
                    {service.featured && (
                      <span className="bg-brand-primary/20 text-brand-primaryDark px-3 py-1 rounded-full text-sm font-semibold">
                        Recommandé
                      </span>
                    )}
                    {service.topRated && (
                      <span className="bg-accent-warning/20 text-accent-warning px-3 py-1 rounded-full text-sm font-semibold">
                        Top Rated
                      </span>
                    )}
                  </div>
                  <h1 className="font-elegant text-2xl md:text-3xl font-semibold text-text-primary mb-2">
                    {service.serviceTitle}
                  </h1>
                  <p className="text-text-secondary">{service.shortDescription}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-brand-primary text-lg">★</span>
                  <span className="font-bold text-text-primary">{service.rating}</span>
                  <span className="text-text-muted">({service.reviewsCount} avis)</span>
                </div>
                <div className="text-text-muted">
                  {service.completedProjects} projets complétés
                </div>
                <div className="text-text-muted">
                  Répond en {service.responseTime}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-elegant text-xl font-semibold text-text-primary mb-4">
                Description du service
              </h2>
              <div className="prose prose-slate max-w-none">
                {service.description.split('\n').map((paragraph: string, index: number) => {
                  // Check if it's a heading (starts with **)
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="font-semibold text-text-primary mt-6 mb-3 text-lg">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    )
                  }
                  // Check if it's a list item (starts with -)
                  if (paragraph.trim().startsWith('-')) {
                    return (
                      <li key={index} className="text-text-secondary ml-6">
                        {paragraph.replace(/^-\s*/, '')}
                      </li>
                    )
                  }
                  // Regular paragraph
                  if (paragraph.trim()) {
                    return (
                      <p key={index} className="text-text-secondary mb-4">
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
              <h2 className="font-elegant text-xl font-semibold text-text-primary mb-4">
                Compétences
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-brand-surface-muted text-text-secondary px-4 py-2 rounded-lg font-medium hover:bg-brand-primaryMuted hover:text-brand-primary transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Video Presentation */}
            {service.videoUrl && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-elegant text-xl font-semibold text-text-primary mb-4">
                  Vidéo de Présentation
                </h2>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={service.videoUrl}
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              </div>
            )}

            {/* Portfolio */}
            {service.portfolio && service.portfolio.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-elegant text-xl font-semibold text-text-primary mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.portfolio.map((item: any, index: number) => (
                    <div key={index} className="border border-brand-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {item.image ? (
                        <div className="aspect-video relative bg-brand-surface-muted">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-brand-primaryMuted to-brand-primary/10 flex items-center justify-center">
                          <span className="text-4xl">🎨</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                        <p className="text-sm text-text-muted">{item.description}</p>
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-primaryDark flex items-center justify-center text-neutral-900 font-bold text-2xl flex-shrink-0">
                    {service.providerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary text-lg">
                      {service.providerName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {service.verified && (
                        <span className="text-xs bg-accent-success/20 text-accent-success px-2 py-0.5 rounded-full font-medium">
                          Vérifié
                        </span>
                      )}
                      <span className="text-sm text-text-muted">
                        {service.experienceLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Langues:</span>
                    <span className="font-medium text-text-primary">
                      {service.languages.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Délai:</span>
                    <span className="font-medium text-text-primary">
                      {service.deliveryTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Révisions:</span>
                    <span className="font-medium text-text-primary">
                      {service.revisions === 'unlimited' ? 'Illimitées' : service.revisions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Disponibilité:</span>
                    <span
                      className={`font-medium ${
                        service.availability === 'available'
                          ? 'text-accent-success'
                          : service.availability === 'busy'
                          ? 'text-accent-warning'
                          : 'text-text-muted'
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
                  <div className="text-sm text-text-muted mb-1">{getPriceLabel()}</div>
                  <div className="text-3xl font-bold text-brand-primary">
                    {formatPrice(service.price)}
                  </div>
                </div>

                <button
                  onClick={handleContactProvider}
                  className="w-full bg-brand-primary text-neutral-900 py-4 rounded-lg font-bold text-lg hover:bg-brand-primaryLight transition-colors shadow-lg hover:shadow-xl mb-3"
                >
                  Contacter le prestataire
                </button>

                <Link
                  href="/freelance"
                  className="block text-center text-brand-primary font-semibold hover:text-brand-primaryDark transition-colors"
                >
                  Voir d&apos;autres services
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-br from-brand-primaryMuted to-brand-primary/10 rounded-lg p-6">
                <h3 className="font-semibold text-text-primary mb-4">Garanties</h3>
                <div className="space-y-3 text-sm text-text-secondary">
                  <div className="flex items-start gap-2">
                    <span className="text-accent-success mt-0.5">✓</span>
                    <span>Prestataire vérifié et qualifié</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-success mt-0.5">✓</span>
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-success mt-0.5">✓</span>
                    <span>Communication directe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-success mt-0.5">✓</span>
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
