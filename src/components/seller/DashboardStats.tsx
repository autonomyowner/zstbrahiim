'use client'

import type { SellerDashboardStats } from '@/lib/supabase/orders'

type StatCardProps = {
  title: string
  value: string | number
  trendLabel?: string
  trendUp?: boolean
  subtitle?: string
}

function StatCard({ title, value, trendLabel, trendUp, subtitle }: StatCardProps): JSX.Element {
  return (
    <div className="group rounded-xl sm:rounded-2xl border border-brand-border bg-white p-4 sm:p-5 shadow-card-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-dark hover:shadow-card-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        {trendLabel && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
              trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            <span className="text-xs font-bold">{trendUp ? '▲' : '▼'}</span>
            <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{trendLabel}</span>
          </div>
        )}
      </div>
      <div>
        <p className="mb-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-text-muted leading-tight">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-black leading-tight text-text-primary transition-colors group-hover:text-brand-dark break-words">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-[11px] font-semibold text-text-muted">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

type DashboardStatsProps = {
  stats: SellerDashboardStats
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getTrendProps = (
  value: number | null
): {
  trendLabel?: string
  trendUp?: boolean
} => {
  if (value === null || Number.isNaN(value)) {
    return {}
  }

  const rounded = Math.round(value * 10) / 10
  return {
    trendLabel: `${rounded > 0 ? '+' : ''}${rounded}%`,
    trendUp: rounded >= 0,
  }
}

export function DashboardStats({ stats }: DashboardStatsProps): JSX.Element {
  const cards: StatCardProps[] = [
    {
      title: 'Commandes totales',
      value: stats.totalOrders,
      ...getTrendProps(stats.trend.totalOrders),
      subtitle: stats.range.label,
    },
    {
      title: 'En attente',
      value: stats.pendingOrders,
    },
    {
      title: 'Revenu total',
      value: formatCurrency(stats.totalRevenue),
      ...getTrendProps(stats.trend.totalRevenue),
      subtitle: stats.range.label,
    },
    {
      title: 'Revenu mensuel',
      value: formatCurrency(stats.monthlyRevenue),
      ...getTrendProps(stats.trend.monthlyRevenue),
      subtitle: 'Ce mois',
    },
    {
      title: 'Produits actifs',
      value: stats.totalProducts,
    },
    {
      title: 'Stock faible',
      value: stats.lowStockProducts,
    },
    {
      title: 'En traitement',
      value: stats.processingOrders,
    },
    {
      title: 'Complétées',
      value: stats.completedOrders,
      ...getTrendProps(stats.trend.completionRate),
      subtitle: `${Math.round(stats.completionRate)}% de réussite`,
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
