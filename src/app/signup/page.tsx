'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('customer')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign up logic here
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    console.log('Sign up:', { fullName, email, password, userType })
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kitchen-lux-dark-green-50 via-white to-purple-50 px-4 py-12 relative"
      style={{
        backgroundImage: 'url(/logo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-kitchen-lux-dark-green-50/80 via-white/80 to-purple-50/80"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-kitchen-black-deep mb-2">
            Create Account
          </h1>
          <p className="text-center text-kitchen-marble-gray mb-8">
            Join us today and start shopping
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-kitchen-black-deep mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-kitchen-black-deep mb-2"
              >
                Account Type
              </label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all bg-white"
              >
                <option value="customer">Customer</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="importer">Importer</option>
                <option value="service_provider">Service Provider</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-kitchen-black-deep mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-kitchen-black-deep mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-kitchen-black-deep mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-kitchen-lux-dark-green-600 border-gray-300 rounded focus:ring-kitchen-lux-dark-green-500"
              />
              <label className="ml-2 text-sm text-kitchen-marble-gray">
                I agree to the{' '}
                <Link
                  href="#"
                  className="text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="#"
                  className="text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-kitchen-lux-dark-green-600 to-kitchen-lux-dark-green-700 text-white py-3 rounded-lg font-semibold hover:from-kitchen-lux-dark-green-700 hover:to-kitchen-lux-dark-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-kitchen-marble-gray">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign Up */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-kitchen-marble-gray">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-semibold text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
