'use client'

import { type OrderStatus, type PaymentStatus } from '@/data/orders'

type OrderFiltersProps = {
  statusFilter: OrderStatus | 'all'
  paymentFilter: PaymentStatus | 'all'
  searchQuery: string
  onStatusFilterChange: (status: OrderStatus | 'all') => void
  onPaymentFilterChange: (status: PaymentStatus | 'all') => void
  onSearchQueryChange: (query: string) => void
}

export function OrderFilters({
  statusFilter,
  paymentFilter,
  searchQuery,
  onStatusFilterChange,
  onPaymentFilterChange,
  onSearchQueryChange,
}: OrderFiltersProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">Filtres</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
            Rechercher
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="N° commande, client..."
            className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
            Statut Commande
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as OrderStatus | 'all')}
            className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
          >
            <option value="all">Toutes</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
        <div>
          <label htmlFor="payment" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
            Statut Paiement
          </label>
          <select
            id="payment"
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value as PaymentStatus | 'all')}
            className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="paid">Payée</option>
            <option value="failed">Échouée</option>
            <option value="refunded">Remboursée</option>
          </select>
        </div>
      </div>
    </div>
  )
}
