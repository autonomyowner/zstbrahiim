'use client'

import { type Order } from '@/data/orders'
import { type Product } from '@/data/products'
import { type AdaptedProduct } from '@/lib/supabase/products'
import { exportSummaryReport } from '@/utils/exportData'

type ExportButtonProps = {
  orders: Order[]
  products: (Product | AdaptedProduct)[]
  type: 'orders' | 'products' | 'all'
}

export function ExportButton({ orders, products, type }: ExportButtonProps): JSX.Element {
  const handleExport = () => {
    if (type === 'all') {
      exportSummaryReport(orders, products)
    }
  }

  // Only show export button for 'all' type (analytics tab)
  if (type !== 'all') {
    return <></>
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors text-sm font-medium"
    >
      Exporter Données
    </button>
  )
}
