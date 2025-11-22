'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  getCurrentUserProfile,
  signOut as authSignOut,
  onAuthStateChange,
} from '@/lib/supabase/auth'
import type { UserProfile } from '@/lib/supabase/types'

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
]

export const Navbar = (): JSX.Element => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const pathname = usePathname()
  const router = useRouter()

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

  // Authentication state management
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getCurrentUserProfile()
        setUser(profile)
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const {
      data: { subscription },
    } = onAuthStateChange(async (authUser) => {
      if (authUser) {
        const profile = await getCurrentUserProfile()
        setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await authSignOut()
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error in handleSignOut:', error)
    }
  }

  const renderAuthSection = (variant: 'desktop' | 'mobile') => {
    if (loading) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 animate-pulse" />
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
            className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:border-brand-primary hover:bg-white/20 hover:shadow-card-sm transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-brand-dark font-black shadow-sm group-hover:scale-105 transition-transform">
              {user.full_name?.charAt(0)?.toUpperCase() || 'Z'}
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70 font-bold">
                Account
              </p>
              <p className="text-sm font-bold text-white">
                {user.full_name || 'My profile'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-red-400 transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-red-300 shadow-sm"
          >
            Logout
          </button>
        </div>
      )
    }

    return (
      <div className={`flex items-center gap-3 ${variant === 'mobile' ? 'flex-col items-stretch w-full' : ''}`}>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:border-brand-primary hover:bg-white/20 transition-all shadow-sm hover:shadow-card-sm"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-brand-dark hover:bg-brand-primary-dark transition-all shadow-card-sm hover:shadow-card-md transform hover:scale-105"
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
          ? 'hidden items-center gap-8 md:flex'
          : 'flex flex-col gap-3 text-base font-semibold'
      }`}
    >
      {primaryNav.map((item) => {
        if (item.dropdown) {
          const isDropdownActive = item.dropdown.some((subItem) => pathname === subItem.href)

          if (orientation === 'column') {
            // Mobile: render as expandable section
            return (
              <div key={item.label} className="flex flex-col gap-2">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className="relative text-sm font-bold text-white/70 hover:text-white transition-all py-2 text-left flex items-center justify-between"
                >
                  {item.label}
                  <svg
                    className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
                {openDropdown === item.label && (
                  <div className="flex flex-col gap-2 pl-4">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`text-sm font-semibold transition-all py-2 ${
                          pathname === subItem.href ? 'text-brand-primary' : 'text-white/60 hover:text-white'
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

          // Desktop: render as hover dropdown
          return (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`relative text-sm font-bold transition-all ${
                  isDropdownActive ? 'text-brand-primary' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
                {isDropdownActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-brand-primary shadow-sm" />
                )}
                {!isDropdownActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                )}
              </button>
              {openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-2 py-2 bg-black border border-white/10 rounded-xl shadow-card-md min-w-[160px] z-50">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block px-4 py-2 text-sm font-semibold transition-all ${
                        pathname === subItem.href
                          ? 'text-brand-primary bg-white/5'
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

        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href!}
            className={`relative text-sm font-bold transition-all group ${
              isActive
                ? 'text-brand-primary'
                : 'text-white/70 hover:text-white'
            } ${orientation === 'column' ? 'py-2' : ''}`}
          >
            {item.label}
            {isActive && orientation === 'row' && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-brand-primary shadow-sm" />
            )}
            {!isActive && orientation === 'row' && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            )}
            {isActive && orientation === 'column' && (
              <span className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-brand-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gradient-to-r from-brand-primary via-brand-primary to-brand-primaryDark text-brand-dark">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
          <div className="flex items-center gap-4 sm:gap-6 text-brand-dark">
            {topNav.map((item) => (
              <Link
                key={item.href || item.label}
                href={item.href || '/'}
                className="transition-all hover:text-brand-dark/70 hover:scale-105 whitespace-nowrap text-[10px] sm:text-xs"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="hidden sm:block text-brand-dark/90 font-semibold text-[10px] tracking-[0.15em] whitespace-nowrap">
            Trusted suppliers
          </p>
        </div>
      </div>

      <div
        className={`border-b border-black/10 bg-black backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? 'shadow-card-md' : 'shadow-sm'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">
            <Link href="/" className="flex items-center group">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary group-hover:text-brand-primary/90 transition-colors">
                ZST
              </span>
            </Link>

            {renderNavLinks('row')}

            <div className="hidden md:flex items-center gap-3 text-sm font-medium">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:border-brand-primary hover:bg-white/10 transition-all shadow-sm hover:shadow-card-sm"
              >
                Sell your product
              </Link>
              {renderAuthSection('desktop')}
            </div>

            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white text-2xl font-bold transition-all hover:border-brand-primary hover:bg-white/20 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? '×' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-xl shadow-card-md animate-fade-in">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
            {renderNavLinks('column')}
            <div className="flex flex-col gap-3 text-sm">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-bold text-white hover:border-brand-primary hover:bg-white/20 transition-all shadow-sm"
              >
                Sell your product
              </Link>
            </div>
            {renderAuthSection('mobile')}
          </div>
        </div>
      )}
    </header>
  )
}
