'use client'

import { useState } from 'react'

type AccordionProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export const Accordion = ({
  title,
  children,
  defaultOpen = false,
}: AccordionProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-brand-border/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-full flex items-center justify-between py-4 sm:py-5 text-left transition-colors duration-200 hover:bg-brand-surface-muted/30"
        type="button"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-text-primary group-hover:text-brand-primaryDark transition-colors">
          {title}
        </span>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
          isOpen ? 'bg-brand-primary/10' : 'bg-brand-surface-muted group-hover:bg-brand-primary/10'
        }`}>
          <ChevronDownIcon
            className={`w-4 h-4 transition-all duration-300 ${
              isOpen ? 'rotate-180 text-brand-primaryDark' : 'text-text-muted group-hover:text-brand-primaryDark'
            }`}
          />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-5 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}



