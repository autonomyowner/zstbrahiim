'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { AddServiceModal, type ServiceFormData } from '@/components/freelancer/AddServiceModal'
import { EditServiceModal } from '@/components/freelancer/EditServiceModal'

// Adapted service type for frontend display
type AdaptedService = {
  id: string
  slug: string
  providerId: string
  serviceTitle: string
  category: string
  experienceLevel: string
  price: number
  priceType: string
  shortDescription: string
  description: string
  skills: string[]
  deliveryTime: string
  revisions: string
  languages: string[]
  responseTime: string
  availability: string
  featured: boolean | null
  verified: boolean | null
  topRated: boolean | null
  rating: number
  reviewsCount: number
  completedProjects: number
  portfolio: Array<{
    title: string
    description: string
    imageUrl: string
    displayOrder: number
  }>
  provider?: {
    providerName: string | null
    providerAvatar: string | null
    bio: string | null
  }
}

export default function FreelancerDashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<AdaptedService | null>(null)

  // Convex reactive query - fetches all services
  const allServices = useQuery(api.services.getFreelanceServices, {})

  // Convex mutations
  const createServiceMutation = useMutation(api.services.createService)
  const updateServiceMutation = useMutation(api.services.updateService)
  const deleteServiceMutation = useMutation(api.services.deleteService)

  // Filter services to only show the current freelancer's services
  const services: AdaptedService[] = (allServices ?? [])
    .filter((s: any) => s.providerId === user?._id)
    .map((s: any) => ({
      id: s._id || s.id,
      slug: s.slug,
      providerId: s.providerId,
      serviceTitle: s.serviceTitle,
      category: s.category,
      experienceLevel: s.experienceLevel,
      price: s.price,
      priceType: s.priceType,
      shortDescription: s.shortDescription,
      description: s.description,
      skills: s.skills || [],
      deliveryTime: s.deliveryTime,
      revisions: s.revisions,
      languages: s.languages || [],
      responseTime: s.responseTime,
      availability: s.availability,
      featured: s.featured ?? null,
      verified: s.verified ?? null,
      topRated: s.topRated ?? null,
      rating: s.rating ?? 0,
      reviewsCount: s.reviewsCount ?? 0,
      completedProjects: s.completedProjects ?? 0,
      portfolio: (s.portfolio || []).map((p: any) => ({
        title: p.title || '',
        description: p.description || '',
        imageUrl: p.image || p.imageUrl || '',
        displayOrder: p.displayOrder ?? 0,
      })),
      provider: s.providerName ? {
        providerName: s.providerName || null,
        providerAvatar: s.providerAvatar || null,
        bio: null,
      } : undefined,
    }))

  // Auth check - redirect if not freelancer or admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin')
      return
    }
    if (!isLoading && user && user.role !== 'freelancer' && user.role !== 'admin') {
      router.push('/signin')
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleAddService = () => {
    setIsAddServiceModalOpen(true)
  }

  const handleAddServiceSubmit = async (serviceData: ServiceFormData) => {
    try {
      setError(null)

      await createServiceMutation({
        slug: `${serviceData.serviceTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        serviceTitle: serviceData.serviceTitle,
        category: serviceData.category as any,
        experienceLevel: serviceData.experienceLevel as any,
        price: serviceData.price,
        priceType: serviceData.priceType as any,
        shortDescription: serviceData.shortDescription,
        description: serviceData.description,
        skills: serviceData.skills.split(',').map(s => s.trim()).filter(s => s),
        deliveryTime: serviceData.deliveryTime,
        revisions: serviceData.revisions,
        languages: serviceData.languages.split(',').map(s => s.trim()).filter(s => s),
        responseTime: serviceData.responseTime,
        availability: 'available' as any,
        portfolio: serviceData.portfolioImages.map((url, index) => ({
          title: `Work ${index + 1}`,
          description: '',
          imageUrl: url,
          displayOrder: index,
        })),
      })

      setSuccess('Service cree avec succes!')
      setTimeout(() => setSuccess(null), 3000)
      // No need to manually refetch - Convex reactivity auto-updates the list
    } catch (error) {
      console.error('Error creating service:', error)
      setError('Erreur lors de la creation du service')
    }
  }

  const handleEditService = (service: AdaptedService) => {
    setSelectedService(service)
    setIsEditServiceModalOpen(true)
  }

  const handleEditServiceSubmit = async (serviceId: string, serviceData: ServiceFormData) => {
    try {
      setError(null)

      await updateServiceMutation({
        serviceId: serviceId as Id<"freelanceServices">,
        serviceTitle: serviceData.serviceTitle,
        price: serviceData.price,
        priceType: serviceData.priceType as any,
        shortDescription: serviceData.shortDescription,
        description: serviceData.description,
        skills: serviceData.skills.split(',').map(s => s.trim()).filter(s => s),
        deliveryTime: serviceData.deliveryTime,
        revisions: serviceData.revisions,
        languages: serviceData.languages.split(',').map(s => s.trim()).filter(s => s),
        responseTime: serviceData.responseTime,
      })

      setSuccess('Service modifie avec succes!')
      setTimeout(() => setSuccess(null), 3000)
      // No need to manually refetch - Convex reactivity auto-updates the list
    } catch (error) {
      console.error('Error updating service:', error)
      setError('Erreur lors de la modification')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce service?')) {
      try {
        await deleteServiceMutation({
          serviceId: serviceId as Id<"freelanceServices">,
        })

        setSuccess('Service supprime!')
        setTimeout(() => setSuccess(null), 3000)
        // No need to manually refetch - Convex reactivity auto-updates the list
      } catch (error) {
        console.error('Error deleting service:', error)
        setError('Erreur lors de la suppression')
      }
    }
  }

  // Show loading state while auth is checking or services are loading
  const isPageLoading = isLoading || (!isLoading && isAuthenticated && user && (user.role === 'freelancer' || user.role === 'admin') && allServices === undefined)

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-dark"></div>
          <p className="text-text-muted">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800 shadow-card-md animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-card-md animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <section className="rounded-2xl sm:rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-5 sm:p-8 shadow-card-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-muted">
                Freelance
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary mt-2 break-words">
                Tableau de bord freelancer
              </h1>
              <p className="mt-3 text-xs sm:text-sm font-medium text-text-muted leading-relaxed">
                Publiez vos services, ajustez vos tarifs et mettez à jour votre portfolio.
              </p>
            </div>
            <button
              onClick={handleAddService}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-dark px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-brand-primary transition-all hover:bg-black shadow-card-sm hover:shadow-card-md transform hover:scale-105 whitespace-nowrap"
            >
              + Nouveau service
            </button>
          </div>

        </section>

        <section className="rounded-2xl sm:rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-5 sm:p-8 shadow-card-md">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary break-words">
                Mes services ({services.length})
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-medium text-text-muted leading-relaxed">
                Optimisez votre vitrine freelance sur ZST Marketplace.
              </p>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center mb-6">
                <span className="text-2xl text-text-muted font-bold">0</span>
              </div>
              <p className="text-text-muted font-medium mb-4">Vous n&apos;avez pas encore de services.</p>
              <button
                onClick={handleAddService}
                className="inline-flex items-center gap-2 text-brand-dark font-bold hover:text-text-primary transition-colors min-h-[44px]"
              >
                Créer votre premier service &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group flex flex-col gap-4 rounded-xl sm:rounded-2xl border border-brand-border bg-white p-4 sm:p-6 shadow-card-sm hover:shadow-card-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-dark"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-muted break-words">
                      {service.category}
                    </p>
                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-text-primary group-hover:text-brand-dark transition-colors break-words line-clamp-2">
                      {service.serviceTitle}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-text-muted break-words">
                      {service.experienceLevel}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-brand-border">
                    <p className="text-xl sm:text-2xl font-black text-text-primary break-words">
                      {service.price.toLocaleString()} <span className="text-xs sm:text-sm font-normal">DA</span>
                    </p>
                    <p className="text-xs font-medium text-text-muted mt-1">/ {service.priceType}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 rounded-lg sm:rounded-xl border border-brand-border bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-text-primary hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1 rounded-lg sm:rounded-xl border border-red-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:border-red-400 hover:bg-red-50 transition-all shadow-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <AddServiceModal
          isOpen={isAddServiceModalOpen}
          onClose={() => setIsAddServiceModalOpen(false)}
          onSubmit={handleAddServiceSubmit}
        />
        <EditServiceModal
          isOpen={isEditServiceModalOpen}
          service={selectedService}
          onClose={() => setIsEditServiceModalOpen(false)}
          onSubmit={handleEditServiceSubmit}
        />
      </div>
    </div>
  )
}
