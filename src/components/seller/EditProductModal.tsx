'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { type Product, type ProductType, type ProductNeed, productCategoryOptions } from '@/data/products'
import { type ProductFormData, type ProductVideoFormValue } from './AddProductModal'
import { ImageUpload } from '@/components/ImageUpload'
import { extractVideoMetadata } from '@/utils/video'
import {
  MAX_PRODUCT_VIDEO_DURATION_SECONDS,
  MAX_PRODUCT_VIDEO_SIZE_BYTES,
} from '@/constants/media'

type EditProductModalProps = {
  isOpen: boolean
  product: (Product & { video?: any }) | any | null
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
    productType: 'Parfum Femme', // Default value kept for compatibility
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
        productType: product.productType as ProductType,
        need: (product.need as ProductNeed) || undefined,
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes editModalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes editFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes editSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .edit-modal-content {
          animation: editModalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .edit-modal-overlay {
          animation: editFadeIn 0.25s ease-out;
        }

        .edit-form-field {
          animation: editSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }

        .edit-form-field:nth-child(1) { animation-delay: 0.05s; }
        .edit-form-field:nth-child(2) { animation-delay: 0.1s; }
        .edit-form-field:nth-child(3) { animation-delay: 0.15s; }
        .edit-form-field:nth-child(4) { animation-delay: 0.2s; }
        .edit-form-field:nth-child(5) { animation-delay: 0.25s; }
        .edit-form-field:nth-child(6) { animation-delay: 0.3s; }
        .edit-form-field:nth-child(7) { animation-delay: 0.35s; }
        .edit-form-field:nth-child(8) { animation-delay: 0.4s; }
        .edit-form-field:nth-child(9) { animation-delay: 0.45s; }
      `}</style>

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end md:items-center justify-center min-h-screen px-0 md:px-4 py-0 md:py-8">
          {/* Overlay */}
          <div
            className="edit-modal-overlay fixed inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/70 to-slate-800/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal - full screen on mobile */}
          <div className="edit-modal-content relative bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header with gradient accent */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,168,89,0.1),transparent_50%)]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="inline-block mb-2">
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Modifier Produit
                    </span>
                  </div>
                  <h3 className="text-4xl font-light text-white tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Mettre à jour votre annonce
                  </h3>
                  <p className="mt-2 text-sm text-slate-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    ID: <span className="font-mono text-amber-400/80">{product.id.substring(0, 8)}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-8 max-h-[calc(100vh-280px)] overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="edit-form-field lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Nom du Produit <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={`luxury-input w-full px-5 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 ${
                        errors.name ? 'border-red-400' : 'border-slate-200'
                      }`}
                      placeholder="Ex: iPhone 14 Pro Max 256GB"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Brand */}
                  <div className="edit-form-field">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Marque <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => updateField('brand', e.target.value)}
                      className={`luxury-input w-full px-5 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 ${
                        errors.brand ? 'border-red-400' : 'border-slate-200'
                      }`}
                      placeholder="Ex: Apple, Samsung..."
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    {errors.brand && (
                      <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="edit-form-field">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Catégorie <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className={`luxury-input w-full px-5 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 ${
                        errors.category ? 'border-red-400' : 'border-slate-200'
                      }`}
                      placeholder="Choisissez une catégorie..."
                      list="category-suggestions-edit"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <datalist id="category-suggestions-edit">
                      {productCategoryOptions.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    {errors.category && (
                      <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="edit-form-field">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Prix <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField('price', parseFloat(e.target.value))}
                        className={`luxury-input w-full pl-5 pr-12 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 ${
                          errors.price ? 'border-red-400' : 'border-slate-200'
                        }`}
                        min="0"
                        step="100"
                        placeholder="0"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        DA
                      </span>
                    </div>
                    {errors.price && (
                      <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Original Price */}
                  <div className="edit-form-field">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Prix Original <span className="text-slate-400 text-xs font-normal">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.originalPrice || ''}
                        onChange={(e) => updateField('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="luxury-input w-full pl-5 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200"
                        min="0"
                        step="100"
                        placeholder="0"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        DA
                      </span>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="edit-form-field">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      État / Condition <span className="text-slate-400 text-xs font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.need || ''}
                      onChange={(e) => updateField('need', e.target.value || undefined)}
                      className="luxury-input w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200"
                      placeholder="Ex: Neuf, Occasion..."
                      list="need-suggestions-edit"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <datalist id="need-suggestions-edit">
                      <option value="Neuf" />
                      <option value="Occasion" />
                      <option value="Comme Neuf" />
                      <option value="Reconditionné" />
                      <option value="Bon État" />
                    </datalist>
                  </div>

                  {/* Delivery Estimate */}
                  <div className="edit-form-field">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Délai de Livraison
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryEstimate}
                      onChange={(e) => updateField('deliveryEstimate', e.target.value)}
                      className="luxury-input w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200"
                      placeholder="Ex: 2-3 jours"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>

                  {/* Description */}
                  <div className="edit-form-field lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Description <span className="text-amber-600">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={4}
                      className={`luxury-input w-full px-5 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-none transition-all duration-200 ${
                        errors.description ? 'border-red-400' : 'border-slate-200'
                      }`}
                      placeholder="Décrivez votre produit en détail..."
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Image & Video Upload */}
                  <div className="edit-form-field lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                      <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 h-full">
                        <ImageUpload
                          onImageUploaded={(url) => updateField('image', url)}
                          currentImageUrl={formData.image}
                          label="Image du produit"
                          required={false}
                        />
                      </div>
                    </div>

                    {/* Video Upload */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                      <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Vidéo <span className="text-slate-400 text-xs font-normal">(optionnel)</span>
                            </label>
                            <p className="text-xs text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              MP4/WebM • Max {MAX_PRODUCT_VIDEO_DURATION_SECONDS}s • 10 MB
                            </p>
                          </div>
                          {(product.video || videoSelection) && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={removeExistingVideo}
                                onChange={(e) => {
                                  setRemoveExistingVideo(e.target.checked)
                                  if (e.target.checked) {
                                    setVideoSelection(null)
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-xs text-slate-600 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Supprimer
                              </span>
                            </label>
                          )}
                        </div>

                        {!removeExistingVideo && (videoSelection || product.video) ? (
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                              <Image
                                src={
                                  videoSelection?.thumbnailDataUrl ||
                                  product.video?.thumbnailUrl ||
                                  '/perfums/placeholder.jpg'
                                }
                                alt="Miniature"
                                fill
                                sizes="64px"
                                className="object-cover"
                                unoptimized={Boolean(videoSelection?.thumbnailDataUrl)}
                              />
                              <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[10px] px-1 py-0.5 rounded">
                                {videoSelection?.durationSeconds || product.video?.durationSeconds || 0}s
                              </span>
                            </div>
                            <div className="text-sm text-slate-700 min-w-0 flex-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              <p className="font-semibold truncate">
                                {videoSelection ? 'Nouvelle vidéo' : 'Vidéo actuelle'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {videoSelection
                                  ? `${Math.round(videoSelection.file.size / 1024)} Ko`
                                  : product.video?.fileSizeBytes
                                  ? `${Math.round(product.video.fileSizeBytes / 1024)} Ko`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <label className="block w-full h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200">
                            <svg className="h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-slate-600 font-medium mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Cliquez pour ajouter
                            </p>
                            <p className="text-xs text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Vidéo de démonstration
                            </p>
                            <input
                              type="file"
                              accept="video/mp4,video/webm"
                              onChange={handleVideoChange}
                              className="hidden"
                            />
                          </label>
                        )}

                        {videoError && (
                          <p className="text-xs text-red-600 mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {videoError}
                          </p>
                        )}
                        {isProcessingVideo && (
                          <p className="text-xs text-slate-600 mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Analyse en cours...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggles */}
                  <div className="edit-form-field lg:col-span-2 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-4 tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Statut du produit
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={formData.inStock}
                            onChange={(e) => updateField('inStock', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-amber-500 transition-all duration-200" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-200" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          En stock
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={formData.isPromo}
                            onChange={(e) => updateField('isPromo', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-amber-500 transition-all duration-200" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-200" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          En promotion
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={formData.isNew}
                            onChange={(e) => updateField('isNew', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-amber-500 transition-all duration-200" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-200" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          Nouveau
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-slate-100 via-white to-slate-100 px-8 py-6 flex items-center justify-between border-t border-slate-200">
                <p className="text-xs text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <span className="text-amber-600">*</span> Champs obligatoires
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="luxury-button px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="luxury-button px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Enregistrer les Modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
