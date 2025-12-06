'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AddServiceModal, type ServiceFormData } from '@/components/freelancer/AddServiceModal'
import { EditServiceModal } from '@/components/freelancer/EditServiceModal'
import { getFreelanceServices, createService, updateService, deleteService } from '@/lib/supabase/services'
import { isFreelancer } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import type { FreelanceServiceWithDetails } from '@/lib/supabase/types'

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
  const [services, setServices] = useState<AdaptedService[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<AdaptedService | null>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasFreelancerAccess = await isFreelancer()
        if (!hasFreelancerAccess) {
          router.push('/signin')
          return
        }
        setAuthChecking(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/signin')
      }
    }
    checkAuth()
  }, [router])

  // Fetch services
  useEffect(() => {
    if (authChecking) return

    const fetchServices = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch only this freelancer's services
        const allServices = await getFreelanceServices() as AdaptedService[]
        const myServices = allServices.filter((s) => s.providerId === user.id)
        setServices(myServices)
      } catch (error) {
        console.error('Error fetching services:', error)
        setError('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [authChecking])

  const handleAddService = () => {
    setIsAddServiceModalOpen(true)
  }

  const handleAddServiceSubmit = async (serviceData: ServiceFormData) => {
    try {
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const servicePayload = {
        slug: `${serviceData.serviceTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        provider_id: user.id,
        service_title: serviceData.serviceTitle,
        category: serviceData.category,
        experience_level: serviceData.experienceLevel,
        price: serviceData.price,
        price_type: serviceData.priceType,
        short_description: serviceData.shortDescription,
        description: serviceData.description,
        skills: serviceData.skills.split(',').map(s => s.trim()).filter(s => s),
        delivery_time: serviceData.deliveryTime,
        revisions: serviceData.revisions,
        languages: serviceData.languages.split(',').map(s => s.trim()).filter(s => s),
        response_time: serviceData.responseTime,
        availability: 'available' as const,
        featured: false,
        verified: false,
        top_rated: false,
        video_url: serviceData.videoUrl || null,
        portfolio: serviceData.portfolioImages.map((url, index) => ({
          title: `Work ${index + 1}`,
          description: '',
          image_url: url,
          display_order: index,
        })),
      }

      const serviceId = await createService(servicePayload)
      
      if (serviceId) {
        setSuccess('Service créé avec succès!')
        const updatedServices = await getFreelanceServices() as AdaptedService[]
        const myServices = updatedServices.filter((s) => s.providerId === user.id)
        setServices(myServices)
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (error) {
      console.error('Error creating service:', error)
      setError('Erreur lors de la création du service')
    }
  }

  const handleEditService = (service: AdaptedService) => {
    setSelectedService(service)
    setIsEditServiceModalOpen(true)
  }

  const handleEditServiceSubmit = async (serviceId: string, serviceData: ServiceFormData) => {
    try {
      setError(null)

      const updatePayload = {
        id: serviceId,
        service_title: serviceData.serviceTitle,
        price: serviceData.price,
        price_type: serviceData.priceType,
        short_description: serviceData.shortDescription,
        description: serviceData.description,
        skills: serviceData.skills.split(',').map(s => s.trim()).filter(s => s),
        delivery_time: serviceData.deliveryTime,
        revisions: serviceData.revisions,
        languages: serviceData.languages.split(',').map(s => s.trim()).filter(s => s),
        response_time: serviceData.responseTime,
        video_url: serviceData.videoUrl || null,
      }

      const updated = await updateService(updatePayload)
      
      if (updated) {
        setSuccess('Service modifié avec succès!')
        const { data: { user } } = await supabase.auth.getUser()
        const updatedServices = await getFreelanceServices() as AdaptedService[]
        const myServices = updatedServices.filter((s) => s.providerId === user?.id)
        setServices(myServices)
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (error) {
      console.error('Error updating service:', error)
      setError('Erreur lors de la modification')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service?')) {
      try {
        const deleted = await deleteService(serviceId)
        if (deleted) {
          setSuccess('Service supprimé!')
          setServices(services.filter(s => s.id !== serviceId))
          setTimeout(() => setSuccess(null), 3000)
        }
      } catch (error) {
        console.error('Error deleting service:', error)
        setError('Erreur lors de la suppression')
      }
    }
  }

  if (authChecking || loading) {
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
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="font-semibold">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-card-md animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">error</span>
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
              <span className="material-symbols-outlined text-base">add</span>
              Nouveau service
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
              <div className="mx-auto w-fit p-6 rounded-2xl bg-neutral-50 mb-6">
                <span className="material-symbols-outlined text-6xl text-text-muted">work</span>
              </div>
              <p className="text-text-muted font-medium mb-4">Vous n&apos;avez pas encore de services.</p>
              <button
                onClick={handleAddService}
                className="inline-flex items-center gap-2 text-brand-dark font-bold hover:text-text-primary transition-colors"
              >
                Créer votre premier service
                <span className="material-symbols-outlined text-base">arrow_forward</span>
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

