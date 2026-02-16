'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { authClient } from '@/lib/auth-client'
import { CustomerOrderHistory } from '@/components/CustomerOrderHistory'

type SellerCategory = 'fournisseur' | 'importateur' | 'grossiste'
type OrderStatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()
  const orders = useQuery(
    api.orders.getOrdersForCustomer,
    user?._id ? { userId: user._id } : 'skip'
  )
  const updateProfile = useMutation(api.users.updateProfile)

  const [editing, setEditing] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>('all')
  const [formData, setFormData] = useState<{
    fullName: string
    phone: string
    sellerCategory: SellerCategory
  }>({
    fullName: '',
    phone: '',
    sellerCategory: 'fournisseur',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        sellerCategory: (user.sellerCategory as SellerCategory) || 'fournisseur',
      })
    }
  }, [user])

  // Redirect when not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
    }
  }, [isLoading, user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        ...(user?.role === 'seller'
          ? {
              sellerCategory: formData.sellerCategory,
            }
          : {}),
      })

      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An error occurred while updating your profile')
    }
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error in handleSignOut:', error)
    }
  }

  const loadingOrders = orders === undefined
  const visibleOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter((order) => {
      return orderStatusFilter === 'all' || order.status === orderStatusFilter
    })
  }, [orders, orderStatusFilter])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light px-4 py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-dark"></div>
          <p className="text-text-muted">Chargement de votre compte...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800 shadow-card-md animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-card-md animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <section className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-8 shadow-card-md space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted">Profil</p>
              <h1 className="text-4xl font-black text-text-primary mt-2">Mon compte</h1>
              <p className="mt-3 text-sm font-medium text-text-muted">
                Mettez à jour vos coordonnées et accédez à vos espaces vendeur / freelance.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-xl border border-brand-border bg-white px-6 py-3 text-sm font-bold text-text-primary hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm hover:shadow-card-sm"
              >
                Modifier le profil
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-text-muted">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-neutral-50 px-4 py-3 text-sm text-text-muted"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-text-muted">Nom complet</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-brand-border px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-text-muted">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+213 555 123 456"
                  className="mt-2 w-full rounded-2xl border border-brand-border px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>
              {user.role === 'seller' && (
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-text-muted">
                    Segment vendeur
                  </label>
                  <select
                    value={formData.sellerCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerCategory: e.target.value as SellerCategory,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="fournisseur">Fournisseur</option>
                    <option value="grossiste">Grossiste</option>
                    <option value="importateur">Importateur</option>
                  </select>
                  <p className="mt-2 text-xs text-text-muted">
                    Ce réglage contrôle les espaces professionnels auxquels vous avez accès.
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-dark py-3.5 text-sm font-bold text-brand-primary transition-all hover:bg-black shadow-card-sm hover:shadow-card-md transform hover:scale-[1.02]"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      fullName: user.fullName || '',
                      phone: user.phone || '',
                      sellerCategory: (user.sellerCategory as SellerCategory) || 'fournisseur',
                    })
                    setError(null)
                    setSuccess(null)
                  }}
                  className="rounded-xl border border-brand-border bg-white px-8 py-3.5 text-sm font-bold text-text-primary hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Email</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Nom complet</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {user.fullName || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Téléphone</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {user.phone || 'Non renseigné'}
                </p>
              </div>
              {user.role === 'seller' && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Segment vendeur</p>
                  <p className="mt-2 text-lg font-semibold text-text-primary">
                    {user.sellerCategory === 'grossiste'
                      ? 'Grossiste'
                      : user.sellerCategory === 'importateur'
                      ? 'Importateur'
                      : 'Fournisseur'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Créé le</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-6 border-t border-brand-border">
            <Link href="/" className="rounded-xl border border-brand-border bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-text-primary hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm">
              Marketplace
            </Link>
            {(user.role === 'seller' || user.role === 'admin') && (
              <Link href="/services" className="rounded-xl border border-brand-border bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-text-primary hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm">
                Tableau vendeur
              </Link>
            )}
            {(user.role === 'freelancer' || user.role === 'admin') && (
              <Link href="/freelancer-dashboard" className="rounded-xl border border-brand-border bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-text-primary hover:border-brand-dark hover:bg-neutral-50 transition-all shadow-sm">
                Tableau freelance
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-red-600 hover:border-red-400 hover:bg-red-50 transition-all shadow-sm"
            >
              Déconnexion
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-8 shadow-card-md space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-muted">Historique</p>
              <h2 className="text-3xl font-black text-text-primary mt-2">Mes commandes</h2>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { label: 'Toutes', value: 'all' },
                { label: 'En attente', value: 'pending' },
                { label: 'En traitement', value: 'processing' },
                { label: 'Expédiée', value: 'shipped' },
                { label: 'Livrée', value: 'delivered' },
                { label: 'Annulée', value: 'cancelled' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setOrderStatusFilter(status.value as OrderStatusFilter)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${
                    orderStatusFilter === status.value
                      ? 'bg-brand-dark text-brand-primary shadow-card-sm'
                      : 'bg-neutral-100 text-text-muted hover:text-text-primary hover:bg-neutral-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {loadingOrders ? (
            <div className="rounded-3xl border border-brand-border bg-white/95 p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-brand-dark"></div>
              <p className="text-text-muted">Chargement des commandes...</p>
            </div>
          ) : (
            <CustomerOrderHistory orders={visibleOrders} />
          )}
        </section>
      </div>
    </div>
  )
}
