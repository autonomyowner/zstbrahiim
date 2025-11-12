'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Order = {
  id: string
  orderNumber: string
  customer: {
    name: string
    phone: string
    address: string
    wilaya: string
  }
  items: Array<{
    productName: string
    productImage: string
    quantity: number
    price: number
    subtotal: number
  }>
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  deliveryDate: string | null
  trackingNumber: string | null
  notes: string | null
}

type CustomerOrderHistoryProps = {
  orders: Order[]
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'processing':
        return 'En traitement'
      case 'shipped':
        return 'Expédiée'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const getEstimatedDelivery = (order: Order): string => {
    if (order.status === 'delivered') {
      return 'Livrée'
    }
    if (order.deliveryDate) {
      return new Date(order.deliveryDate).toLocaleDateString('fr-FR')
    }
    
    // Calculate estimated delivery (3-5 days from creation)
    const orderDate = new Date(order.createdAt)
    const estimatedDate = new Date(orderDate)
    estimatedDate.setDate(estimatedDate.getDate() + 4) // 4 days average
    return `Estimée: ${estimatedDate.toLocaleDateString('fr-FR')}`
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-kitchen-lux-dark-green-600 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-kitchen-lux-dark-green-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-lg font-medium">Aucune commande</p>
          <p className="text-sm mt-2">Vous n&apos;avez pas encore passé de commande.</p>
        </div>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors"
        >
          Découvrir nos produits
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-kitchen-lux-dark-green-200"
        >
          {/* Order Header */}
          <div className="bg-kitchen-lux-dark-green-50 px-6 py-4 border-b border-kitchen-lux-dark-green-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900">
                  Commande {order.orderNumber}
                </h3>
                <p className="text-sm text-kitchen-lux-dark-green-600 mt-1">
                  Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-center py-3 border-b border-kitchen-lux-dark-green-100 last:border-0"
              >
                <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg border border-kitchen-lux-dark-green-200 overflow-hidden">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-contain p-2"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-kitchen-lux-dark-green-900">
                    {item.productName}
                  </p>
                  <p className="text-sm text-kitchen-lux-dark-green-600">
                    Quantité: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-kitchen-lux-dark-green-800">
                    {item.subtotal.toLocaleString()} DA
                  </p>
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-kitchen-lux-dark-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-kitchen-lux-dark-green-700">Total:</span>
                <span className="text-xl font-bold text-kitchen-lux-dark-green-900">
                  {order.total.toLocaleString()} DA
                </span>
              </div>
              
              {/* Delivery Estimate */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-kitchen-lux-dark-green-700">Livraison estimée:</span>
                <span className="font-medium text-kitchen-lux-dark-green-900">
                  {getEstimatedDelivery(order)}
                </span>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-kitchen-lux-dark-green-700">Numéro de suivi:</span>
                  <span className="font-mono font-medium text-kitchen-lux-dark-green-900">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Details Toggle */}
            <button
              onClick={() =>
                setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
              }
              className="w-full mt-4 text-sm text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 font-medium transition-colors"
            >
              {expandedOrderId === order.id ? '▲ Masquer les détails' : '▼ Voir les détails'}
            </button>

            {/* Expanded Details */}
            {expandedOrderId === order.id && (
              <div className="mt-4 p-4 bg-kitchen-lux-dark-green-50 rounded-lg space-y-2 text-sm">
                <div>
                  <span className="font-medium text-kitchen-lux-dark-green-800">
                    Adresse de livraison:
                  </span>
                  <p className="text-kitchen-lux-dark-green-700 mt-1">
                    {order.customer.address}
                    <br />
                    {order.customer.wilaya}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-kitchen-lux-dark-green-800">
                    Téléphone:
                  </span>
                  <p className="text-kitchen-lux-dark-green-700">{order.customer.phone}</p>
                </div>
                {order.notes && (
                  <div>
                    <span className="font-medium text-kitchen-lux-dark-green-800">Notes:</span>
                    <p className="text-kitchen-lux-dark-green-700">{order.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

