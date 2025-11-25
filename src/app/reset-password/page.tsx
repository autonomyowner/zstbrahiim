'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has a valid session from the reset email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        setError('Failed to update password. Please try again.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/signin')
      }, 3000)
    } catch {
      setError('Unable to connect to the server. Please check your internet connection and try again.')
      setLoading(false)
    }
  }

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-dark"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-card-lg border border-brand-border/50 p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-white text-3xl font-black shadow-card-sm">
                !
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
                Invalid or Expired Link
              </h1>
              <p className="text-text-muted text-sm">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="block w-full bg-brand-dark hover:bg-black text-brand-primary py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md text-center"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-card-lg border border-brand-border/50 p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-white text-3xl font-black shadow-card-sm">
                ✓
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
                Password Updated
              </h1>
              <p className="text-text-muted text-sm">
                Your password has been successfully updated. Redirecting to sign in...
              </p>
            </div>

            <Link
              href="/signin"
              className="block w-full bg-brand-dark hover:bg-black text-brand-primary py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md text-center"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-dark/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-card-lg border border-brand-border/50 p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark text-brand-primary text-3xl font-black shadow-card-sm">
              Z
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
              Reset Password
            </h1>
            <p className="text-text-muted text-sm">
              Enter your new password below
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
                htmlFor="password"
                className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3.5 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all bg-white text-text-primary placeholder:text-text-muted"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-black text-brand-primary py-3.5 rounded-xl font-bold transition-all duration-200 shadow-card-sm hover:shadow-card-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
