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
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'processing':
        return 'bg-sky-100 text-sky-700 border-sky-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200'
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
    const orderDate = new Date(order.createdAt)
    const estimatedDate = new Date(orderDate)
    estimatedDate.setDate(estimatedDate.getDate() + 4)
    return `Estimée: ${estimatedDate.toLocaleDateString('fr-FR')}`
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-brand-border bg-white/95 p-8 text-center shadow-card-sm">
        <div className="text-text-muted">
          <span className="material-symbols-outlined mx-auto mb-4 block text-4xl text-brand-dark/60">
            shopping_bag
          </span>
          <p className="text-lg font-semibold text-text-primary">Aucune commande</p>
          <p className="mt-2 text-sm">Vous n&apos;avez pas encore passé de commande.</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-dark px-6 py-3 text-sm font-semibold text-text-inverted transition hover:bg-black"
        >
          Découvrir nos produits
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const primaryItem = order.items[0]
        return (
          <div key={order.id} className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-col gap-3 md:w-48">
                <div className="relative h-40 overflow-hidden rounded-2xl bg-neutral-50">
                  {primaryItem?.productImage ? (
                    <Image
                      src={primaryItem.productImage}
                      alt={primaryItem.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>
                  )}
                </div>
                <span
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Commande</p>
                    <h3 className="text-2xl font-semibold text-text-primary">{order.orderNumber}</h3>
                  </div>
                  <p className="text-sm text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="grid gap-4 border-t border-brand-border pt-4 text-sm text-text-muted sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">Montant</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {order.total.toLocaleString()} DA
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">Livraison</p>
                    <p className="font-medium text-text-primary">{getEstimatedDelivery(order)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">Client</p>
                    <p className="font-medium text-text-primary">{order.customer.name}</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-brand-border bg-brand-light/60 p-4 text-sm text-text-muted">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text-primary">{item.productName}</p>
                        <p>Quantité: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-text-primary">{item.subtotal.toLocaleString()} DA</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {order.trackingNumber && (
                    <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-muted">
                      {order.trackingNumber}
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                    }
                    className="text-sm font-semibold text-brand-dark underline-offset-4 hover:underline"
                  >
                    {expandedOrderId === order.id ? 'Masquer les détails' : 'Voir les détails'}
                  </button>
                </div>

                {expandedOrderId === order.id && (
                  <div className="space-y-3 rounded-2xl border border-brand-border bg-white/80 p-4 text-sm text-text-muted">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em]">Adresse de livraison</p>
                      <p className="font-semibold text-text-primary">
                        {order.customer.address}, {order.customer.wilaya}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em]">Contact</p>
                      <p>{order.customer.phone}</p>
                    </div>
                    {order.notes && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em]">Notes</p>
                        <p>{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

