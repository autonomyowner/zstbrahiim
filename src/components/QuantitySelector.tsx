'use client'

import { useState } from 'react'

type QuantitySelectorProps = {
  min?: number
  max?: number
  defaultValue?: number
  onQuantityChange?: (quantity: number) => void
}

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
    <div className="flex items-center border border-kitchen-lux-dark-green-300 rounded-lg overflow-hidden">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="px-4 py-2 bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-800 hover:bg-kitchen-lux-dark-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        type="button"
        aria-label="Diminuer la quantité"
      >
        -
      </button>
      <input
        type="number"
        value={quantity}
        readOnly
        className="w-16 px-4 py-2 text-center text-kitchen-lux-dark-green-800 font-semibold border-x border-kitchen-lux-dark-green-300 bg-white focus:outline-none"
        min={min}
        max={max}
      />
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="px-4 py-2 bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-800 hover:bg-kitchen-lux-dark-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        type="button"
        aria-label="Augmenter la quantité"
      >
        +
      </button>
    </div>
  )
}



