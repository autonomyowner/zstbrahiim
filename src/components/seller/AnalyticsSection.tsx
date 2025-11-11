'use client'

import { type SellerStats } from '@/data/orders'

type AnalyticsSectionProps = {
  stats: SellerStats
}

export function AnalyticsSection({ stats }: AnalyticsSectionProps): JSX.Element {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const orderCompletionRate = Math.round((stats.completedOrders / stats.totalOrders) * 100)
  const averageOrderValue = Math.round(stats.totalRevenue / stats.totalOrders)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900">
        Analytiques & Rapports
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">
            Aperçu des Performances
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Taux de complétion:</span>
              <span className="text-lg font-bold text-kitchen-lux-dark-green-900">
                {orderCompletionRate}%
              </span>
            </div>
            <div className="w-full bg-kitchen-lux-dark-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${orderCompletionRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-kitchen-lux-dark-green-700">Valeur moyenne commande:</span>
              <span className="text-lg font-bold text-kitchen-lux-dark-green-900">
                {formatCurrency(averageOrderValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Commandes totales:</span>
              <span className="text-lg font-bold text-kitchen-lux-dark-green-900">
                {stats.totalOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">
            Répartition des Revenus
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Revenu total:</span>
              <span className="text-lg font-bold text-kitchen-lux-dark-green-900">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Ce mois:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(stats.monthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Croissance mensuelle:</span>
              <span className="text-lg font-bold text-green-600">+15%</span>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">
            Distribution des Commandes
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-kitchen-lux-dark-green-700">En attente</span>
                <span className="text-sm font-semibold text-kitchen-lux-dark-green-900">
                  {stats.pendingOrders}
                </span>
              </div>
              <div className="w-full bg-kitchen-lux-dark-green-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-kitchen-lux-dark-green-700">En traitement</span>
                <span className="text-sm font-semibold text-kitchen-lux-dark-green-900">
                  {stats.processingOrders}
                </span>
              </div>
              <div className="w-full bg-kitchen-lux-dark-green-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.processingOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-kitchen-lux-dark-green-700">Complétées</span>
                <span className="text-sm font-semibold text-kitchen-lux-dark-green-900">
                  {stats.completedOrders}
                </span>
              </div>
              <div className="w-full bg-kitchen-lux-dark-green-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.completedOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">
            Performance des Produits
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Produits actifs:</span>
              <span className="text-lg font-bold text-kitchen-lux-dark-green-900">
                {stats.totalProducts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Stock faible:</span>
              <span className="text-lg font-bold text-orange-600">
                {stats.lowStockProducts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-kitchen-lux-dark-green-700">Taux de disponibilité:</span>
              <span className="text-lg font-bold text-green-600">
                {Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-kitchen-lux-dark-green-900 mb-4">
          Résumé d&apos;Activité Récente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-kitchen-lux-dark-green-50 rounded-lg">
            <p className="text-3xl font-bold text-kitchen-lux-dark-green-900 mb-2">
              {stats.pendingOrders + stats.processingOrders}
            </p>
            <p className="text-sm text-kitchen-lux-dark-green-700">Commandes actives</p>
          </div>
          <div className="text-center p-4 bg-kitchen-lux-dark-green-50 rounded-lg">
            <p className="text-3xl font-bold text-kitchen-lux-dark-green-900 mb-2">
              {formatCurrency(stats.monthlyRevenue)}
            </p>
            <p className="text-sm text-kitchen-lux-dark-green-700">Revenu ce mois</p>
          </div>
          <div className="text-center p-4 bg-kitchen-lux-dark-green-50 rounded-lg">
            <p className="text-3xl font-bold text-kitchen-lux-dark-green-900 mb-2">
              {orderCompletionRate}%
            </p>
            <p className="text-sm text-kitchen-lux-dark-green-700">Taux de réussite</p>
          </div>
        </div>
      </div>
    </div>
  )
}
