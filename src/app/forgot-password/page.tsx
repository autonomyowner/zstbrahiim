'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: resetError } = await (authClient as any).forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) {
        setError('Failed to send reset email. Please try again.')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Unable to connect to the server. Please check your internet connection and try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-neutral-50 md:via-white md:to-brand-light md:flex md:items-center md:justify-center px-0 md:px-4 py-0 md:py-12 relative overflow-hidden">
        <div className="hidden md:block absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white md:bg-white/95 md:backdrop-blur-sm md:rounded-3xl md:shadow-card-lg md:border md:border-brand-border/50 px-5 pt-8 pb-24 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-green-500 text-white text-2xl md:text-3xl font-black shadow-card-sm">
                ✓
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
                Check Your Email
              </h1>
              <p className="text-text-muted text-sm">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-neutral-50 border border-brand-border rounded-xl p-4 mb-6">
              <p className="text-sm text-text-muted">
                Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
              </p>
            </div>

            <Link
              href="/signin"
              className="block w-full bg-brand-dark hover:bg-black text-brand-primary py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-neutral-50 md:via-white md:to-brand-light md:flex md:items-center md:justify-center px-0 md:px-4 py-0 md:py-12 relative overflow-hidden">
      <div className="hidden md:block absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
      <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-brand-dark/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white md:bg-white/95 md:backdrop-blur-sm md:rounded-3xl md:shadow-card-lg md:border md:border-brand-border/50 px-5 pt-8 pb-24 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-brand-dark text-brand-primary text-2xl md:text-3xl font-black shadow-card-sm">
              Z
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-text-muted text-sm">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              <p className="font-semibold text-sm">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

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
                className="w-full px-4 py-4 md:py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-base text-text-primary placeholder:text-text-muted"
                placeholder="you@example.com"
              />
            </div>

            <p className="mt-8 text-center text-sm text-text-muted md:hidden">
              Remember your password?{' '}
              <Link
                href="/signin"
                className="font-bold text-brand-dark hover:text-text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border/30 md:static md:p-0 md:border-0 z-20">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark hover:bg-black text-brand-primary py-4 md:py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] min-h-[48px]"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <p className="hidden md:block mt-8 text-center text-sm text-text-muted">
            Remember your password?{' '}
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
