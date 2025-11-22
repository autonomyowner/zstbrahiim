'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { type Product, type ProductType, type ProductNeed } from '@/data/products'
import { type ProductFormData, type ProductVideoFormValue } from './AddProductModal'
import { ImageUpload } from '@/components/ImageUpload'
import { extractVideoMetadata } from '@/utils/video'
import {
  MAX_PRODUCT_VIDEO_DURATION_SECONDS,
  MAX_PRODUCT_VIDEO_SIZE_BYTES,
} from '@/constants/media'

type EditProductModalProps = {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onSubmit: (
    productId: string,
    productData: ProductFormData,
    video?: ProductVideoFormValue | null,
    removeVideo?: boolean
  ) => void
}

export function EditProductModal({ isOpen, product, onClose, onSubmit }: EditProductModalProps): JSX.Element | null {
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
    deliveryEstimate: '2-3 jours',
    image: '/perfums/placeholder.jpg',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [videoSelection, setVideoSelection] = useState<ProductVideoFormValue | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isProcessingVideo, setIsProcessingVideo] = useState(false)
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        productType: product.productType,
        need: product.need,
        inStock: product.inStock,
        isPromo: product.isPromo,
        isNew: product.isNew || false,
        description: product.description,
        deliveryEstimate: product.deliveryEstimate,
        image: product.image,
      })
      setVideoSelection(null)
      setVideoError(null)
      setRemoveExistingVideo(false)
    }
  }, [product])

  if (!isOpen || !product) return null

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

    onSubmit(product.id, formData, videoSelection, removeExistingVideo)
    handleClose()
  }

  const handleClose = () => {
    setErrors({})
    setVideoSelection(null)
    setVideoError(null)
    setIsProcessingVideo(false)
    setRemoveExistingVideo(false)
    onClose()
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
      setRemoveExistingVideo(false)
    } catch (error: any) {
      setVideoSelection(null)
      setVideoError(error?.message || 'Impossible de traiter cette vidéo.')
    } finally {
      setIsProcessingVideo(false)
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
                Modifier le Produit
              </h3>
              <p className="text-kitchen-lux-dark-green-100 text-sm mt-1">ID: {product.id}</p>
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
                    placeholder="Ex: Vêtements Hiver, Parfums, Accessoires..."
                    list="category-suggestions-edit"
                  />
                  <datalist id="category-suggestions-edit">
                    <option value="Téléphones & Accessoires" />
                    <option value="Informatique" />
                    <option value="Électroménager & Électronique" />
                    <option value="Automobiles & Véhicules" />
                    <option value="Pièces détachées" />
                    <option value="Meubles & Maison" />
                    <option value="Matériaux & Équipement" />
                    <option value="Vêtements & Mode" />
                    <option value="Santé & Beauté" />
                    <option value="Loisirs & Divertissements" />
                    <option value="Parfums" />
                    <option value="Accessoires" />
                  </datalist>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                {/* Product Type */}
                <div>
                  <label htmlFor="productType" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Type de Produit *
                  </label>
                  <input
                    type="text"
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => updateField('productType', e.target.value)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Ex: Manteau, Robe, Parfum..."
                    list="type-suggestions-edit"
                  />
                  <datalist id="type-suggestions-edit">
                    <option value="Smartphone" />
                    <option value="Ordinateur Portable" />
                    <option value="Tablette" />
                    <option value="Télévision" />
                    <option value="Réfrigérateur" />
                    <option value="Voiture" />
                    <option value="Moto" />
                    <option value="Canapé" />
                    <option value="Table" />
                    <option value="Vêtement" />
                    <option value="Chaussures" />
                    <option value="Parfum" />
                    <option value="Cosmétique" />
                  </datalist>
                </div>

                {/* Need */}
                <div>
                  <label htmlFor="need" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
                    Occasion / Usage - Optionnel
                  </label>
                  <input
                    type="text"
                    id="need"
                    value={formData.need || ''}
                    onChange={(e) => updateField('need', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Ex: Journée, Soirée, Sport..."
                    list="need-suggestions-edit"
                  />
                  <datalist id="need-suggestions-edit">
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
                    currentImageUrl={formData.image}
                    label="Image du produit"
                    required={false}
                  />
                </div>

                {/* Video Upload */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-1">
                        Vidéo de démonstration
                      </label>
                      <p className="text-xs text-kitchen-lux-dark-green-500">
                        MP4/WebM • {MAX_PRODUCT_VIDEO_DURATION_SECONDS}s max • 10 MB max
                      </p>
                    </div>
                    {(product.video || videoSelection) && (
                      <label className="flex items-center text-xs text-kitchen-lux-dark-green-700 gap-2">
                        <input
                          type="checkbox"
                          checked={removeExistingVideo}
                          onChange={(e) => {
                            setRemoveExistingVideo(e.target.checked)
                            if (e.target.checked) {
                              setVideoSelection(null)
                            }
                          }}
                        />
                        Supprimer la vidéo actuelle
                      </label>
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

                  {(videoSelection || product.video) && !removeExistingVideo && (
                    <div className="flex items-center gap-4 rounded-xl border border-kitchen-lux-dark-green-200 bg-kitchen-lux-dark-green-50 p-3">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-kitchen-lux-dark-green-200">
                        <Image
                          src={
                            videoSelection?.thumbnailDataUrl ||
                            product.video?.thumbnailUrl ||
                            '/perfums/placeholder.jpg'
                          }
                          alt="Miniature vidéo"
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized={Boolean(videoSelection?.thumbnailDataUrl)}
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                          {videoSelection?.durationSeconds || product.video?.durationSeconds || 0}s
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
                        <p className="font-semibold">
                          {videoSelection ? 'Nouvelle vidéo' : 'Vidéo actuelle'}
                        </p>
                        <p className="text-xs text-kitchen-lux-dark-green-500">
                          {videoSelection
                            ? `${Math.round(videoSelection.file.size / 1024)} Ko`
                            : product.video
                            ? `${Math.round(product.video.fileSizeBytes / 1024)} Ko`
                            : ''}
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
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
                Enregistrer les Modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
