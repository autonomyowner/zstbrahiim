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
  href: string
}

const primaryNav: NavItem[] = [
  { label: 'Marketplace', href: '/' },
  { label: 'Winter', href: '/winter' },
  { label: 'Services', href: '/services' },
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
            <span className="material-symbols-outlined text-base">logout</span>
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
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
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
      <div className="hidden sm:block bg-gradient-to-r from-brand-primary via-brand-primary to-brand-primaryDark text-brand-dark">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
          <div className="flex items-center gap-4 sm:gap-6 text-brand-dark">
            {topNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-all hover:text-brand-dark/70 hover:scale-105 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="hidden lg:block text-brand-dark/90 font-semibold text-[10px] tracking-[0.15em] whitespace-nowrap">
            ✨ Trusted suppliers & deliveries
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
                href="/freelance"
                className="text-white/70 transition-all hover:text-white font-semibold"
              >
                Help Center
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:border-brand-primary hover:bg-white/10 transition-all shadow-sm hover:shadow-card-sm"
              >
                <span className="material-symbols-outlined text-base">sell</span>
                Sell your product
              </Link>
              {renderAuthSection('desktop')}
            </div>

            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition-all hover:border-brand-primary hover:bg-white/20 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-b border-brand-border bg-white/95 backdrop-blur-xl text-text-primary shadow-card-md animate-fade-in">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6">
            {renderNavLinks('column')}
            <div className="flex flex-col gap-3 text-sm">
              <Link 
                href="/freelance" 
                className="text-text-muted hover:text-text-primary font-semibold transition-colors py-2"
              >
                Help Center
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-3 font-bold hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-base">sell</span>
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
