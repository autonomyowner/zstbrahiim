'use client'

import Image from 'next/image'
import { type Order, formatOrderDate, formatPrice, getStatusColor, getStatusLabel, getPaymentStatusColor, getPaymentStatusLabel } from '@/data/orders'

type OrderDetailsModalProps = {
  isOpen: boolean
  order: Order | null
  onClose: () => void
  onPrintInvoice: (order: Order) => void
}

export function OrderDetailsModal({ isOpen, order, onClose, onPrintInvoice }: OrderDetailsModalProps): JSX.Element | null {
  if (!isOpen || !order) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end md:items-center justify-center min-h-screen px-0 md:px-4 pt-0 md:pt-4 pb-0 md:pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal - full screen on mobile */}
        <div className="inline-block align-bottom bg-white rounded-t-3xl md:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-kitchen-lux-dark-green-600 px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-elegant font-semibold text-white">
                  Détails de la Commande
                </h3>
                <p className="text-kitchen-lux-dark-green-100 text-sm mt-1">{order.orderNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-kitchen-lux-dark-green-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* Order Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-kitchen-lux-dark-green-200">
              <div>
                <h4 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">Statut de la Commande</h4>
                <span className={`inline-block text-sm px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">Statut du Paiement</h4>
                <span className={`inline-block text-sm px-4 py-2 rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-kitchen-lux-dark-green-200">
              <div>
                <h4 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">Date de Commande</h4>
                <p className="text-kitchen-lux-dark-green-900">{formatOrderDate(order.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">Dernière Mise à Jour</h4>
                <p className="text-kitchen-lux-dark-green-900">{formatOrderDate(order.updatedAt)}</p>
              </div>
              {order.deliveryDate && (
                <div>
                  <h4 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">Date de Livraison</h4>
                  <p className="text-kitchen-lux-dark-green-900">{formatOrderDate(order.deliveryDate)}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <h4 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">Numéro de Suivi</h4>
                  <p className="text-kitchen-lux-dark-green-900 font-mono">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="mb-6 pb-6 border-b border-kitchen-lux-dark-green-200">
              <h4 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">Informations Client</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-kitchen-lux-dark-green-600">Nom</p>
                  <p className="text-kitchen-lux-dark-green-900 font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-kitchen-lux-dark-green-600">Email</p>
                  <p className="text-kitchen-lux-dark-green-900">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-kitchen-lux-dark-green-600">Téléphone</p>
                  <p className="text-kitchen-lux-dark-green-900">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-kitchen-lux-dark-green-600">Wilaya</p>
                  <p className="text-kitchen-lux-dark-green-900">{order.customer.wilaya}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-kitchen-lux-dark-green-600">Adresse</p>
                  <p className="text-kitchen-lux-dark-green-900">{order.customer.address}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6 pb-6 border-b border-kitchen-lux-dark-green-200">
              <h4 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">Articles Commandés</h4>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-kitchen-lux-dark-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-kitchen-lux-dark-green-900">{item.productName}</p>
                        <p className="text-sm text-kitchen-lux-dark-green-600">ID: {item.productId}</p>
                        <p className="text-sm text-kitchen-lux-dark-green-600">
                          Prix unitaire: {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-kitchen-lux-dark-green-600">Quantité: {item.quantity}</p>
                      <p className="text-lg font-bold text-kitchen-lux-dark-green-900">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="mb-6">
              <div className="bg-kitchen-lux-dark-green-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-kitchen-lux-dark-green-700">Sous-total:</span>
                  <span className="text-kitchen-lux-dark-green-900">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-kitchen-lux-dark-green-700">Livraison:</span>
                  <span className="text-kitchen-lux-dark-green-900">
                    {order.total >= 20000 ? 'Gratuite' : formatPrice(500)}
                  </span>
                </div>
                <div className="border-t border-kitchen-lux-dark-green-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-kitchen-lux-dark-green-900">Total:</span>
                    <span className="text-2xl font-bold text-kitchen-lux-dark-green-900">
                      {formatPrice(order.total >= 20000 ? order.total : order.total + 500)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-2">Notes</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-kitchen-lux-dark-green-700">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-kitchen-lux-dark-green-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-kitchen-lux-dark-green-300 text-kitchen-lux-dark-green-700 rounded-lg hover:bg-kitchen-lux-dark-green-100 transition-colors"
            >
              Fermer
            </button>
            <div className="space-x-3">
              <a
                href={`https://wa.me/${order.customer.phone.replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Contacter Client
              </a>
              <button
                onClick={() => onPrintInvoice(order)}
                className="px-6 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors"
              >
                Imprimer Facture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
