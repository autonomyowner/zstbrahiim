'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserProfile, signOut, updateUserProfile } from '@/lib/supabase/auth'
import { getOrdersForCustomer } from '@/lib/supabase/orders'
import { CustomerOrderHistory } from '@/components/CustomerOrderHistory'
import type { SellerCategory, UserProfile } from '@/lib/supabase/types'

type OrderStatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>('all')
  const [formData, setFormData] = useState<{
    full_name: string
    phone: string
    seller_category: SellerCategory
  }>({
    full_name: '',
    phone: '',
    seller_category: 'fournisseur',
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
          seller_category: (profile.seller_category as SellerCategory) || 'fournisseur',
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
        ...(user?.role === 'seller'
          ? {
              seller_category: formData.seller_category,
            }
          : {}),
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

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter
      const query = orderSearch.trim().toLowerCase()
      const matchesSearch =
        query === '' ||
        order.orderNumber?.toLowerCase().includes(query) ||
        order.items?.some((item: any) => item.productName?.toLowerCase().includes(query))

      return matchesStatus && matchesSearch
    })
  }, [orders, orderStatusFilter, orderSearch])

  if (loading) {
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
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="font-semibold">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-card-md animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">error</span>
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
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                    value={formData.seller_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seller_category: e.target.value as SellerCategory,
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
                      full_name: user.full_name || '',
                      phone: user.phone || '',
                      seller_category: (user.seller_category as SellerCategory) || 'fournisseur',
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
                  {user.full_name || 'Non renseigné'}
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
                    {user.seller_category === 'grossiste'
                      ? 'Grossiste'
                      : user.seller_category === 'importateur'
                      ? 'Importateur'
                      : 'Fournisseur'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Créé le</p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', {
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
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                search
              </span>
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Rechercher une commande ou un article..."
                className="w-full rounded-xl border border-brand-border px-4 py-3.5 pl-12 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all bg-white"
              />
            </div>
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

