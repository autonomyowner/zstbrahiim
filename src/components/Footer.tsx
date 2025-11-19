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
    <footer className="bg-brand-dark text-text-inverted mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-brand-dark text-2xl font-black">
                Z
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">ZST ecom</p>
                <p className="text-sm text-white/70">
                  Quality products. Trusted Algerian suppliers. Seamless sourcing for modern teams.
                </p>
              </div>
            </Link>
            <p className="text-sm text-white/60">
              Delivering curated selections of perfumes, apparel, and wholesale goods across all 58 wilayas.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                {section.title}
              </p>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/80 transition hover:text-brand-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-white/60">
          <p>© {new Date().getFullYear()} ZST ecom. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/#privacy" className="hover:text-brand-primary">
              Privacy
            </Link>
            <Link href="/#terms" className="hover:text-brand-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

