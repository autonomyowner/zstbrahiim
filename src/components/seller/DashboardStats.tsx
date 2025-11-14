'use client'

import { type SellerStats } from '@/data/orders'

type StatCardProps = {
  title: string
  value: string | number
  trend?: string
  trendUp?: boolean
  icon: string
  accent: string
}

function StatCard({ title, value, trend, trendUp, icon, accent }: StatCardProps): JSX.Element {
  return (
    <div className="group rounded-xl sm:rounded-2xl border border-brand-border bg-white p-4 sm:p-5 shadow-card-sm hover:shadow-card-md hover:border-brand-dark transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3 mb-4">
        {trend && (
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
            trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            <span className="text-xs font-bold">{trendUp ? '▲' : '▼'}</span>
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-2 leading-tight">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-text-primary group-hover:text-brand-dark transition-colors break-words leading-tight">
          {value}
        </p>
      </div>
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

  const cards: StatCardProps[] = [
    {
      title: 'Commandes totales',
      value: stats.totalOrders,
      trend: '+12%',
      trendUp: true,
      icon: 'shopping_bag',
      accent: 'bg-brand-dark text-brand-primary',
    },
    {
      title: 'En attente',
      value: stats.pendingOrders,
      trend: 'Requise',
      trendUp: false,
      icon: 'hourglass_top',
      accent: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Revenu total',
      value: formatCurrency(stats.totalRevenue),
      trend: '+8.5%',
      trendUp: true,
      icon: 'trending_up',
      accent: 'bg-green-100 text-green-600',
    },
    {
      title: 'Revenu mensuel',
      value: formatCurrency(stats.monthlyRevenue),
      trend: '+15%',
      trendUp: true,
      icon: 'paid',
      accent: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Produits actifs',
      value: stats.totalProducts,
      icon: 'inventory_2',
      accent: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Stock faible',
      value: stats.lowStockProducts,
      icon: 'warning',
      accent: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'En traitement',
      value: stats.processingOrders,
      icon: 'local_shipping',
      accent: 'bg-sky-100 text-sky-600',
    },
    {
      title: 'Complétées',
      value: stats.completedOrders,
      trend: `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`,
      trendUp: true,
      icon: 'verified',
      accent: 'bg-emerald-100 text-emerald-600',
    },
  ]

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
