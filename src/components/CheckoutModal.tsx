'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/data/products'
import { supabase } from '@/lib/supabase/client'
import { createOrderFromCheckout } from '@/lib/supabase/orders'

type CheckoutModalProps = {
  product: Product
  quantity: number
  isOpen: boolean
  onClose: () => void
}

const ALGERIAN_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair',
  'El Meniaa'
]

export const CheckoutModal = ({
  product,
  quantity,
  isOpen,
  onClose,
}: CheckoutModalProps): JSX.Element | null => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    willaya: '',
    baladia: '',
    deliveryType: 'house' as 'house' | 'office',
    address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^(\+213|0)[567][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide'
    }

    if (!formData.willaya) {
      newErrors.willaya = 'La wilaya est requise'
    }

    if (!formData.baladia.trim()) {
      newErrors.baladia = 'La baladia est requise'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get current user (customer can be guest or authenticated)
      const { data: { user } } = await supabase.auth.getUser()
      
      const totalPrice = product.price * quantity
      
      // Get seller_id from product
      const productWithSeller = product as any
      const sellerId = productWithSeller.seller_id || null
      
      // Create order in database
      const orderData = {
        user_id: user?.id || null, // Can be null for guest checkout
        seller_id: sellerId,
        product_id: product.id,
        quantity: quantity,
        total_price: totalPrice,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_wilaya: formData.willaya,
        shipping_baladia: formData.baladia,
        shipping_address: formData.address,
        delivery_type: formData.deliveryType,
        status: 'pending' as const,
        payment_status: 'pending' as const,
      }
      
      const orderId = await createOrderFromCheckout(orderData)
      
      if (orderId) {
        setOrderSuccess(true)
        
        // Reset form after 2 seconds and close
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            willaya: '',
            baladia: '',
            deliveryType: 'house',
            address: '',
          })
          setOrderSuccess(false)
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setErrors({ submit: 'Erreur lors de la création de la commande. Veuillez réessayer.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-kitchen-lux-dark-green-600 to-kitchen-lux-dark-green-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-elegant font-semibold">
              Informations de Commande
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              type="button"
              aria-label="Fermer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="bg-kitchen-lux-dark-green-50 p-4 rounded-lg border border-kitchen-lux-dark-green-200">
            <h3 className="font-semibold text-kitchen-lux-dark-green-800 mb-2">
              Résumé de la commande
            </h3>
            <div className="space-y-1 text-sm text-kitchen-lux-dark-green-700">
              <p>
                <span className="font-medium">Produit:</span> {product.name}
              </p>
              <p>
                <span className="font-medium">Quantité:</span> {quantity}
              </p>
              <p>
                <span className="font-medium">Prix total:</span>{' '}
                <span className="text-lg font-bold text-kitchen-lux-dark-green-800">
                  {(product.price * quantity).toLocaleString()} DA
                </span>
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-2"
            >
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 ${
                errors.name ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
              }`}
              placeholder="Votre nom complet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 ${
                errors.email ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
              }`}
              placeholder="votre.email@exemple.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-2"
            >
              Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 ${
                errors.phone ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
              }`}
              placeholder="+213 673 73 45 78 ou 0673 73 45 78"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Willaya */}
          <div>
            <label
              htmlFor="willaya"
              className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-2"
            >
              Wilaya <span className="text-red-500">*</span>
            </label>
            <select
              id="willaya"
              name="willaya"
              value={formData.willaya}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 ${
                errors.willaya ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
              }`}
            >
              <option value="">Sélectionnez une wilaya</option>
              {ALGERIAN_WILAYAS.map((wilaya) => (
                <option key={wilaya} value={wilaya}>
                  {wilaya}
                </option>
              ))}
            </select>
            {errors.willaya && (
              <p className="mt-1 text-sm text-red-500">{errors.willaya}</p>
            )}
          </div>

          {/* Baladia */}
          <div>
            <label
              htmlFor="baladia"
              className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-2"
            >
              Baladia (Commune) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="baladia"
              name="baladia"
              value={formData.baladia}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 ${
                errors.baladia ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
              }`}
              placeholder="Nom de votre commune"
            />
            {errors.baladia && (
              <p className="mt-1 text-sm text-red-500">{errors.baladia}</p>
            )}
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-3">
              Type de livraison <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.deliveryType === 'house'
                    ? 'border-kitchen-lux-dark-green-600 bg-kitchen-lux-dark-green-50'
                    : 'border-kitchen-lux-dark-green-300 hover:border-kitchen-lux-dark-green-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="house"
                  checked={formData.deliveryType === 'house'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold text-kitchen-lux-dark-green-800">
                    À domicile
                  </div>
                  <div className="text-sm text-kitchen-lux-dark-green-600">
                    Livraison à votre adresse
                  </div>
                </div>
              </label>
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.deliveryType === 'office'
                    ? 'border-kitchen-lux-dark-green-600 bg-kitchen-lux-dark-green-50'
                    : 'border-kitchen-lux-dark-green-300 hover:border-kitchen-lux-dark-green-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="office"
                  checked={formData.deliveryType === 'office'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold text-kitchen-lux-dark-green-800">
                    Au bureau
                  </div>
                  <div className="text-sm text-kitchen-lux-dark-green-600">
                    Livraison au lieu de travail
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-kitchen-lux-dark-green-800 mb-2"
            >
              Adresse complète <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 ${
                errors.address ? 'border-red-500' : 'border-kitchen-lux-dark-green-300'
              }`}
              placeholder="Rue, numéro, quartier, etc."
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Success Message */}
          {orderSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ Commande créée avec succès! Le vendeur a été notifié.
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-kitchen-lux-dark-green-300 text-kitchen-lux-dark-green-800 rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || orderSuccess}
              className="flex-1 px-6 py-3 bg-kitchen-lux-dark-green-600 text-white rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : orderSuccess ? 'Commande créée!' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

