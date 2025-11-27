'use client'

import { useState } from 'react'

type QuantitySelectorProps = {
  min?: number
  max?: number
  defaultValue?: number
  onQuantityChange?: (quantity: number) => void
}

const MinusIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PlusIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const QuantitySelector = ({
  min = 1,
  max = 10,
  defaultValue = 1,
  onQuantityChange,
}: QuantitySelectorProps): JSX.Element => {
  const [quantity, setQuantity] = useState(defaultValue)

  const handleDecrease = (): void => {
    if (quantity > min) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      onQuantityChange?.(newQuantity)
    }
  }

  const handleIncrease = (): void => {
    if (quantity < max) {
      const newQuantity = quantity + 1
      setQuantity(newQuantity)
      onQuantityChange?.(newQuantity)
    }
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-brand-border bg-white shadow-subtle overflow-hidden">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-brand-surface-muted/50 text-text-primary hover:bg-brand-primary/10 hover:text-brand-primaryDark disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-surface-muted/50 disabled:hover:text-text-primary transition-all duration-200"
        type="button"
        aria-label="Diminuer la quantité"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <div className="relative">
        <input
          type="number"
          value={quantity}
          readOnly
          className="w-14 sm:w-16 h-11 sm:h-12 text-center text-text-primary font-semibold text-base border-x border-brand-border/60 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={min}
          max={max}
        />
      </div>
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-brand-surface-muted/50 text-text-primary hover:bg-brand-primary/10 hover:text-brand-primaryDark disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-surface-muted/50 disabled:hover:text-text-primary transition-all duration-200"
        type="button"
        aria-label="Augmenter la quantité"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  )
}



