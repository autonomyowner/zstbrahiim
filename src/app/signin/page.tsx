'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/supabase/auth'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, error: signInError, userFriendlyError } = await signIn(email, password)

      if (signInError) {
        // Use the user-friendly error message from the auth helper
        setError(userFriendlyError || 'Failed to sign in. Please try again.')
        setLoading(false)
        return
      }

      if (user) {
        // Redirect to home page on success
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('Unable to connect to the server. Please check your internet connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-dark/5 rounded-full blur-3xl"></div>
      
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
              Welcome Back
            </h1>
            <p className="text-text-muted text-sm">
              Sign in to continue to ZST ecom
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              <p className="font-semibold text-sm">Sign In Failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary/40 cursor-pointer"
                />
                <span className="ml-2 text-text-muted group-hover:text-text-primary transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-brand-dark hover:text-text-primary transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-black text-brand-primary py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
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

          {/* Social Sign In */}
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

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-bold text-brand-dark hover:text-text-primary transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
