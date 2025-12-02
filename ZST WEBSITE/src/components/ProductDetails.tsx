'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/data/products'
import type { AdaptedProduct } from '@/lib/supabase/products'
import { getCurrentUserProfile } from '@/lib/supabase/auth'
import { CountdownTimer } from './CountdownTimer'
import { QuantitySelector } from './QuantitySelector'
import { Accordion } from './Accordion'
import { CheckoutModal } from './CheckoutModal'

type ProductDetailsProps = {
  product: Product | AdaptedProduct
}

// Custom SVG components
const HeartIcon = ({ filled = false, className = '' }: { filled?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const CheckCircleIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ShieldIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const TruckIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const EyeIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const ProductDetails = ({ product }: ProductDetailsProps): JSX.Element => {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [maxQuantity, setMaxQuantity] = useState(10)

  // Check if user is fournisseur or grossiste to allow higher quantities
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile()
        if (profile?.seller_category === 'fournisseur' || profile?.seller_category === 'grossiste') {
          setMaxQuantity(1000)
        }
      } catch {
        // Keep default max of 10 for regular customers
      }
    }
    checkUserProfile()
  }, [])

  const handleBuyNow = (): void => {
    setIsCheckoutModalOpen(true)
  }

  const handleWishlist = (): void => {
    setIsWishlisted(!isWishlisted)
  }

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Category & Brand Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.category && (
            <span className="inline-flex px-3 py-1 rounded-full bg-brand-surface-muted border border-brand-border/60 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              {product.category}
            </span>
          )}
          {product.brand && (
            <span className="inline-flex px-3 py-1 rounded-full bg-brand-dark text-brand-primary text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em]">
              {product.brand}
            </span>
          )}
          {product.isPromo && (
            <span className="inline-flex px-3 py-1 rounded-full bg-brand-primary text-brand-dark text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em]">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Product Name */}
        <h1 className="heading-elegant text-2xl sm:text-3xl lg:text-4xl text-text-primary leading-tight">
          {product.name}
        </h1>

        {/* Price Section */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            {product.price.toLocaleString()}
            <span className="text-lg sm:text-xl font-medium text-text-muted ml-1">DA</span>
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-lg sm:text-xl text-text-muted line-through">
              {product.originalPrice.toLocaleString()} DA
            </span>
          )}
        </div>

        {/* Social Proof & Stock */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
          {/* Viewers */}
          {product.viewersCount && product.viewersCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <EyeIcon className="w-4 h-4 text-brand-primary" />
              <span>{product.viewersCount} visiteurs actifs</span>
            </div>
          )}

          {/* Stock Status */}
          {product.inStock ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-success/10 text-accent-success text-xs sm:text-sm font-semibold rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
              En stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-error/10 text-accent-error text-xs sm:text-sm font-semibold rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-error" />
              Rupture de stock
            </span>
          )}
        </div>

        {/* Delivery Estimate */}
        {product.deliveryEstimate && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <TruckIcon className="w-4 h-4 text-brand-primaryDark" />
            <span>{product.deliveryEstimate}</span>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      {product.countdownEndDate && (
        <div className="rounded-2xl bg-gradient-to-r from-brand-dark to-brand-darkMuted p-4 sm:p-5">
          <CountdownTimer endDate={product.countdownEndDate} />
        </div>
      )}

      {/* Actions Section */}
      <div className="space-y-5 pt-2">
        {/* Quantity Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-text-primary">
              Quantité
            </label>
            {maxQuantity > 10 && (
              <span className="text-xs text-text-muted bg-brand-surface-muted px-2 py-0.5 rounded">
                Max: {maxQuantity} unités
              </span>
            )}
          </div>
          <QuantitySelector
            defaultValue={1}
            min={1}
            max={maxQuantity}
            onQuantityChange={setQuantity}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="group relative w-full overflow-hidden bg-brand-dark text-brand-primary px-8 py-4 sm:py-5 rounded-2xl font-semibold uppercase tracking-[0.2em] text-sm transition-all duration-300
              hover:shadow-glow-lg hover:translate-y-[-2px]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            type="button"
          >
            <span className="relative z-10">Acheter Maintenant</span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl font-medium text-sm transition-all duration-300
              border-2 ${isWishlisted
                ? 'bg-brand-primary/10 border-brand-primary text-brand-primaryDark'
                : 'bg-transparent border-brand-border hover:border-brand-primary/40 text-text-secondary hover:text-brand-primaryDark'
              }`}
            type="button"
          >
            <HeartIcon filled={isWishlisted} className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-brand-primary' : ''}`} />
            <span>{isWishlisted ? 'Dans ma liste' : 'Ajouter à ma liste d\'envies'}</span>
          </button>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="pt-6 border-t border-brand-border/60">
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-text-muted mb-3">
            Description
          </h3>
          <p className="text-base text-text-secondary leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Accordion Sections */}
      <div className="space-y-0 pt-2 border-t border-brand-border/60">
        <Accordion title="Livraison & Retours">
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-text-primary mb-1.5">
                Livraison
              </h4>
              <p className="text-text-secondary leading-relaxed">
                {product.additionalInfo.shipping}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1.5">
                Retours
              </h4>
              <p className="text-text-secondary leading-relaxed">
                {product.additionalInfo.returns}
              </p>
            </div>
          </div>
        </Accordion>

        {product.additionalInfo.exclusiveOffers && (
          <Accordion title="Offres Exclusives">
            <p className="text-sm text-text-secondary leading-relaxed">
              {product.additionalInfo.exclusiveOffers}
            </p>
          </Accordion>
        )}

        <Accordion title="Paiements Sécurisés">
          <p className="text-sm text-text-secondary leading-relaxed">
            {product.additionalInfo.payment}
          </p>
        </Accordion>
      </div>

      {/* Trust Badges */}
      <div className="pt-6 border-t border-brand-border/60">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-brand-surface-muted/50 border border-brand-border/40 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-card-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 group-hover:bg-brand-primary/20 group-hover:scale-105">
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primaryDark" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-text-primary leading-tight">
              Satisfait ou Remboursé
            </p>
          </div>

          <div className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-brand-surface-muted/50 border border-brand-border/40 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-card-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 group-hover:bg-brand-primary/20 group-hover:scale-105">
              <ShieldIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primaryDark" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-text-primary leading-tight">
              Garantie Qualité
            </p>
          </div>

          <div className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-brand-surface-muted/50 border border-brand-border/40 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-card-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 group-hover:bg-brand-primary/20 group-hover:scale-105">
              <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primaryDark" />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-text-primary leading-tight">
              Livraison Rapide
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        product={product}
        quantity={quantity}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </div>
  )
}


