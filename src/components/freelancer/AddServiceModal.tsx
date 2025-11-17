'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageUpload } from '@/components/ImageUpload'
import { VideoUpload } from '@/components/VideoUpload'

type ServiceCategory = 'Développement Web' | 'Design Graphique' | 'Montage Vidéo' | 'Marketing Digital' | 'Rédaction' | 'Photographie' | 'Traduction' | 'Consultation'
type ExperienceLevel = 'Débutant' | 'Intermédiaire' | 'Expert'
type PriceType = 'fixed' | 'hourly' | 'starting-at'

export type ServiceFormData = {
  serviceTitle: string
  category: ServiceCategory
  experienceLevel: ExperienceLevel
  price: number
  priceType: PriceType
  shortDescription: string
  description: string
  skills: string
  deliveryTime: string
  revisions: string
  languages: string
  responseTime: string
  portfolioImages: string[]
  videoUrl?: string
}

type AddServiceModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (serviceData: ServiceFormData) => void
}

export function AddServiceModal({ isOpen, onClose, onSubmit }: AddServiceModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceTitle: '',
    category: 'Développement Web',
    experienceLevel: 'Intermédiaire',
    price: 0,
    priceType: 'fixed',
    shortDescription: '',
    description: '',
    skills: '',
    deliveryTime: '3-5 jours',
    revisions: '2 révisions',
    languages: 'Français, Arabe',
    responseTime: '2 heures',
    portfolioImages: [],
    videoUrl: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentPortfolioImage, setCurrentPortfolioImage] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.serviceTitle.trim()) newErrors.serviceTitle = 'Le titre est requis'
    if (formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0'
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'La description courte est requise'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'
    if (!formData.skills.trim()) newErrors.skills = 'Les compétences sont requises'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      serviceTitle: '',
      category: 'Développement Web',
      experienceLevel: 'Intermédiaire',
      price: 0,
      priceType: 'fixed',
      shortDescription: '',
      description: '',
      skills: '',
      deliveryTime: '3-5 jours',
      revisions: '2 révisions',
      languages: 'Français, Arabe',
      responseTime: '2 heures',
      portfolioImages: [],
      videoUrl: '',
    })
    setErrors({})
    setCurrentPortfolioImage('')
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

  const addPortfolioImage = (url: string) => {
    if (url && formData.portfolioImages.length < 6) {
      updateField('portfolioImages', [...formData.portfolioImages, url])
      setCurrentPortfolioImage('')
    }
  }

  const removePortfolioImage = (index: number) => {
    updateField('portfolioImages', formData.portfolioImages.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-4 my-8">
        {/* Header */}
        <div className="sticky top-0 bg-kitchen-lux-dark-green-600 text-white p-6 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-elegant font-semibold">Ajouter un Service</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Service Title */}
            <div className="md:col-span-2">
              <label htmlFor="serviceTitle" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Titre du Service *
              </label>
              <input
                type="text"
                id="serviceTitle"
                value={formData.serviceTitle}
                onChange={(e) => updateField('serviceTitle', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                  errors.serviceTitle ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                }`}
                placeholder="Ex: Développement de sites web modernes et réactifs"
              />
              {errors.serviceTitle && <p className="text-red-500 text-xs mt-1">{errors.serviceTitle}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value as ServiceCategory)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
              >
                <option value="Développement Web">Développement Web</option>
                <option value="Design Graphique">Design Graphique</option>
                <option value="Montage Vidéo">Montage Vidéo</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="Rédaction">Rédaction</option>
                <option value="Photographie">Photographie</option>
                <option value="Traduction">Traduction</option>
                <option value="Consultation">Consultation</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Niveau d&apos;Expérience *
              </label>
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={(e) => updateField('experienceLevel', e.target.value as ExperienceLevel)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Prix (DA) *
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                }`}
                min="0"
                step="100"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Price Type */}
            <div>
              <label htmlFor="priceType" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Type de Prix *
              </label>
              <select
                id="priceType"
                value={formData.priceType}
                onChange={(e) => updateField('priceType', e.target.value as PriceType)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
              >
                <option value="fixed">Prix fixe</option>
                <option value="hourly">Par heure</option>
                <option value="starting-at">À partir de</option>
              </select>
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Description Courte *
              </label>
              <input
                type="text"
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                  errors.shortDescription ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                }`}
                placeholder="Résumé en une ligne de votre service"
                maxLength={120}
              />
              {errors.shortDescription && <p className="text-red-500 text-xs mt-1">{errors.shortDescription}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Description Détaillée *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                }`}
                placeholder="Décrivez votre service en détail..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label htmlFor="skills" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Compétences * (séparées par des virgules)
              </label>
              <input
                type="text"
                id="skills"
                value={formData.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                  errors.skills ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                }`}
                placeholder="Ex: React, TypeScript, Next.js, Tailwind CSS"
              />
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
            </div>

            {/* Delivery Time */}
            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Délai de Livraison
              </label>
              <input
                type="text"
                id="deliveryTime"
                value={formData.deliveryTime}
                onChange={(e) => updateField('deliveryTime', e.target.value)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                placeholder="Ex: 3-5 jours"
              />
            </div>

            {/* Revisions */}
            <div>
              <label htmlFor="revisions" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Révisions Incluses
              </label>
              <input
                type="text"
                id="revisions"
                value={formData.revisions}
                onChange={(e) => updateField('revisions', e.target.value)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                placeholder="Ex: 2 révisions, Illimitées"
              />
            </div>

            {/* Languages */}
            <div>
              <label htmlFor="languages" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Langues (séparées par des virgules)
              </label>
              <input
                type="text"
                id="languages"
                value={formData.languages}
                onChange={(e) => updateField('languages', e.target.value)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                placeholder="Ex: Français, Arabe, Anglais"
              />
            </div>

            {/* Response Time */}
            <div>
              <label htmlFor="responseTime" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                Temps de Réponse
              </label>
              <input
                type="text"
                id="responseTime"
                value={formData.responseTime}
                onChange={(e) => updateField('responseTime', e.target.value)}
                className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                placeholder="Ex: 2 heures, 24 heures"
              />
            </div>

            {/* Portfolio Images */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-kitchen-lux-dark-green-800 mb-4">
                Portfolio (Images de vos réalisations)
              </h3>
              
              {/* Current Portfolio Images */}
              {formData.portfolioImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {formData.portfolioImages.map((url, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={url} alt={`Portfolio ${index + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Portfolio Image */}
              {formData.portfolioImages.length < 6 && (
                <div>
                  <ImageUpload
                    onImageUploaded={addPortfolioImage}
                    currentImageUrl={currentPortfolioImage}
                    label={`Image Portfolio ${formData.portfolioImages.length + 1}/6`}
                    required={false}
                  />
                  <p className="text-xs text-kitchen-lux-dark-green-600 mt-2">
                    Ajoutez 3 à 6 images de vos meilleurs travaux
                  </p>
                </div>
              )}

              {/* Video Upload */}
              <div>
                <VideoUpload
                  onVideoUploaded={(url) => updateField('videoUrl', url)}
                  currentVideoUrl={formData.videoUrl}
                  label="Vidéo de présentation du service (optionnel)"
                  required={false}
                  bucketPath="service-videos"
                />
                <p className="text-xs text-kitchen-lux-dark-green-600 mt-2">
                  Ajoutez une vidéo pour montrer votre travail et vos compétences
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-kitchen-lux-dark-green-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-kitchen-lux-dark-green-300 text-kitchen-lux-dark-green-800 rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-kitchen-lux-dark-green-600 text-white rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors"
            >
              Créer le Service
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

