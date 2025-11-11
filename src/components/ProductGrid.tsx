'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/data/products'

type ProductGridProps = {
  products: Product[]
  displayMode: 'grid' | 'list'
}

export const ProductGrid = ({
  products,
  displayMode,
}: ProductGridProps): JSX.Element => {
  if (displayMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex gap-6 rounded-[32px] border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/20 cursor-pointer"
          >
            <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-white">
              {product.isPromo && (
                <div className="absolute left-2 top-2 z-10 rounded bg-kitchen-lux-dark-green-600 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  PROMO
                </div>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-kitchen-lux-dark-green-600">
                  {product.productType} • {product.brand}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <span className="text-lg font-semibold text-kitchen-lux-dark-green-800">
                      {product.price.toLocaleString()} DA
                    </span>
                    <span className="text-sm text-kitchen-lux-dark-green-600 line-through">
                      {product.originalPrice.toLocaleString()} DA
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-kitchen-lux-dark-green-800">
                    {product.price.toLocaleString()} DA
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group relative overflow-hidden rounded-[32px] border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/20 cursor-pointer"
        >
          {/* Promo Badge */}
          {product.isPromo && (
            <div className="absolute left-3 top-3 z-10 rounded bg-kitchen-lux-dark-green-600 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              PROMO
            </div>
          )}

          {/* Product Image */}
          <div className="relative aspect-square bg-white flex items-center justify-center p-4">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="p-5">
            <h3 className="text-lg font-elegant font-semibold text-kitchen-lux-dark-green-800 line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-2 text-xs text-kitchen-lux-dark-green-600">
              {product.productType}
            </p>

            {/* Price */}
            <div className="mt-4 flex items-center gap-2">
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-xl font-semibold text-kitchen-lux-dark-green-800">
                    {product.price.toLocaleString()} DA
                  </span>
                  <span className="text-sm text-kitchen-lux-dark-green-600 line-through">
                    {product.originalPrice.toLocaleString()} DA
                  </span>
                </>
              ) : (
                <span className="text-xl font-semibold text-kitchen-lux-dark-green-800">
                  {product.price.toLocaleString()} DA
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

