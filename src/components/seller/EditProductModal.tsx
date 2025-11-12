'use client'

import { useState, useEffect } from 'react'
import { type Product, type ProductType, type ProductNeed } from '@/data/products'
import { type ProductFormData } from './AddProductModal'
import { ImageUpload } from '@/components/ImageUpload'

type EditProductModalProps = {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onSubmit: (productId: string, productData: ProductFormData) => void
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
    benefits: '',
    ingredients: '',
    usageInstructions: '',
    deliveryEstimate: '2-3 jours',
    image: '/perfums/placeholder.jpg',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
        benefits: product.benefits.join('\n'),
        ingredients: product.ingredients,
        usageInstructions: product.usageInstructions,
        deliveryEstimate: product.deliveryEstimate,
        image: product.image,
      })
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

    onSubmit(product.id, formData)
    handleClose()
  }

  const handleClose = () => {
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
                    <option value="Parfums Femme" />
                    <option value="Parfums Homme" />
                    <option value="Vêtements Hiver" />
                    <option value="Vêtements Été" />
                    <option value="Accessoires Mode" />
                    <option value="Chaussures" />
                    <option value="Sacs et Maroquinerie" />
                    <option value="Cosmétiques" />
                    <option value="Bijoux" />
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
                    onChange={(e) => updateField('productType', e.target.value as ProductType)}
                    className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
                    placeholder="Ex: Manteau, Robe, Parfum..."
                    list="type-suggestions-edit"
                  />
                  <datalist id="type-suggestions-edit">
                    <option value="Parfum Femme" />
                    <option value="Parfum Homme" />
                    <option value="Eau de Parfum" />
                    <option value="Eau de Toilette" />
                    <option value="Manteau" />
                    <option value="Veste" />
                    <option value="Pull" />
                    <option value="Robe" />
                    <option value="Pantalon" />
                    <option value="Chemise" />
                    <option value="T-Shirt" />
                    <option value="Chaussures" />
                    <option value="Sac" />
                    <option value="Accessoire" />
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
                    <option value="Journée" />
                    <option value="Soirée" />
                    <option value="Quotidien" />
                    <option value="Spécial" />
                    <option value="Sport" />
                    <option value="Travail" />
                    <option value="Décontracté" />
                    <option value="Formel" />
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
                Enregistrer les Modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
