'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

type Tab = {
  label: string
  href: string
  matchPaths: string[]
}

export const BottomTabs = (): JSX.Element => {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  const isSeller = user?.role === 'seller'

  const pendingCount = useQuery(
    api.orders.getPendingOrderCount,
    isSeller && user?._id ? { sellerId: user._id } : 'skip'
  ) ?? 0

  const tabs: Tab[] = [
    { label: 'Accueil', href: '/', matchPaths: ['/'] },
    { label: 'Explorer', href: '/freelance', matchPaths: ['/freelance', '/GROS', '/b2b'] },
    isSeller
      ? { label: 'Dashboard', href: '/services', matchPaths: ['/services'] }
      : { label: 'Panier', href: '/account', matchPaths: ['/account'] },
    { label: 'Profil', href: user ? '/account' : '/signin', matchPaths: ['/account', '/signin', '/signup'] },
  ]

  const isActive = (tab: Tab) => {
    if (tab.href === '/' && pathname === '/') return true
    if (tab.href !== '/') return tab.matchPaths.some(p => pathname?.startsWith(p))
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="border-t border-white/[0.06] bg-black/95 backdrop-blur-xl">
        <div className="flex h-[52px] items-stretch">
          {tabs.map((tab) => {
            const active = isActive(tab)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`relative flex flex-1 flex-col items-center justify-center text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'text-[#C9A227]'
                    : 'text-white/40 active:text-white/60'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-[#C9A227]" />
                )}
                <span>{tab.label}</span>
                {tab.label === 'Dashboard' && pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1/4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
