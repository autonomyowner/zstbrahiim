'use client'

import { useState } from 'react'

type AccordionProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export const Accordion = ({
  title,
  children,
  defaultOpen = false,
}: AccordionProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-kitchen-lux-dark-green-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
        type="button"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-kitchen-lux-dark-green-800">
          {title}
        </span>
        <svg
          className={`w-5 h-5 text-kitchen-lux-dark-green-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4 text-sm text-kitchen-lux-dark-green-700 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}



