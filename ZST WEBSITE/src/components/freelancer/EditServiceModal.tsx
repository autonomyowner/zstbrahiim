'use client'

import { useState, useEffect } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { type ServiceFormData } from './AddServiceModal'

type Service = {
  id: string
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
  portfolio?: Array<{ image?: string; imageUrl?: string; title?: string; description?: string; displayOrder?: number }>
}

type EditServiceModalProps = {
  isOpen: boolean
  service: Service | null
  onClose: () => void
  onSubmit: (serviceId: string, serviceData: ServiceFormData) => void
}

export function EditServiceModal({ isOpen, service, onClose, onSubmit }: EditServiceModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceTitle: '',
    category: 'Développement Web' as any,
    experienceLevel: 'Intermédiaire' as any,
    price: 0,
    priceType: 'fixed' as any,
    shortDescription: '',
    description: '',
    skills: '',
    deliveryTime: '3-5 jours',
    revisions: '2 révisions',
    languages: 'Français, Arabe',
    responseTime: '2 heures',
    portfolioImages: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (service) {
      setFormData({
        serviceTitle: service.serviceTitle,
        category: service.category as any,
        experienceLevel: service.experienceLevel as any,
        price: service.price,
        priceType: service.priceType as any,
        shortDescription: service.shortDescription,
        description: service.description,
        skills: service.skills.join(', '),
        deliveryTime: service.deliveryTime,
        revisions: service.revisions,
        languages: service.languages.join(', '),
        responseTime: service.responseTime,
        portfolioImages: service.portfolio?.map(p => p.image || p.imageUrl).filter((url): url is string => !!url) || [],
      })
    }
  }, [service])

  if (!isOpen || !service) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.serviceTitle.trim()) newErrors.serviceTitle = 'Le titre est requis'
    if (formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(service.id, formData)
    onClose()
  }

  const updateField = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-4 my-8">
        <div className="sticky top-0 bg-kitchen-lux-dark-green-600 text-white p-6 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-elegant font-semibold">Modifier le Service</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors" type="button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Titre du Service *
              </label>
              <input
                type="text"
                value={formData.serviceTitle}
                onChange={(e) => updateField('serviceTitle', e.target.value)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Prix (DA) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Type de Prix
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => updateField('priceType', e.target.value)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg"
              >
                <option value="fixed">Prix fixe</option>
                <option value="hourly">Par heure</option>
                <option value="starting-at">À partir de</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-kitchen-lux-dark-green-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-kitchen-lux-dark-green-300 text-kitchen-lux-dark-green-800 rounded-lg font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-kitchen-lux-dark-green-600 text-white rounded-lg font-semibold"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

