'use client'

import { type SellerStats } from '@/data/orders'

type StatCardProps = {
  title: string
  value: string | number
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, trend, trendUp }: StatCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-kitchen-lux-dark-green-200 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-medium text-kitchen-lux-dark-green-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-kitchen-lux-dark-green-900 mb-2">{value}</p>
      {trend && (
        <p className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </div>
  )
}

type DashboardStatsProps = {
  stats: SellerStats
}

export function DashboardStats({ stats }: DashboardStatsProps): JSX.Element {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Commandes Totales"
        value={stats.totalOrders}
        trend="+12% ce mois"
        trendUp={true}
      />
      <StatCard
        title="Commandes en Attente"
        value={stats.pendingOrders}
        trend="Nécessite attention"
      />
      <StatCard
        title="Revenu Total"
        value={formatCurrency(stats.totalRevenue)}
        trend="+8.5% ce mois"
        trendUp={true}
      />
      <StatCard
        title="Revenu Mensuel"
        value={formatCurrency(stats.monthlyRevenue)}
        trend="+15% vs mois dernier"
        trendUp={true}
      />
      <StatCard
        title="Produits Actifs"
        value={stats.totalProducts}
        trend="48 en stock"
      />
      <StatCard
        title="Stock Faible"
        value={stats.lowStockProducts}
        trend="Nécessite réapprovisionnement"
      />
      <StatCard
        title="En Traitement"
        value={stats.processingOrders}
        trend="À expédier"
      />
      <StatCard
        title="Complétées"
        value={stats.completedOrders}
        trend={`${Math.round((stats.completedOrders / stats.totalOrders) * 100)}% taux de réussite`}
        trendUp={true}
      />
    </div>
  )
}
