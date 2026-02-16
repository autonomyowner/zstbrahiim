'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from '@/lib/auth-client'

type NavItem = {
  label: string
  href?: string
  dropdown?: { label: string; href: string }[]
}

const primaryNav: NavItem[] = [
  { label: 'Marketplace', href: '/' },
  {
    label: 'Business',
    dropdown: [
      { label: 'GROS', href: '/GROS' },
      { label: 'B2B', href: '/b2b' },
    ],
  },
  { label: 'Freelance', href: '/freelance' },
]

const topNav: NavItem[] = [
  { label: 'Shopping', href: '/' },
  { label: 'Business', href: '/services' },
  { label: 'Freelance', href: '/freelance' },
  { label: 'App Mobile', href: '/app' },
]

// SVG Icons
const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 10l5 5 5-5z" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export const Navbar = (): JSX.Element => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  const { user, isLoading: loading } = useCurrentUser()

  // Real-time pending order count for sellers (reactive via Convex)
  const pendingCount = useQuery(
    api.orders.getPendingOrderCount,
    user?.role === 'seller' && user?._id ? { sellerId: user._id } : 'skip'
  ) ?? 0

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const renderAuthSection = (variant: 'desktop' | 'mobile') => {
    if (loading) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 animate-pulse" />
      )
    }

    if (user) {
      return (
        <div
          className={`flex items-center gap-3 ${
            variant === 'mobile' ? 'flex-col items-stretch w-full' : ''
          }`}
        >
          <Link
            href="/account"
            className="group flex items-center gap-3 rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-[#C9A227]/60 hover:bg-[#C9A227]/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A227] text-black font-bold text-sm transition-transform duration-200 group-hover:scale-105">
              {user.fullName?.charAt(0)?.toUpperCase() || 'Z'}
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227]/70 font-semibold">
                Account
              </p>
              <p className="text-sm font-semibold text-white">
                {user.fullName || 'My profile'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400 transition-all duration-200 hover:border-red-500/60 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            Logout
          </button>
        </div>
      )
    }

    return (
      <div className={`flex items-center gap-2.5 ${variant === 'mobile' ? 'flex-col items-stretch w-full' : ''}`}>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-bold text-black transition-all duration-200 hover:bg-[#E8C547] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:ring-offset-2 focus:ring-offset-black"
        >
          Join ZST
        </Link>
      </div>
    )
  }

  const renderNavLinks = (orientation: 'row' | 'column') => (
    <nav
      className={`${
        orientation === 'row'
          ? 'hidden items-center gap-1 md:flex'
          : 'flex flex-col gap-1 text-base font-semibold'
      }`}
    >
      {primaryNav.map((item) => {
        if (item.dropdown) {
          const isDropdownActive = item.dropdown.some((subItem) => pathname === subItem.href)

          if (orientation === 'column') {
            return (
              <div key={item.label} className="flex flex-col">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className={`relative text-sm font-semibold py-3 px-4 rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
                    isDropdownActive
                      ? 'text-[#C9A227] bg-[#C9A227]/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  <span className={`transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                  </span>
                </button>
                {openDropdown === item.label && (
                  <div className="flex flex-col gap-1 pl-4 mt-1 animate-slide-down">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 ${
                          pathname === subItem.href
                            ? 'text-[#C9A227] bg-[#C9A227]/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`relative text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                  isDropdownActive
                    ? 'text-[#C9A227] bg-[#C9A227]/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
              {openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-2 py-2 bg-[#0A0908] border border-[#C9A227]/20 rounded-xl shadow-2xl min-w-[180px] z-50 animate-scale-in">
                  <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block px-5 py-3 text-sm font-medium transition-all duration-200 ${
                        pathname === subItem.href
                          ? 'text-[#C9A227] bg-[#C9A227]/10'
                          : 'text-white/90 hover:text-[#E8C547] hover:bg-[#C9A227]/5 hover:pl-6'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href!}
            className={`relative text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'text-[#C9A227] bg-[#C9A227]/10'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            } ${orientation === 'column' ? 'py-3' : ''}`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <header className="sticky top-0 z-40">
      {/* Top bar - Gold gradient - hidden on mobile */}
      <div className="hidden md:block bg-gradient-to-r from-[#9A7B1A] via-[#C9A227] to-[#E8C547]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
          <div className="flex items-center gap-3 sm:gap-5 text-black/90">
            {topNav.map((item) => (
              <Link
                key={item.href || item.label}
                href={item.href || '/'}
                className="transition-all duration-200 hover:text-black whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="hidden sm:flex items-center gap-2 text-black/70 font-medium text-[10px] tracking-[0.1em]">
            <span className="w-1.5 h-1.5 rounded-full bg-black/50" />
            Trusted suppliers
          </p>
        </div>
      </div>

      {/* Main nav - Super Black */}
      <div
        className={`border-b border-white/[0.04] bg-black transition-all duration-300 ${
          isScrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.3)]' : ''
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 md:h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#C9A227] transition-all duration-200 group-hover:text-[#E8C547]">
                ZST
              </span>
            </Link>

            {renderNavLinks('row')}

            {/* Right section */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={user?.role === 'freelancer' ? '/freelancer-dashboard' : '/services'}
                className="relative inline-flex items-center gap-2 rounded-lg border border-[#C9A227]/30 bg-[#C9A227]/5 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:border-[#C9A227]/50 hover:bg-[#C9A227]/10 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
              >
                Dashboard
                {user?.role === 'seller' && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Link>
              {renderAuthSection('desktop')}
            </div>

            {/* Mobile menu button */}
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:text-white active:bg-white/5 md:hidden focus:outline-none"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.04] bg-black animate-slide-down">
          <div className="mx-auto max-w-6xl px-5 py-4 flex flex-col gap-2">
            {renderNavLinks('column')}
            <div className="h-px bg-white/[0.06] my-2" />
            <Link
              href={user?.role === 'freelancer' ? '/freelancer-dashboard' : '/services'}
              className="relative inline-flex items-center gap-2 rounded-xl bg-[#C9A227]/10 px-4 py-3 text-sm font-semibold text-[#C9A227] transition-all duration-200 hover:bg-[#C9A227]/15"
            >
              Dashboard
              {user?.role === 'seller' && pendingCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
