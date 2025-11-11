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
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-kitchen-lux-dark-green-600">Aucune commande trouvée</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-kitchen-lux-dark-green-200">
          <thead className="bg-kitchen-lux-dark-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Commande
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Paiement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-kitchen-lux-dark-green-100">
            {orders.map((order) => (
              <>
                <tr key={order.id} className="hover:bg-kitchen-lux-dark-green-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-kitchen-lux-dark-green-900">
                      {order.orderNumber}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-xs text-kitchen-lux-dark-green-500">
                        {order.trackingNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-kitchen-lux-dark-green-900">{order.customer.name}</div>
                    <div className="text-xs text-kitchen-lux-dark-green-500">{order.customer.wilaya}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-kitchen-lux-dark-green-600">
                    {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-kitchen-lux-dark-green-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500`}
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-3 py-1 rounded-full border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-900 mr-3"
                    >
                      {expandedOrderId === order.id ? 'Masquer' : 'Détails'}
                    </button>
                    <button
                      onClick={() => onViewDetails(order)}
                      className="text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-900"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-kitchen-lux-dark-green-25">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-kitchen-lux-dark-green-900 mb-2">Articles:</h4>
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
                                    <p className="text-kitchen-lux-dark-green-900">{item.productName}</p>
                                    <p className="text-kitchen-lux-dark-green-600">Quantité: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-semibold text-kitchen-lux-dark-green-900">
                                  {formatPrice(item.subtotal)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-kitchen-lux-dark-green-200">
                          <div>
                            <h4 className="font-semibold text-kitchen-lux-dark-green-900 mb-1">Adresse de livraison:</h4>
                            <p className="text-sm text-kitchen-lux-dark-green-700">
                              {order.customer.address}, {order.customer.wilaya}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-kitchen-lux-dark-green-900 mb-1">Contact:</h4>
                            <p className="text-sm text-kitchen-lux-dark-green-700">{order.customer.phone}</p>
                            <p className="text-sm text-kitchen-lux-dark-green-700">{order.customer.email}</p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="pt-3 border-t border-kitchen-lux-dark-green-200">
                            <h4 className="font-semibold text-kitchen-lux-dark-green-900 mb-1">Notes:</h4>
                            <p className="text-sm text-kitchen-lux-dark-green-700">{order.notes}</p>
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
