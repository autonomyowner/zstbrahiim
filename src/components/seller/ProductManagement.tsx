'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Product } from '@/data/products'

type ProductManagementProps = {
  products: Product[]
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
}

export function ProductManagement({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductManagementProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock' | 'low-stock'>('all')

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.inStock) ||
      (stockFilter === 'out-of-stock' && !product.inStock) ||
      (stockFilter === 'low-stock' && product.inStock && (product as any).quantity < 10)

    return matchesSearch && matchesStock
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
      <div className="flex justify-end">
        <button
          onClick={onAddProduct}
          className="px-6 py-3 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors font-medium"
        >
          + Ajouter Produit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="product-search" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
              Rechercher un produit
            </label>
            <input
              type="text"
              id="product-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom, marque, ID..."
              className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="stock-filter" className="block text-sm font-medium text-kitchen-lux-dark-green-700 mb-2">
              Filtrer par stock
            </label>
            <select
              id="stock-filter"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-kitchen-lux-dark-green-300 rounded-lg focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent"
            >
              <option value="all">Tous les produits</option>
              <option value="in-stock">En stock</option>
              <option value="out-of-stock">Rupture de stock</option>
              <option value="low-stock">Stock faible</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-kitchen-lux-dark-green-200">
            <thead className="bg-kitchen-lux-dark-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                  Marque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-kitchen-lux-dark-green-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-kitchen-lux-dark-green-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-kitchen-lux-dark-green-50 transition-colors">
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
                        <div className="text-sm font-medium text-kitchen-lux-dark-green-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-kitchen-lux-dark-green-500">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-kitchen-lux-dark-green-700">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-kitchen-lux-dark-green-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xs text-kitchen-lux-dark-green-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border inline-block ${
                          product.inStock
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {product.inStock ? 'En stock' : 'Rupture'}
                      </span>
                      {product.isPromo && (
                        <span className="text-xs px-3 py-1 rounded-full border bg-orange-100 text-orange-800 border-orange-300 inline-block">
                          Promo
                        </span>
                      )}
                      {product.isNew && (
                        <span className="text-xs px-3 py-1 rounded-full border bg-blue-100 text-blue-800 border-blue-300 inline-block">
                          Nouveau
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-kitchen-lux-dark-green-700">
                    {product.productType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-900 mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                          onDeleteProduct(product.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
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
          <div className="text-center py-12">
            <p className="text-kitchen-lux-dark-green-600">Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
