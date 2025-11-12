'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AddServiceModal, type ServiceFormData } from '@/components/freelancer/AddServiceModal'
import { EditServiceModal } from '@/components/freelancer/EditServiceModal'
import { getFreelanceServices, createService, updateService, deleteService } from '@/lib/supabase/services'
import { isFreelancer } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

export default function FreelancerDashboardPage() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any | null>(null)

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
        const allServices = await getFreelanceServices()
        const myServices = allServices.filter((s: any) => s.providerId === user.id)
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
        const updatedServices = await getFreelanceServices()
        const myServices = updatedServices.filter((s: any) => s.providerId === user.id)
        setServices(myServices)
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (error) {
      console.error('Error creating service:', error)
      setError('Erreur lors de la création du service')
    }
  }

  const handleEditService = (service: any) => {
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
      }

      const updated = await updateService(updatePayload)
      
      if (updated) {
        setSuccess('Service modifié avec succès!')
        const { data: { user } } = await supabase.auth.getUser()
        const updatedServices = await getFreelanceServices()
        const myServices = updatedServices.filter((s: any) => s.providerId === user?.id)
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
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kitchen-lux-dark-green-900 mx-auto mb-4"></div>
          <p className="text-kitchen-lux-dark-green-700">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-900 mb-2">
            Tableau de Bord Freelancer
          </h1>
          <p className="text-kitchen-lux-dark-green-700">
            Gérez vos services et votre portfolio
          </p>
        </div>

        {/* Services Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-kitchen-lux-dark-green-900">
              Mes Services ({services.length})
            </h2>
            <button
              onClick={handleAddService}
              className="px-6 py-3 bg-kitchen-lux-dark-green-600 text-white rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors"
            >
              + Ajouter un Service
            </button>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 text-kitchen-lux-dark-green-600">
              <p className="mb-4">Vous n&apos;avez pas encore de services.</p>
              <button
                onClick={handleAddService}
                className="text-kitchen-lux-dark-green-800 font-medium hover:underline"
              >
                Créer votre premier service →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="border border-kitchen-lux-dark-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-kitchen-lux-dark-green-900 mb-2">
                    {service.serviceTitle}
                  </h3>
                  <p className="text-sm text-kitchen-lux-dark-green-600 mb-2">
                    {service.category}
                  </p>
                  <p className="text-lg font-bold text-kitchen-lux-dark-green-800 mb-3">
                    {service.price.toLocaleString()} DA
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
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

