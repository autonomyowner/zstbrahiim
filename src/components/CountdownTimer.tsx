'use client'

import { useState, useEffect } from 'react'

type CountdownTimerProps = {
  endDate: string
}

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
    <div className="bg-black text-white p-4 rounded-lg">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-3 text-center">
        Dépêchez-vous ! Fin de l&apos;Offre dans...
      </p>
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs uppercase tracking-[0.1em]">Jours</div>
        </div>
        <span className="text-xl">|</span>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs uppercase tracking-[0.1em]">Heures</div>
        </div>
        <span className="text-xl">|</span>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs uppercase tracking-[0.1em]">Min</div>
        </div>
        <span className="text-xl">|</span>
        <div className="text-center">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs uppercase tracking-[0.1em]">Sec</div>
        </div>
      </div>
    </div>
  )
}



