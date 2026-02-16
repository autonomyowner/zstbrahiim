'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

type UserRole = 'customer' | 'seller' | 'freelancer'
type SellerCategory = 'fournisseur' | 'importateur' | 'grossiste'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<UserRole>('customer')
  const [sellerCategory, setSellerCategory] = useState<SellerCategory>('fournisseur')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const createProfile = useMutation(api.users.createProfile)

  useEffect(() => {
    if (userType !== 'seller') {
      setSellerCategory('fournisseur')
    }
  }, [userType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      })

      if (signUpError) {
        setError(signUpError.message || 'Failed to sign up. Please try again.')
        setLoading(false)
        return
      }

      // Create user profile in Convex
      await createProfile({
        email,
        fullName,
        role: userType,
        sellerCategory: userType === 'seller' ? sellerCategory : undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch {
      setError('Unable to connect to the server. Please check your internet connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-neutral-50 md:via-white md:to-brand-light md:flex md:items-center md:justify-center px-0 md:px-4 py-0 md:py-12 relative overflow-hidden">
      {/* Background decorative elements - desktop only */}
      <div className="hidden md:block absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
      <div className="hidden md:block absolute top-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-brand-dark/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 mx-auto">
        <div className="bg-white md:bg-white/95 md:backdrop-blur-sm md:rounded-3xl md:shadow-card-lg md:border md:border-brand-border/50 px-5 pt-6 pb-28 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-brand-dark text-brand-primary text-2xl md:text-3xl font-black shadow-card-sm">
              Z
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-text-muted text-sm">
              Join ZST ecom and start shopping
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              <p className="font-semibold">Account created successfully!</p>
              <p className="text-sm mt-1">Redirecting to homepage...</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted text-base"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="userType"
                className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
              >
                Account Type
              </label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserRole)}
                required
                className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary text-base min-h-[48px]"
              >
                <option value="customer">Client - Acheter des produits</option>
                <option value="seller">Vendeur - Vendre des produits</option>
                <option value="freelancer">Freelancer - Offrir des services</option>
              </select>
              <p className="mt-2 text-xs text-text-muted">
                Choisissez votre type de compte selon votre besoin
              </p>
            </div>

            {userType === 'seller' && (
              <div>
                <label
                  htmlFor="sellerCategory"
                  className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
                >
                  Segment vendeur
                </label>
                <select
                  id="sellerCategory"
                  value={sellerCategory}
                  onChange={(e) => setSellerCategory(e.target.value as SellerCategory)}
                  required
                  className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary text-base min-h-[48px]"
                >
                  <option value="fournisseur">Fournisseur (vend aux clients)</option>
                  <option value="grossiste">Grossiste (vend aux fournisseurs)</option>
                  <option value="importateur">Importateur (vend aux grossistes)</option>
                </select>
                <p className="mt-2 text-xs text-text-muted">
                  Détermine l&apos;espace B2B auquel vous accéderez dans le tableau vendeur.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted text-base"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted text-base"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
                >
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted text-base"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="flex items-start min-h-[44px]">
              <input
                type="checkbox"
                required
                className="w-5 h-5 md:w-4 md:h-4 mt-0.5 text-brand-primary border-brand-border rounded focus:ring-brand-primary/40 cursor-pointer"
              />
              <label className="ml-3 text-sm text-text-muted">
                I agree to the{' '}
                <Link
                  href="#"
                  className="text-brand-dark hover:text-text-primary transition-colors font-semibold"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="#"
                  className="text-brand-dark hover:text-text-primary transition-colors font-semibold"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign In Link - above button on mobile */}
            <p className="text-center text-sm text-text-muted md:hidden">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="font-bold text-brand-dark hover:text-text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>

            {/* Submit button - sticky on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border/30 md:static md:p-0 md:border-0 z-20">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-brand-dark hover:bg-black text-brand-primary py-4 md:py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] min-h-[48px]"
              >
                {loading ? 'Creating Account...' : success ? 'Success!' : 'Sign Up'}
              </button>
            </div>
          </form>

          {/* Sign In Link - desktop */}
          <p className="mt-8 text-center text-sm text-text-muted hidden md:block">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-bold text-brand-dark hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
