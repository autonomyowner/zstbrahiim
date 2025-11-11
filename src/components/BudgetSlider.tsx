'use client'

import { useState } from 'react'
import { DualRangeSlider } from './DualRangeSlider'

const getPriceCategory = (price: number): string => {
  if (price <= 15000) {
    return 'Économique'
  }
  if (price <= 35000) {
    return 'Moyen'
  }
  return 'Premium'
}

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Économique':
      return 'bg-green-50 text-green-800 border-green-300'
    case 'Moyen':
      return 'bg-blue-50 text-blue-800 border-blue-300'
    case 'Premium':
      return 'bg-purple-50 text-purple-800 border-purple-300'
    default:
      return 'bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-800 border-kitchen-lux-dark-green-200'
  }
}

type BudgetSliderProps = {
  min?: number
  max?: number
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  step?: number
}

export const BudgetSlider = ({
  min = 0,
  max = 100000,
  value: controlledValue,
  onValueChange,
  step = 100,
}: BudgetSliderProps): JSX.Element => {
  const [internalValue, setInternalValue] = useState<[number, number]>([
    min,
    max,
  ])

  const currentValue = controlledValue ?? internalValue
  const handleChange = onValueChange ?? setInternalValue

  const minCategory = getPriceCategory(currentValue[0])
  const maxCategory = getPriceCategory(currentValue[1])

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} DA`
  }

  return (
    <div className="w-full space-y-6">
      {/* Slider */}
      <div className="px-2">
        <DualRangeSlider
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onValueChange={(values) => {
            if (values.length === 2) {
              handleChange([values[0], values[1]])
            }
          }}
          labelPosition="top"
          label={(val, index) =>
            val !== undefined ? formatPrice(val) : ''
          }
          className="w-full"
        />
      </div>

      {/* Price Range Display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-kitchen-lux-dark-green-800">
            Prix minimum
          </div>
          <div className="text-2xl font-bold text-kitchen-lux-dark-green-900">
            {formatPrice(currentValue[0])}
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${getCategoryColor(minCategory)}`}
          >
            {minCategory}
          </div>
        </div>

        <div className="hidden sm:block text-kitchen-lux-dark-green-400 text-xl font-light">
          →
        </div>

        <div className="flex flex-col gap-2 text-right sm:text-left">
          <div className="text-sm font-medium text-kitchen-lux-dark-green-800">
            Prix maximum
          </div>
          <div className="text-2xl font-bold text-kitchen-lux-dark-green-900">
            {formatPrice(currentValue[1])}
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-colors ml-auto sm:ml-0 ${getCategoryColor(maxCategory)}`}
          >
            {maxCategory}
          </div>
        </div>
      </div>

      {/* Category Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            minCategory === 'Économique' || maxCategory === 'Économique'
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="text-sm font-semibold text-kitchen-lux-dark-green-800 mb-1">
            Économique
          </div>
          <div className="text-xs text-kitchen-lux-dark-green-600">
            Jusqu'à 15,000 DA
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            (minCategory === 'Moyen' || maxCategory === 'Moyen') &&
            !(minCategory === 'Économique' && maxCategory === 'Premium')
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="text-sm font-semibold text-kitchen-lux-dark-green-800 mb-1">
            Moyen
          </div>
          <div className="text-xs text-kitchen-lux-dark-green-600">
            15,000 - 35,000 DA
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            minCategory === 'Premium' || maxCategory === 'Premium'
              ? 'border-purple-300 bg-purple-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="text-sm font-semibold text-kitchen-lux-dark-green-800 mb-1">
            Premium
          </div>
          <div className="text-xs text-kitchen-lux-dark-green-600">
            35,000+ DA
          </div>
        </div>
      </div>
    </div>
  )
}

