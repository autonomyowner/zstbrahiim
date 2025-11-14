'use client'

import type { SellerDashboardStats } from '@/lib/supabase/orders'

type AnalyticsSectionProps = {
  stats: SellerDashboardStats
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const safePercentage = (value: number, total: number): number => {
  if (total === 0) {
    return 0
  }
  return Math.round((value / total) * 100)
}

export function AnalyticsSection({ stats }: AnalyticsSectionProps): JSX.Element {
  const orderCompletionRate = Math.round(stats.completionRate)
  const averageOrderValue = Math.round(stats.averageOrderValue || 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Analytiques</p>
        <h2 className="text-2xl font-semibold text-text-primary">Rapports intelligents</h2>
        <p className="text-sm text-text-muted">{stats.range.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
          <h3 className="text-lg font-semibold text-text-primary">Aperçu des performances</h3>
          <div className="mt-4 space-y-4 text-sm text-text-muted">
            <div className="flex items-center justify-between">
              <span>Taux de complétion</span>
              <span className="text-lg font-bold text-text-primary">{orderCompletionRate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-brand-dark transition-all"
                style={{ width: `${orderCompletionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Valeur moyenne commande</span>
              <span className="text-lg font-bold text-text-primary">{formatCurrency(averageOrderValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Commandes totales</span>
              <span className="text-lg font-bold text-text-primary">{stats.totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
          <h3 className="text-lg font-semibold text-text-primary">Répartition des revenus</h3>
          <div className="mt-4 space-y-4 text-sm text-text-muted">
            <div className="flex items-center justify-between">
              <span>Revenu total</span>
              <span className="text-lg font-bold text-text-primary">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ce mois</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Croissance mensuelle</span>
              <span
                className={`text-lg font-bold ${
                  (stats.trend.monthlyRevenue ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stats.trend.monthlyRevenue !== null
                  ? `${stats.trend.monthlyRevenue > 0 ? '+' : ''}${Math.round(
                      (stats.trend.monthlyRevenue ?? 0) * 10
                    ) / 10}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
          <h3 className="text-lg font-semibold text-text-primary">Distribution des commandes</h3>
          <div className="mt-4 space-y-4 text-sm text-text-muted">
            {[
              { label: 'En attente', value: stats.pendingOrders, color: 'bg-amber-400' },
              { label: 'En traitement', value: stats.processingOrders, color: 'bg-sky-500' },
              { label: 'Complétées', value: stats.completedOrders, color: 'bg-green-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold text-text-primary">{item.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${safePercentage(item.value, stats.totalOrders)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
          <h3 className="text-lg font-semibold text-text-primary">Performance des produits</h3>
          <div className="mt-4 space-y-4 text-sm text-text-muted">
            <div className="flex items-center justify-between">
              <span>Produits actifs</span>
              <span className="text-lg font-bold text-text-primary">{stats.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Stock faible</span>
              <span className="text-lg font-bold text-orange-500">{stats.lowStockProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taux de disponibilité</span>
              <span className="text-lg font-bold text-green-600">
                {safePercentage(stats.totalProducts - stats.lowStockProducts, stats.totalProducts)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
        <h3 className="text-lg font-semibold text-text-primary">Résumé d&apos;activité</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 text-center md:grid-cols-3">
          <div className="rounded-2xl bg-brand-light/60 p-4">
            <p className="text-3xl font-bold text-text-primary">
              {stats.pendingOrders + stats.processingOrders}
            </p>
            <p className="text-sm text-text-muted">Commandes actives</p>
          </div>
          <div className="rounded-2xl bg-brand-light/60 p-4">
            <p className="text-3xl font-bold text-text-primary">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="text-sm text-text-muted">Revenu ce mois</p>
          </div>
          <div className="rounded-2xl bg-brand-light/60 p-4">
            <p className="text-3xl font-bold text-text-primary">{orderCompletionRate}%</p>
            <p className="text-sm text-text-muted">Taux de réussite</p>
          </div>
        </div>
      </div>
    </div>
  )
}
