'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductControls } from '@/components/ProductControls'
import { GrosFilters, createDefaultGrosFilters, type GrosFilterState } from '@/components/gros/GrosFilters'
import { getProducts } from '@/lib/supabase/products'
import { getCurrentUserProfile } from '@/lib/supabase/auth'
import type { Product } from '@/data/products'

type SortOption = 'best-sellers' | 'price-asc' | 'price-desc' | 'newest' | 'highest-rated'

const sortProducts = (products: Product[], sortOption: SortOption): Product[] => {
  const result = [...products]

  switch (sortOption) {
    case 'price-asc':
      return result.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return result.sort((a, b) => b.price - a.price)
    case 'newest':
      return result.sort((a, b) => {
        const aNew = a.isNew ? 1 : 0
        const bNew = b.isNew ? 1 : 0
        return bNew - aNew
      })
    case 'highest-rated':
      return result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'best-sellers':
    default:
      return result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }
}

export default function GrosPage(): JSX.Element {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getCurrentUserProfile>>>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [sortOption, setSortOption] = useState<SortOption>('best-sellers')
  const [filters, setFilters] = useState<GrosFilterState>(createDefaultGrosFilters)

  const isAdmin = profile?.role === 'admin'
  const sellerCategory = profile?.seller_category

  // Access rules for GROS page:
  // - Can VIEW: fournisseurs, grossistes, and admins
  // - Can POST: only grossistes (handled in seller dashboard)
  const canViewGrosPage = isAdmin || sellerCategory === 'fournisseur' || sellerCategory === 'grossiste'

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentProfile = await getCurrentUserProfile()
        setProfile(currentProfile)
      } catch (err) {
        console.error('Failed to load profile', err)
        setProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [])

  // Fetch products from grossistes only (for GROS marketplace)
  useEffect(() => {
    if (!profile || !canViewGrosPage) {
      setProducts([])
      return
    }

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        setError(null)

        // GROS page shows products from grossistes only
        const grossisteProducts = await getProducts(undefined, { sellerCategories: ['grossiste'] })
        setProducts(grossisteProducts as Product[])
      } catch (err) {
        console.error('Failed to load GROS products', err)
        setError('Impossible de charger les produits.')
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [profile, canViewGrosPage])

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    products.forEach((p) => {
      if (p.category) uniqueCategories.add(p.category)
    })
    return Array.from(uniqueCategories).sort()
  }, [products])

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Category filter
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category)
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    )

    // Min quantity filter
    result = result.filter((p) => {
      const minQty = (p as any).minQuantity || 1
      return minQty >= filters.minQuantityRange.min && minQty <= filters.minQuantityRange.max
    })

    // Stock filter
    if (filters.inStock !== null) {
      result = result.filter((p) => p.inStock === filters.inStock)
    }

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase()
      result = result.filter((p) => {
        const fields = [p.name, p.brand, p.category, p.productType, p.description]
        return fields.some((field) => field?.toLowerCase().includes(query))
      })
    }

    return result
  }, [products, filters])

  // Sort filtered products
  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sortOption),
    [filteredProducts, sortOption]
  )

  const handleResetFilters = () => setFilters(createDefaultGrosFilters())

  // Loading state
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-dark"></div>
          <p className="text-brand-dark/70">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-8 shadow-card-md text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-brand-dark mb-4">Espace GROS Réservé</h1>
            <p className="text-brand-dark/70 mb-6">
              Connectez-vous avec un compte <strong>fournisseur</strong> ou <strong>grossiste</strong> pour accéder aux produits en gros.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signin"
                className="px-6 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand-dark/90 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-brand-border/20 text-brand-dark font-semibold rounded-xl hover:bg-brand-border/40 transition-colors"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied (not fournisseur, grossiste, or admin)
  if (!canViewGrosPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-8 shadow-card-md text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-brand-dark mb-4">Accès Restreint</h1>
            <p className="text-brand-dark/70 mb-6">
              L&apos;espace GROS est réservé aux <strong>fournisseurs</strong> et <strong>grossistes</strong> vérifiés.
            </p>
            {profile.role === 'customer' && (
              <p className="text-sm text-brand-dark/50 mb-6">
                Vous êtes connecté en tant que client. Pour accéder aux produits en gros,
                veuillez créer un compte vendeur professionnel.
              </p>
            )}
            {profile.seller_category === 'importateur' && (
              <p className="text-sm text-brand-dark/50 mb-6">
                En tant qu&apos;importateur, vous avez accès à l&apos;espace B2B pour publier vos offres
                aux grossistes. L&apos;espace GROS est destiné aux transactions entre grossistes et fournisseurs.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand-dark/90 transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
              {profile.seller_category === 'importateur' && (
                <Link
                  href="/b2b"
                  className="px-6 py-3 bg-brand-border/20 text-brand-dark font-semibold rounded-xl hover:bg-brand-border/40 transition-colors"
                >
                  Aller vers B2B
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main content - user has access
  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-card-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-dark/70">
                Espace Grossistes
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-brand-dark">
                Marché GROS ZST
              </h1>
              <p className="mt-2 text-sm text-brand-dark/70">
                {sellerCategory === 'grossiste'
                  ? 'Publiez vos produits en gros et touchez les fournisseurs de votre région.'
                  : 'Trouvez les meilleurs prix de gros auprès des grossistes vérifiés.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-border/20 px-4 py-2">
                <p className="text-xs text-brand-dark/60">Connecté en tant que</p>
                <p className="font-semibold text-brand-dark capitalize">
                  {sellerCategory === 'fournisseur' ? 'Fournisseur' : 'Grossiste'}
                </p>
              </div>
              {sellerCategory === 'grossiste' && (
                <Link
                  href="/account"
                  className="px-4 py-2 bg-brand-dark text-white text-sm font-semibold rounded-xl hover:bg-brand-dark/90 transition-colors"
                >
                  Ajouter un produit
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-card-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <GrosFilters
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={handleResetFilters}
          productCount={sortedProducts.length}
          categories={categories}
        />

        {/* Products section */}
        <section className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-card-md">
          <div className="mb-6">
            <ProductControls
              productCount={sortedProducts.length}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          {loadingProducts ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-brand-dark"></div>
              <p className="text-brand-dark/70">Chargement des produits...</p>
            </div>
          ) : sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} displayMode={displayMode} showMinQuantity />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-border/60 bg-neutral-50 py-12 text-center">
              <p className="text-lg font-semibold text-brand-dark">Aucun produit trouvé</p>
              <p className="mt-2 text-sm text-brand-dark/70">
                {products.length === 0
                  ? 'Les grossistes publieront bientôt leurs produits.'
                  : 'Essayez de modifier vos filtres pour voir plus de résultats.'}
              </p>
              {products.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-brand-dark text-white text-sm font-semibold rounded-xl hover:bg-brand-dark/90 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </section>

        {/* Info section for fournisseurs */}
        {sellerCategory === 'fournisseur' && (
          <section className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-6 shadow-card-md">
            <h3 className="text-lg font-bold text-brand-dark mb-3">Comment ça marche ?</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-brand-border/10 p-4">
                <div className="text-2xl font-black text-brand-dark mb-2">1</div>
                <p className="text-sm text-brand-dark/70">
                  Parcourez les produits proposés par les grossistes vérifiés
                </p>
              </div>
              <div className="rounded-xl bg-brand-border/10 p-4">
                <div className="text-2xl font-black text-brand-dark mb-2">2</div>
                <p className="text-sm text-brand-dark/70">
                  Filtrez par catégorie, prix et quantité minimale selon vos besoins
                </p>
              </div>
              <div className="rounded-xl bg-brand-border/10 p-4">
                <div className="text-2xl font-black text-brand-dark mb-2">3</div>
                <p className="text-sm text-brand-dark/70">
                  Contactez le grossiste pour passer votre commande en gros
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
