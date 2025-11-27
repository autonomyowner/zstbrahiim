'use client'

import { useState, useEffect } from 'react'

type CountdownTimerProps = {
  endDate: string
}

const ClockIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-brand-primary/20 border border-brand-primary/30">
        <span className="text-xl sm:text-2xl font-bold text-brand-primary tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
    <span className="mt-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white/60 font-medium">
      {label}
    </span>
  </div>
)

const Separator = () => (
  <span className="text-brand-primary/60 text-lg sm:text-xl font-light self-start mt-3 sm:mt-4">:</span>
)

export const CountdownTimer = ({ endDate }: CountdownTimerProps): JSX.Element => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = (): void => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <ClockIcon className="w-4 h-4 text-brand-primary animate-pulse" />
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Offre limitée
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-start justify-center gap-2 sm:gap-3">
        <TimeUnit value={timeLeft.days} label="Jours" />
        <Separator />
        <TimeUnit value={timeLeft.hours} label="Heures" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  )
}



