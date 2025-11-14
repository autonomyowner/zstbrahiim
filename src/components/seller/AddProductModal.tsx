'use client'

import { useState } from 'react'
import { type ProductType, type ProductNeed, productCategoryOptions } from '@/data/products'
import { ImageUpload } from '@/components/ImageUpload'
import { extractVideoMetadata } from '@/utils/video'
import {
  MAX_PRODUCT_VIDEO_SIZE_BYTES,
  MAX_PRODUCT_VIDEO_DURATION_SECONDS,
} from '@/constants/media'

type AddProductModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: ProductFormData, video?: ProductVideoFormValue | null) => void
}

export type ProductFormData = {
  name: string
  brand: string
  price: number
  originalPrice?: number
  category: string
  productType: ProductType
  need?: ProductNeed
  inStock: boolean
  isPromo: boolean
  isNew: boolean
  description: string
  benefits: string
  ingredients: string
  usageInstructions: string
  deliveryEstimate: string
  image: string
}

export type ProductVideoFormValue = {
  file: File
  durationSeconds: number
  thumbnailBlob: Blob
  thumbnailDataUrl: string
}

export function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps): JSX.Element | null {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: 'ZST',
    price: 0,
    category: '',
    productType: 'Parfum Femme',
    inStock: true,
    isPromo: false,
    isNew: true,
    description: '',
    benefits: '',
    ingredients: '',
    usageInstructions: '',
    deliveryEstimate: '2-3 jours',
    image: '/perfums/placeholder.jpg',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [videoSelection, setVideoSelection] = useState<ProductVideoFormValue | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isProcessingVideo, setIsProcessingVideo] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.brand.trim()) newErrors.brand = 'La marque est requise'
    if (formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'
    if (!formData.category.trim()) newErrors.category = 'La catégorie est requise'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData, videoSelection)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      brand: 'ZST',
      price: 0,
      category: '',
      productType: 'Parfum Femme',
      inStock: true,
      isPromo: false,
      isNew: true,
      description: '',
      benefits: '',
      ingredients: '',
      usageInstructions: '',
      deliveryEstimate: '2-3 jours',
      image: '/perfums/placeholder.jpg',
    })
    setErrors({})
    setVideoSelection(null)
    setVideoError(null)
    setIsProcessingVideo(false)
    onClose()
  }
  const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setVideoSelection(null)
      setVideoError(null)
      return
    }

    if (file.size > MAX_PRODUCT_VIDEO_SIZE_BYTES) {
      setVideoSelection(null)
      setVideoError('La vidéo doit faire moins de 10 MB.')
      return
    }

    setIsProcessingVideo(true)
    setVideoError(null)

    try {
      const metadata = await extractVideoMetadata(file)
      setVideoSelection({
        file,
        durationSeconds: metadata.durationSeconds,
        thumbnailBlob: metadata.thumbnailBlob,
        thumbnailDataUrl: metadata.thumbnailDataUrl,
      })
    } catch (error: any) {
      setVideoSelection(null)
      setVideoError(error?.message || 'Impossible de traiter cette vidéo.')
    } finally {
      setIsProcessingVideo(false)
    }
  }


  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-kitchen-lux-dark-green-600 px-6 py-4">
              <h3 className="text-2xl font-elegant font-semibold text-white">
                Ajouter un Nouveau Produit
              </h3>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                    }`}
                    placeholder="Ex: Parfum Luxury Rose"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Marque *
                  </label>
                  <input
                    type="text"
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => updateField('brand', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                      errors.brand ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                    }`}
                  />
                  {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
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

                {/* Original Price */}
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Prix Original (DA) - Optionnel
                  </label>
                  <input
                    type="number"
                    id="originalPrice"
                    value={formData.originalPrice || ''}
                    onChange={(e) => updateField('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Catégorie *
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                    }`}
                    placeholder="Ex: Électronique, Vêtements, Automobiles..."
                    list="category-suggestions"
                  />
                  <datalist id="category-suggestions">
                    {productCategoryOptions.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                {/* Condition / État (Optional) */}
                <div>
                  <label htmlFor="need" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    État / Condition - Optionnel
                  </label>
                  <input
                    type="text"
                    id="need"
                    value={formData.need || ''}
                    onChange={(e) => updateField('need', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Ex: Neuf, Occasion, Comme Neuf..."
                    list="need-suggestions"
                  />
                  <datalist id="need-suggestions">
                    <option value="Neuf" />
                    <option value="Occasion" />
                    <option value="Comme Neuf" />
                    <option value="Reconditionné" />
                    <option value="Bon État" />
                    <option value="Très Bon État" />
                    <option value="État Moyen" />
                  </datalist>
                </div>

                {/* Delivery Estimate */}
                <div>
                  <label htmlFor="deliveryEstimate" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Délai de Livraison
                  </label>
                  <input
                    type="text"
                    id="deliveryEstimate"
                    value={formData.deliveryEstimate}
                    onChange={(e) => updateField('deliveryEstimate', e.target.value)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <ImageUpload
                    onImageUploaded={(url) => updateField('image', url)}
                    showPreview={false}
                    label="Image du produit"
                    required={false}
                  />
                </div>

                {/* Video Upload */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-1">
                        Vidéo de démonstration (optionnel)
                      </label>
                      <p className="text-xs text-kitchen-lux-dark-green-500">
                        MP4/WebM • {MAX_PRODUCT_VIDEO_DURATION_SECONDS}s max • 10 MB max
                      </p>
                    </div>
                    {videoSelection && (
                      <button
                        type="button"
                        onClick={() => {
                          setVideoSelection(null)
                          setVideoError(null)
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Supprimer la vidéo
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoChange}
                    className="w-full text-sm text-kitchen-lux-dark-green-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kitchen-lux-dark-green-50 file:text-kitchen-lux-dark-green-700 hover:file:bg-kitchen-lux-dark-green-100"
                  />
                  {videoError && <p className="text-xs text-red-600">{videoError}</p>}
                  {isProcessingVideo && (
                    <p className="text-xs text-kitchen-lux-dark-green-600">Analyse de la vidéo...</p>
                  )}
                  {videoSelection && (
                    <div className="flex items-center gap-4 rounded-xl border border-kitchen-lux-dark-green-200 bg-kitchen-lux-dark-green-50 p-3">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-kitchen-lux-dark-green-200">
                        <img
                          src={videoSelection.thumbnailDataUrl}
                          alt="Miniature vidéo"
                          className="object-cover w-full h-full"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                          {videoSelection.durationSeconds}s
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white drop-shadow"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                          </svg>
                        </span>
                      </div>
                      <div className="text-sm text-kitchen-lux-dark-green-700">
                        <p className="font-semibold">Vidéo prête</p>
                        <p className="text-xs text-kitchen-lux-dark-green-500">
                          {Math.round(videoSelection.file.size / 1024)} Ko
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
                    }`}
                    placeholder="Décrivez le produit..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Benefits */}
                <div className="md:col-span-2">
                  <label htmlFor="benefits" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Caractéristiques / Avantages (un par ligne)
                  </label>
                  <textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => updateField('benefits', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Haute qualité&#10;Confortable&#10;Design élégant&#10;Matière premium"
                  />
                </div>

                {/* Ingredients / Materials */}
                <div className="md:col-span-2">
                  <label htmlFor="ingredients" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Composition / Matériaux
                  </label>
                  <textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => updateField('ingredients', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="100% Coton, Polyester, Laine..."
                  />
                </div>

                {/* Usage Instructions / Care */}
                <div className="md:col-span-2">
                  <label htmlFor="usageInstructions" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Instructions d&apos;Entretien / Utilisation
                  </label>
                  <textarea
                    id="usageInstructions"
                    value={formData.usageInstructions}
                    onChange={(e) => updateField('usageInstructions', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Lavage à 30°C, Séchage à l'air libre..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => updateField('inStock', e.target.checked)}
                      className="w-4 h-4 text-kitchen-lux-dark-green-600 border-kitchen-lux-dark-green-300 rounded focus:ring-kitchen-lux-dark-green-500"
                    />
                    <span className="ml-2 text-sm text-kitchen-lux-dark-green-700">En stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPromo}
                      onChange={(e) => updateField('isPromo', e.target.checked)}
                      className="w-4 h-4 text-kitchen-lux-dark-green-600 border-kitchen-lux-dark-green-300 rounded focus:ring-kitchen-lux-dark-green-500"
                    />
                    <span className="ml-2 text-sm text-kitchen-lux-dark-green-700">En promotion</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => updateField('isNew', e.target.checked)}
                      className="w-4 h-4 text-kitchen-lux-dark-green-600 border-kitchen-lux-dark-green-300 rounded focus:ring-kitchen-lux-dark-green-500"
                    />
                    <span className="ml-2 text-sm text-kitchen-lux-dark-green-700">Nouveau produit</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-kitchen-lux-dark-green-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-kitchen-lux-dark-green-300 text-kitchen-lux-dark-green-700 rounded-lg hover:bg-kitchen-lux-dark-green-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors"
              >
                Ajouter le Produit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
