'use client'

import { useState, useEffect } from 'react'

export const WhatsAppButton = (): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = (): void => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = (): void => {
    const phoneNumber = '+213673734578'
    const message = 'Bonjour! Je suis intéressé(e) par vos services de décoration événementielle.'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <button
        onClick={handleWhatsAppClick}
        className="rounded-full border border-kitchen-marble-gray bg-kitchen-white-clean/95 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-kitchen-black-deep shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
        type="button"
        aria-label="Discuter sur WhatsApp"
      >
        WhatsApp
      </button>
    </div>
  )
} 
