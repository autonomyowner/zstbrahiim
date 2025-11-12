'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserProfile, signOut, updateUserProfile } from '@/lib/supabase/auth'
import { getOrdersForCustomer } from '@/lib/supabase/orders'
import { CustomerOrderHistory } from '@/components/CustomerOrderHistory'
import type { UserProfile } from '@/lib/supabase/types'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getCurrentUserProfile()
        if (!profile) {
          router.push('/signin')
          return
        }
        setUser(profile)
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
        })
        
        // Fetch user's orders
        setLoadingOrders(true)
        const customerOrders = await getOrdersForCustomer(profile.id)
        setOrders(customerOrders)
        setLoadingOrders(false)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateUserProfile({
        full_name: formData.full_name,
        phone: formData.phone,
      })

      if (updated) {
        setSuccess('Profile updated successfully!')
        setEditing(false)
        // Refresh user data
        const profile = await getCurrentUserProfile()
        if (profile) setUser(profile)
      } else {
        setError('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An error occurred while updating your profile')
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error in handleSignOut:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kitchen-lux-dark-green-900 mx-auto mb-4"></div>
          <p className="text-kitchen-lux-dark-green-700">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-900 mb-2">
            My Account
          </h1>
          <p className="text-kitchen-lux-dark-green-700">
            Manage your profile and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Navigation
                  </h3>
                  <nav className="mt-4 space-y-2">
                    <Link
                      href="/"
                      className="block px-3 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 rounded-md transition-colors"
                    >
                      Marketplace
                    </Link>
                    {(user.role === 'seller' || user.role === 'admin') && (
                      <Link
                        href="/services"
                        className="block px-3 py-2 text-sm text-kitchen-lux-dark-green-700 hover:bg-kitchen-lux-dark-green-50 rounded-md transition-colors"
                      >
                        Seller Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </nav>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Account Type
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-kitchen-lux-dark-green-900 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900">
                  Profile Information
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-kitchen-lux-dark-green-700 bg-kitchen-lux-dark-green-100 rounded-md hover:bg-kitchen-lux-dark-green-200 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="full_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kitchen-lux-dark-green-500 focus:border-transparent transition-all"
                      placeholder="+213 555 123 456"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-kitchen-lux-dark-green-600 to-kitchen-lux-dark-green-700 text-white py-3 rounded-lg font-semibold hover:from-kitchen-lux-dark-green-700 hover:to-kitchen-lux-dark-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          full_name: user.full_name || '',
                          phone: user.phone || '',
                        })
                        setError(null)
                        setSuccess(null)
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email Address
                    </label>
                    <p className="text-lg text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Full Name
                    </label>
                    <p className="text-lg text-gray-900">
                      {user.full_name || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Phone Number
                    </label>
                    <p className="text-lg text-gray-900">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Account Created
                    </label>
                    <p className="text-lg text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info for Sellers */}
            {(user.role === 'seller' || user.role === 'admin') && (
              <div className="mt-6 bg-kitchen-lux-dark-green-100 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900 mb-4">
                  Espace Vendeur
                </h2>
                <p className="text-kitchen-lux-dark-green-700 mb-4">
                  Vous avez accès au tableau de bord vendeur pour gérer vos produits,
                  commandes et analyser vos performances.
                </p>
                <Link
                  href="/services"
                  className="inline-block px-6 py-3 bg-kitchen-lux-dark-green-600 text-white rounded-lg font-semibold hover:bg-kitchen-lux-dark-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Tableau de Bord Vendeur →
                </Link>
              </div>
            )}

            {/* Additional Info for Freelancers */}
            {(user.role === 'freelancer' || user.role === 'admin') && (
              <div className="mt-6 bg-blue-100 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-elegant font-semibold text-blue-900 mb-4">
                  Espace Freelancer
                </h2>
                <p className="text-blue-700 mb-4">
                  Vous avez accès au tableau de bord freelancer pour gérer vos services,
                  portfolio et vos projets.
                </p>
                <Link
                  href="/freelancer-dashboard"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Tableau de Bord Freelancer →
                </Link>
              </div>
            )}
          </div>

          {/* Order History Section */}
          <div className="mt-8">
            <h2 className="text-3xl font-elegant font-semibold text-kitchen-lux-dark-green-900 mb-6">
              Mes Commandes
            </h2>
            
            {loadingOrders ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kitchen-lux-dark-green-900 mx-auto mb-4"></div>
                <p className="text-kitchen-lux-dark-green-600">Chargement des commandes...</p>
              </div>
            ) : (
              <CustomerOrderHistory orders={orders} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

