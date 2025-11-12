'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUserProfile, signOut as authSignOut, onAuthStateChange } from '@/lib/supabase/auth'
import type { UserProfile } from '@/lib/supabase/types'

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Marketplace', href: '/' },
  { label: 'Dashboard', href: '/services' },
]

// Split menu items: first on left, rest on right
const leftNavItem = navItems[0]
const rightNavItems = navItems.slice(1)

export const Navbar = (): JSX.Element => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [isBrandVisible, setIsBrandVisible] = useState<boolean>(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 12)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBrandVisible((prev) => !prev)
    }, 2000) // Fade in/out every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Authentication state management
  useEffect(() => {
    // Initial user fetch
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

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
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

  return (
    <>
      {/* Top Bar */}
      <div className="fixed inset-x-0 top-0 z-50 bg-kitchen-white-clean border-b border-kitchen-marble-gray-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center justify-between">
            {/* Services - Left */}
            <Link
              href="/services"
              className="text-xs font-medium uppercase tracking-[0.2em] text-kitchen-marble-gray transition-colors duration-200 hover:text-kitchen-black-deep"
            >
              Services
            </Link>

            {/* Freelance - Center */}
            <Link
              href="/freelance"
              className="text-xs font-medium uppercase tracking-[0.2em] text-kitchen-marble-gray transition-colors duration-200 hover:text-kitchen-black-deep"
            >
              Freelance
            </Link>

            {/* Sellers - Right */}
            <Link
              href="/sellers"
              className="text-xs font-medium uppercase tracking-[0.2em] text-kitchen-marble-gray transition-colors duration-200 hover:text-kitchen-black-deep"
            >
              Sellers
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`fixed inset-x-0 top-10 z-50 transition-colors duration-300 ${
          isScrolled
            ? 'bg-kitchen-white-clean/92 backdrop-blur border-b border-kitchen-marble-gray-light shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center md:h-20">
          {/* Left menu item - Desktop only */}
          <div className="hidden items-start gap-2 md:flex flex-col flex-1">
            {/* Auth buttons - Left side */}
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                <span>Loading...</span>
              </div>
            ) : user ? (
              // Logged in: Show Account button
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-full border border-kitchen-lux-dark-green-300 bg-gradient-to-r from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 transition-all duration-200 hover:border-kitchen-lux-dark-green-500 hover:bg-gradient-to-r hover:from-kitchen-lux-dark-green-100 hover:to-kitchen-lux-dark-green-200 hover:text-kitchen-lux-dark-green-900 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/30"
              >
                <Image
                  src="/logo.png"
                  alt="ZST Logo"
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                />
                <span>{user.full_name || 'Account'}</span>
              </Link>
            ) : (
              // Logged out: Show Sign In button
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 rounded-full border border-kitchen-lux-dark-green-300 bg-gradient-to-r from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 transition-all duration-200 hover:border-kitchen-lux-dark-green-500 hover:bg-gradient-to-r hover:from-kitchen-lux-dark-green-100 hover:to-kitchen-lux-dark-green-200 hover:text-kitchen-lux-dark-green-900 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/30"
              >
                <Image
                  src="/logo.png"
                  alt="ZST Logo"
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                />
                <span>Sign In</span>
              </Link>
            )}
            {(() => {
              const isActive = pathname === leftNavItem.href
              return (
                <Link
                  href={leftNavItem.href}
                  className={`text-sm font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                    isActive
                      ? 'text-kitchen-black-deep'
                      : 'text-kitchen-marble-gray hover:text-kitchen-black-deep'
                  }`}
                >
                  {leftNavItem.label}
                </Link>
              )
            })()}
          </div>

          {/* Center brand name - Absolutely centered on mobile */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:relative md:left-0 md:top-0 md:translate-x-0 md:translate-y-0 md:flex-1 md:flex md:justify-center">
            <Link
              href="/"
              className="transition-opacity duration-200 hover:opacity-80 text-center"
            >
              <span
                className={`text-4xl md:text-5xl lg:text-7xl font-artistic tracking-wide normal-case transition-opacity duration-1000 ${
                  isBrandVisible ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <span className="text-kitchen-black-deep">ZST</span>
              </span>
            </Link>
          </div>

          {/* Right menu items - Desktop only */}
          <div className="hidden items-end gap-2 md:flex flex-col flex-1 justify-end">
            {/* Auth buttons - Right side */}
            {!loading && (
              user ? (
                // Logged in: Show Logout button
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-800 transition-all duration-200 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-200 hover:to-red-300 hover:text-red-900 hover:shadow-md hover:shadow-red-200/30"
                >
                  <Image
                    src="/logo.png"
                    alt="ZST Logo"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <span>Logout</span>
                </button>
              ) : (
                // Logged out: Show Sign Up button
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-800 transition-all duration-200 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-200 hover:to-purple-300 hover:text-purple-900 hover:shadow-md hover:shadow-purple-200/30"
                >
                  <Image
                    src="/logo.png"
                    alt="ZST Logo"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <span>Sign Up</span>
                </Link>
              )
            )}
            {rightNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${
                    isActive
                      ? 'text-kitchen-black-deep'
                      : 'text-kitchen-marble-gray hover:text-kitchen-black-deep'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu items */}
          {/* Boutique - Left side */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-start gap-1 md:hidden">
            {/* Auth buttons - Mobile Left */}
            {!loading && (
              user ? (
                // Logged in: Show Account button
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1 rounded-full border border-kitchen-lux-dark-green-300 bg-gradient-to-r from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 transition-all duration-200 hover:border-kitchen-lux-dark-green-500 hover:bg-gradient-to-r hover:from-kitchen-lux-dark-green-100 hover:to-kitchen-lux-dark-green-200 hover:text-kitchen-lux-dark-green-900 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/30"
                >
                  <Image
                    src="/logo.png"
                    alt="ZST Logo"
                    width={14}
                    height={14}
                    className="rounded-full object-cover"
                  />
                  <span>{user.full_name?.split(' ')[0] || 'Account'}</span>
                </Link>
              ) : (
                // Logged out: Show Sign Up button
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-gradient-to-r from-purple-100 to-purple-200 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-purple-800 transition-all duration-200 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-200 hover:to-purple-300 hover:text-purple-900 hover:shadow-md hover:shadow-purple-200/30"
                >
                  <Image
                    src="/logo.png"
                    alt="ZST Logo"
                    width={14}
                    height={14}
                    className="rounded-full object-cover"
                  />
                  <span>Sign Up</span>
                </Link>
              )
            )}
            {(() => {
              const isActive = pathname === leftNavItem.href
              return (
                <Link
                  href={leftNavItem.href}
                  className={`inline-flex items-center justify-center rounded-full border border-purple-300 bg-gradient-to-r from-purple-100 to-purple-200 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.3em] text-purple-800 transition-all duration-200 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-200 hover:to-purple-300 hover:text-purple-900 hover:shadow-md hover:shadow-purple-200/30 ${
                    isActive
                      ? 'border-purple-500 bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900 shadow-md shadow-purple-200/30'
                      : ''
                  }`}
                >
                  {leftNavItem.label}
                </Link>
              )
            })()}
          </div>

          {/* Boutique - Far right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1 md:hidden">
            {/* Auth buttons - Mobile Right */}
            {!loading && (
              user ? (
                // Logged in: Show Logout button
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-gradient-to-r from-red-100 to-red-200 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-red-800 transition-all duration-200 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-200 hover:to-red-300 hover:text-red-900 hover:shadow-md hover:shadow-red-200/30"
                >
                  <Image
                    src="/logo.png"
                    alt="ZST Logo"
                    width={14}
                    height={14}
                    className="rounded-full object-cover"
                  />
                  <span>Logout</span>
                </button>
              ) : (
                // Logged out: Show Sign In button
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-1 rounded-full border border-kitchen-lux-dark-green-300 bg-gradient-to-r from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-800 transition-all duration-200 hover:border-kitchen-lux-dark-green-500 hover:bg-gradient-to-r hover:from-kitchen-lux-dark-green-100 hover:to-kitchen-lux-dark-green-200 hover:text-kitchen-lux-dark-green-900 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/30"
                >
                  <Image
                    src="/logo.png"
                    alt="ZST Logo"
                    width={14}
                    height={14}
                    className="rounded-full object-cover"
                  />
                  <span>Sign In</span>
                </Link>
              )
            )}
            {rightNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center justify-center rounded-full border border-kitchen-lux-dark-green-300 bg-gradient-to-r from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.3em] text-kitchen-lux-dark-green-800 transition-all duration-200 hover:border-kitchen-lux-dark-green-500 hover:bg-gradient-to-r hover:from-kitchen-lux-dark-green-100 hover:to-kitchen-lux-dark-green-200 hover:text-kitchen-lux-dark-green-900 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/30 ${
                    isActive
                      ? 'border-kitchen-lux-dark-green-500 bg-gradient-to-r from-kitchen-lux-dark-green-100 to-kitchen-lux-dark-green-200 text-kitchen-lux-dark-green-900 shadow-md shadow-kitchen-lux-dark-green-200/30'
                      : ''
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}
