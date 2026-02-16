'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Product } from '@/data/products'

type ProductManagementProps = {
  products: (Product | any)[]
  onAddProduct: () => void
  onEditProduct: (product: Product | any) => void
  onDeleteProduct: (productId: string) => void
}

export function ProductManagement({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductManagementProps): JSX.Element {
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock' | 'low-stock'>('all')

  const filteredProducts = products.filter((product) => {
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.inStock) ||
      (stockFilter === 'out-of-stock' && !product.inStock) ||
      (stockFilter === 'low-stock' && product.inStock && (product as any).quantity < 10)

    return matchesStock
  })

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
        <div className="mb-6">
          <div className="max-w-xs">
            <label
              htmlFor="stock-filter"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted"
            >
              Filtrer par stock
            </label>
            <div className="mt-2">
              <select
                id="stock-filter"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full rounded-full border border-brand-border bg-white py-3 px-4 text-sm font-semibold text-text-primary focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <option value="all">Tous les produits</option>
                <option value="in-stock">En stock</option>
                <option value="out-of-stock">Rupture de stock</option>
                <option value="low-stock">Stock faible</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-border/60">
            <thead className="bg-brand-light/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Produit
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Marque
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Prix
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60 bg-white">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="transition hover:bg-brand-light/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          {product.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          ID: {product.id}
                        </div>
                    {product.video && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                        </svg>
                        Vidéo
                      </span>
                    )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-text-primary">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xs text-text-muted line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs ${
                          product.inStock
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {product.inStock ? 'En stock' : 'Rupture'}
                      </span>
                      {product.isPromo && (
                        <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                          Promo
                        </span>
                      )}
                      {product.isNew && (
                        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                          Nouveau
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {product.productType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="mr-4 text-brand-dark underline-offset-4 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                          onDeleteProduct(product.id)
                        }
                      }}
                      className="text-red-600 underline-offset-4 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-text-muted">
            Aucun produit trouvé
          </div>
        )}
      </div>
    </div>
  )
}
