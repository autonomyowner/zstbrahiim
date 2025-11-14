'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/supabase/auth'
import type { SellerCategory, UserRole } from '@/lib/supabase/types'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<UserRole>('customer')
  const [sellerCategory, setSellerCategory] = useState<SellerCategory>('fournisseur')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userType !== 'seller') {
      setSellerCategory('fournisseur')
    }
  }, [userType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const selectedSellerCategory = userType === 'seller' ? sellerCategory : undefined
      const { user, error: signUpError } = await signUp(
        email,
        password,
        fullName,
        undefined, // phone is optional
        userType,
        selectedSellerCategory
      )

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message?.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (signUpError.message?.includes('Password')) {
          setError('Password is too weak. Please use a stronger password.')
        } else {
          setError(signUpError.message || 'Failed to sign up')
        }
        setLoading(false)
        return
      }

      if (user) {
        setSuccess(true)
        // Check if email confirmation is required
        const confirmationRequired = user.identities?.length === 0
        
        if (confirmationRequired) {
          // User needs to verify email
          setError(null)
          setTimeout(() => {
            router.push('/signin')
          }, 3000)
        } else {
          // User is auto-confirmed and can login immediately
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 2000)
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-dark/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-card-lg border border-brand-border/50 p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark text-brand-primary text-3xl font-black shadow-card-sm">
              Z
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
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
                className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary"
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
                  className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary"
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
                className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
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
                  className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
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
                  className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-brand-primary border-brand-border rounded focus:ring-brand-primary/40 cursor-pointer"
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

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-brand-dark hover:bg-black text-brand-primary py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : success ? 'Success!' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-text-muted uppercase tracking-[0.2em]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign Up */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-brand-border rounded-xl hover:bg-neutral-50 hover:border-brand-dark transition-all shadow-sm"
            >
              <span className="text-sm font-semibold text-text-primary">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-brand-border rounded-xl hover:bg-neutral-50 hover:border-brand-dark transition-all shadow-sm"
            >
              <span className="text-sm font-semibold text-text-primary">Facebook</span>
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-text-muted">
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
