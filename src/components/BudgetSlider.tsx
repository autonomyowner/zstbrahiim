'use client'

import { useState } from 'react'
import { DualRangeSlider } from './DualRangeSlider'

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

  const handleSliderChange = (values: number[]): void => {
    if (values.length === 2) {
      const nextRange: [number, number] = [values[0], values[1]]
      if (onValueChange) {
        onValueChange(nextRange)
      } else {
        setInternalValue(nextRange)
      }
    }
  }

  const formatPrice = (price: number): string => `${price.toLocaleString()} DA`

  return (
    <DualRangeSlider
      min={min}
      max={max}
      step={step}
      value={currentValue}
      onValueChange={handleSliderChange}
      labelPosition="top"
      label={(val) => (val !== undefined ? formatPrice(val) : '')}
    />
  )
}

