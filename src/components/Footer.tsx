'use client'

import Link from 'next/link'

const footerLinks = [
  {
    title: 'Explore',
    items: [
      { label: 'Marketplace', href: '/' },
      { label: 'GROS', href: '/GROS' },
      { label: 'Services', href: '/services' },
      { label: 'Freelance Hub', href: '/freelance' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'My Account', href: '/account' },
      { label: 'Seller Portal', href: '/services' },
      { label: 'Freelancer Dashboard', href: '/freelancer-dashboard' },
      { label: 'Sign In', href: '/signin' },
    ],
  },
]

export const Footer = (): JSX.Element => {
  return (
    <footer className="relative bg-black text-white mt-16 sm:mt-20 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 md:gap-12 lg:grid-cols-4">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9A227] text-black text-2xl font-bold transition-transform duration-300 group-hover:scale-105">
                Z
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">ZST ecom</p>
                <p className="text-xs sm:text-sm text-white/50 max-w-xs leading-relaxed">
                  Quality products. Trusted suppliers.
                </p>
              </div>
            </Link>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
              Marketplace B2C & B2B complete pour l'achat et vente de tous produits, avec services freelance, a travers les 58 wilayas d'Algerie.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C9A227]/5 border border-[#C9A227]/20 px-3 py-1.5 text-xs text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Verified Sellers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C9A227]/5 border border-[#C9A227]/20 px-3 py-1.5 text-xs text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                Secure Payments
              </span>
            </div>
          </div>

          {/* Footer links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                {section.title}
              </p>
              <ul className="mt-4 sm:mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 transition-all duration-200 hover:text-[#E8C547] hover:translate-x-1 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-[#C9A227]/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
            <p className="text-white/40">
              © {new Date().getFullYear()} ZST ecom. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="/privacy-policy"
                className="text-white/50 transition-colors duration-200 hover:text-[#E8C547]"
              >
                Privacy Policy
              </Link>
              <span className="text-[#C9A227]/30 hidden sm:inline">|</span>
              <Link
                href="/terms-of-service"
                className="text-white/50 transition-colors duration-200 hover:text-[#E8C547]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
