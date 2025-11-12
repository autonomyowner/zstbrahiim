'use client'

import { useState } from 'react'
import { type ProductType, type ProductNeed } from '@/data/products'
import { ImageUpload } from '@/components/ImageUpload'

type AddProductModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: ProductFormData) => void
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

    onSubmit(formData)
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
                    Type de Produit - Optionnel
                  </label>
                  <input
                    type="text"
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => updateField('productType', e.target.value)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Ex: Smartphone, Voiture, Meuble..."
                    list="type-suggestions"
                  />
                  <datalist id="type-suggestions">
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
                    currentImageUrl={formData.image}
                    label="Image du produit"
                    required={false}
                  />
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
