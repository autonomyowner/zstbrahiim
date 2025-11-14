'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Order, type OrderStatus, getStatusColor, getStatusLabel, getPaymentStatusColor, getPaymentStatusLabel, formatOrderDate, formatPrice } from '@/data/orders'

type OrdersTableProps = {
  orders: Order[]
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void
  onViewDetails: (order: Order) => void
}

export function OrdersTable({ orders, onUpdateStatus, onViewDetails }: OrdersTableProps): JSX.Element {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-border bg-white/90 py-12 text-center text-text-muted shadow-card-sm">
        Aucune commande trouvée
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-border bg-white/95 shadow-card-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-border/60">
          <thead className="bg-brand-light/60">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Commande
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Paiement
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60 bg-white">
            {orders.map((order) => (
              <>
                <tr key={order.id} className="transition hover:bg-brand-light/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-text-primary">
                      {order.orderNumber}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-xs text-text-muted">
                        {order.trackingNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-text-primary">{order.customer.name}</div>
                    <div className="text-xs text-text-muted">{order.customer.wilaya}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs rounded-full border px-3 py-1 ${getStatusColor(
                        order.status,
                      )} focus:outline-none focus:ring-2 focus:ring-brand-primary/40`}
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${getPaymentStatusColor(
                        order.paymentStatus,
                      )}`}
                    >
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="mr-3 text-brand-dark underline-offset-4 hover:underline"
                    >
                      {expandedOrderId === order.id ? 'Masquer' : 'Détails'}
                    </button>
                    <button
                      onClick={() => onViewDetails(order)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan={7} className="bg-brand-light/60 px-6 py-6">
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 font-semibold text-text-primary">Articles:</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-3">
                                  <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div>
                                    <p className="text-text-primary">{item.productName}</p>
                                    <p className="text-text-muted">Quantité: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-semibold text-text-primary">
                                  {formatPrice(item.subtotal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 border-t border-brand-border pt-3 text-sm text-text-muted md:grid-cols-2">
                          <div>
                            <h4 className="mb-1 font-semibold text-text-primary">Adresse de livraison:</h4>
                            <p>
                              {order.customer.address}, {order.customer.wilaya}
                            </p>
                          </div>
                          <div>
                            <h4 className="mb-1 font-semibold text-text-primary">Contact:</h4>
                            <p>{order.customer.phone}</p>
                            <p>{order.customer.email}</p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="border-t border-brand-border pt-3">
                            <h4 className="mb-1 font-semibold text-text-primary">Notes:</h4>
                            <p className="text-sm text-text-muted">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
