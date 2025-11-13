'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export const Footer = (): JSX.Element => {
  const [isBrandVisible, setIsBrandVisible] = useState<boolean>(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBrandVisible((prev) => !prev)
    }, 2000) // Fade in/out every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-kitchen-white-clean border-t border-kitchen-marble-gray-light py-8">
      <div className="container mx-auto px-4 text-center">
        <Link
          href="/"
          className="transition-opacity duration-200 hover:opacity-80 inline-block"
        >
          <span
            className={`text-4xl md:text-5xl lg:text-7xl font-elegant tracking-wide normal-case transition-opacity duration-1000 ${
              isBrandVisible ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <span className="text-kitchen-black-deep">ZST</span>
          </span>
        </Link>
      </div>
    </footer>
  )
}

