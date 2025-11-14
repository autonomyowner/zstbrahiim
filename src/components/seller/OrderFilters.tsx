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
    <div className="mb-6 rounded-2xl border border-brand-border bg-white/90 p-6 shadow-card-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="order-search" className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
            Rechercher
          </label>
          <div className="mt-2 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              search
            </span>
            <input
              type="text"
              id="order-search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="N° commande, client..."
              className="w-full rounded-full border border-brand-border bg-white py-3 pl-12 pr-4 text-sm text-text-primary focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
            Statut commande
          </label>
          <div className="mt-2">
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as OrderStatus | 'all')}
              className="w-full rounded-2xl border border-brand-border bg-white py-3 px-4 text-sm font-semibold text-text-primary focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="all">Toutes</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
            Statut paiement
          </label>
          <div className="mt-2">
            <select
              value={paymentFilter}
              onChange={(event) => onPaymentFilterChange(event.target.value as PaymentStatus | 'all')}
              className="w-full rounded-2xl border border-brand-border bg-white py-3 px-4 text-sm font-semibold text-text-primary focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
    </div>
  )
}
