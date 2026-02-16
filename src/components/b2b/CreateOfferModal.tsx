'use client'

import { useState } from 'react'
type B2BOfferType = 'negotiable' | 'auction'

type CreateB2BOfferRequest = {
  title: string
  description: string
  images?: string[]
  tags?: string[]
  base_price: number
  min_quantity: number
  available_quantity: number
  offer_type: B2BOfferType
  starts_at?: string
  ends_at?: string
}
import { MultiImageUpload } from '@/components/MultiImageUpload'
import { VideoUpload } from '@/components/VideoUpload'

type CreateOfferModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (offerData: CreateB2BOfferRequest) => Promise<void>
  sellerCategory: 'importateur' | 'grossiste'
}

export default function CreateOfferModal({
  isOpen,
  onClose,
  onSubmit,
  sellerCategory,
}: CreateOfferModalProps) {
  const [formData, setFormData] = useState<CreateB2BOfferRequest>({
    title: '',
    description: '',
    images: [],
    tags: [],
    base_price: 0,
    min_quantity: 1,
    available_quantity: 0,
    offer_type: 'negotiable',
    starts_at: '',
    ends_at: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [videoUrl, setVideoUrl] = useState<string>('')

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleOfferTypeChange = (offerType: B2BOfferType) => {
    setFormData((prev) => ({
      ...prev,
      offer_type: offerType,
      // Clear auction fields if switching to negotiable
      starts_at: offerType === 'auction' ? prev.starts_at : '',
      ends_at: offerType === 'auction' ? prev.ends_at : '',
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }
    if (formData.base_price <= 0) {
      newErrors.base_price = 'Le prix de base doit être supérieur à 0'
    }
    if (formData.min_quantity <= 0) {
      newErrors.min_quantity = 'La quantité minimale doit être supérieure à 0'
    }
    if (formData.available_quantity <= 0) {
      newErrors.available_quantity = 'La quantité disponible doit être supérieure à 0'
    }
    if (formData.available_quantity < formData.min_quantity) {
      newErrors.available_quantity = 'La quantité disponible doit être supérieure ou égale à la quantité minimale'
    }

    // Validate auction-specific fields
    if (formData.offer_type === 'auction') {
      if (!formData.starts_at) {
        newErrors.starts_at = 'La date de début est requise pour les enchères'
      }
      if (!formData.ends_at) {
        newErrors.ends_at = 'La date de fin est requise pour les enchères'
      }
      if (formData.starts_at && formData.ends_at) {
        const startDate = new Date(formData.starts_at)
        const endDate = new Date(formData.ends_at)
        const now = new Date()

        if (startDate < now) {
          newErrors.starts_at = 'La date de début doit être dans le futur'
        }
        if (endDate <= startDate) {
          newErrors.ends_at = 'La date de fin doit être après la date de début'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        title: '',
        description: '',
        images: [],
        tags: [],
        base_price: 0,
        min_quantity: 1,
        available_quantity: 0,
        offer_type: 'negotiable',
        starts_at: '',
        ends_at: '',
      })
      setVideoUrl('')
    } catch (error) {
      console.error('Error creating offer:', error)
      setErrors({ submit: 'Erreur lors de la création de l\'offre' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTargetAudience = () => {
    return sellerCategory === 'importateur' ? 'Grossistes' : 'Fournisseurs (Détaillants)'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Créer une offre B2B</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Votre offre sera visible pour: <span className="font-semibold">{getTargetAudience()}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Offer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d&apos;offre *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOfferTypeChange('negotiable')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.offer_type === 'negotiable'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Négociable</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Les acheteurs proposent leur prix
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleOfferTypeChange('auction')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.offer_type === 'auction'
                      ? 'border-brand-primary bg-brand-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Enchère</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Les acheteurs enchérissent
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l&apos;offre *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: 1000 unités de parfum premium"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Décrivez votre offre en détail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price and Quantities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.offer_type === 'auction' ? 'Prix de départ (DZD) *' : 'Prix de base (DZD) *'}
                </label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                    errors.base_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.base_price && <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>}
              </div>

              <div>
                <label htmlFor="min_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité minimale *
                </label>
                <input
                  type="number"
                  id="min_quantity"
                  name="min_quantity"
                  value={formData.min_quantity || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                    errors.min_quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  min="1"
                />
                {errors.min_quantity && <p className="mt-1 text-sm text-red-600">{errors.min_quantity}</p>}
              </div>

              <div>
                <label htmlFor="available_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité disponible *
                </label>
                <input
                  type="number"
                  id="available_quantity"
                  name="available_quantity"
                  value={formData.available_quantity || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                    errors.available_quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="1"
                />
                {errors.available_quantity && <p className="mt-1 text-sm text-red-600">{errors.available_quantity}</p>}
              </div>
            </div>

            {/* Auction Dates */}
            {formData.offer_type === 'auction' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="datetime-local"
                    id="starts_at"
                    name="starts_at"
                    value={formData.starts_at || ''}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.starts_at ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.starts_at && <p className="mt-1 text-sm text-red-600">{errors.starts_at}</p>}
                </div>

                <div>
                  <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin *
                  </label>
                  <input
                    type="datetime-local"
                    id="ends_at"
                    name="ends_at"
                    value={formData.ends_at || ''}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      errors.ends_at ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.ends_at && <p className="mt-1 text-sm text-red-600">{errors.ends_at}</p>}
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <MultiImageUpload
                onImagesUploaded={(urls) =>
                  setFormData((prev) => ({ ...prev, images: urls }))
                }
                currentImages={formData.images}
                label="Images de l'offre (optionnel)"
                maxImages={5}
                required={false}
              />
            </div>

            {/* Video */}
            <div>
              <VideoUpload
                onVideoUploaded={setVideoUrl}
                currentVideoUrl={videoUrl}
                label="Vidéo du produit (optionnel)"
                required={false}
                bucketPath="b2b-videos"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optionnel)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-gray-900 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création...' : 'Créer l\'offre'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
