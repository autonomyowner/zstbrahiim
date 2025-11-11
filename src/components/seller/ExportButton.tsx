'use client'

import { useState } from 'react'
import { type Order } from '@/data/orders'
import { type Product } from '@/data/products'
import {
  exportOrdersToCSV,
  exportOrdersToExcel,
  exportProductsToCSV,
  exportProductsToExcel,
  exportSummaryReport,
} from '@/utils/exportData'

type ExportButtonProps = {
  orders: Order[]
  products: Product[]
  type: 'orders' | 'products' | 'all'
}

export function ExportButton({ orders, products, type }: ExportButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = (format: 'csv' | 'excel' | 'report') => {
    if (type === 'orders') {
      if (format === 'csv') {
        exportOrdersToCSV(orders)
      } else if (format === 'excel') {
        exportOrdersToExcel(orders)
      }
    } else if (type === 'products') {
      if (format === 'csv') {
        exportProductsToCSV(products)
      } else if (format === 'excel') {
        exportProductsToExcel(products)
      }
    } else if (type === 'all') {
      if (format === 'report') {
        exportSummaryReport(orders, products)
      }
    }

    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors text-sm font-medium"
      >
        Exporter Données
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-kitchen-lux-dark-green-200 z-20">
            <div className="py-2">
              {(type === 'orders' || type === 'all') && (
                <>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 transition-colors"
                  >
                    Commandes (CSV)
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 transition-colors"
                  >
                    Commandes (Excel)
                  </button>
                </>
              )}

              {(type === 'products' || type === 'all') && (
                <>
                  {type === 'all' && <div className="border-t border-kitchen-lux-dark-green-200 my-2" />}
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 transition-colors"
                  >
                    Produits (CSV)
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 transition-colors"
                  >
                    Produits (Excel)
                  </button>
                </>
              )}

              {type === 'all' && (
                <>
                  <div className="border-t border-kitchen-lux-dark-green-200 my-2" />
                  <button
                    onClick={() => handleExport('report')}
                    className="w-full text-left px-4 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 transition-colors font-medium"
                  >
                    Rapport Complet (TXT)
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
