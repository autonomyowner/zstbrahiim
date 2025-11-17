'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductControls } from '@/components/ProductControls'
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

const SectionShell = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) => (
  <section className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-card-md">
    <div className="mb-8 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-dark/70">
        {title}
      </p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-black text-brand-dark">{description}</h2>
    </div>
    {children}
  </section>
)

export default function WinterPage(): JSX.Element {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getCurrentUserProfile>>>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [importerOffers, setImporterOffers] = useState<Product[]>([])
  const [grossisteOffers, setGrossisteOffers] = useState<Product[]>([])

  const [importerDisplayMode, setImporterDisplayMode] = useState<'grid' | 'list'>('grid')
  const [grossisteDisplayMode, setGrossisteDisplayMode] = useState<'grid' | 'list'>('grid')
  const [importerSort, setImporterSort] = useState<SortOption>('best-sellers')
  const [grossisteSort, setGrossisteSort] = useState<SortOption>('best-sellers')

  const isAdmin = profile?.role === 'admin'
  const sellerCategory = profile?.seller_category

  const canSeeImporterSpace = isAdmin || sellerCategory === 'grossiste'
  const canSeeGrossisteSpace = isAdmin || sellerCategory === 'fournisseur'

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

  useEffect(() => {
    if (!profile) {
      setImporterOffers([])
      setGrossisteOffers([])
      return
    }

    const fetchOffers = async () => {
      if (!canSeeImporterSpace && !canSeeGrossisteSpace && !isAdmin) {
        setImporterOffers([])
        setGrossisteOffers([])
        return
      }

      try {
        setLoadingOffers(true)
        setError(null)

        const promises: Promise<void>[] = []

        if (canSeeImporterSpace) {
          promises.push(
            getProducts(undefined, { sellerCategories: ['importateur'] }).then((products) =>
              setImporterOffers(products as Product[])
            )
          )
        } else {
          setImporterOffers([])
        }

        if (canSeeGrossisteSpace) {
          promises.push(
            getProducts(undefined, { sellerCategories: ['grossiste'] }).then((products) =>
              setGrossisteOffers(products as Product[])
            )
          )
        } else {
          setGrossisteOffers([])
        }

        await Promise.all(promises)
      } catch (err) {
        console.error('Failed to load winter offers', err)
        setError('Impossible de charger les offres réservées.')
      } finally {
        setLoadingOffers(false)
      }
    }

    fetchOffers()
  }, [profile, canSeeImporterSpace, canSeeGrossisteSpace, isAdmin])

  const sortedImporterOffers = useMemo(
    () => sortProducts(importerOffers, importerSort),
    [importerOffers, importerSort]
  )
  const sortedGrossisteOffers = useMemo(
    () => sortProducts(grossisteOffers, grossisteSort),
    [grossisteOffers, grossisteSort]
  )

  const renderSection = (
    title: string,
    description: string,
    products: Product[],
    displayMode: 'grid' | 'list',
    onDisplayModeChange: (mode: 'grid' | 'list') => void,
    sortOption: SortOption,
    onSortChange: (option: SortOption) => void
  ) => (
    <SectionShell title={title} description={description}>
      <div className="mb-6">
        <ProductControls
          productCount={products.length}
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
          sortOption={sortOption}
          onSortChange={onSortChange}
        />
      </div>
      {products.length > 0 ? (
        <ProductGrid products={products} displayMode={displayMode} />
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-border/60 bg-neutral-50 py-10 text-center text-brand-dark">
          <p className="text-lg font-semibold">Aucune offre disponible pour le moment.</p>
          <p className="mt-2 text-sm text-brand-dark/70">
            Les vendeurs publieront bientôt de nouvelles quantités.
          </p>
        </div>
      )}
    </SectionShell>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-3xl border border-brand-border bg-white/95 backdrop-blur-sm p-8 shadow-card-md text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-dark/70">
            Espace B2B Hiver
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black text-brand-dark">
            Importateurs & Grossistes ZST
          </h1>
          <p className="mt-4 text-base text-brand-dark/70">
            Offres exclusives entre importateurs, grossistes et fournisseurs. Chaque espace est
            réservé selon votre statut vendeur pour garantir une distribution maîtrisée.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-card-sm">
            {error}
          </div>
        )}

        {(loadingProfile || loadingOffers) && (
          <div className="rounded-2xl border border-brand-border bg-white/80 p-6 text-center shadow-card-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-brand-dark"></div>
            <p className="text-brand-dark/70">Chargement des offres réservées...</p>
          </div>
        )}

        {!loadingProfile && !profile && (
          <div className="rounded-3xl border border-brand-border bg-white/95 p-6 text-center shadow-card-md">
            <p className="text-xl font-semibold text-brand-dark">Espace réservé</p>
            <p className="mt-2 text-brand-dark/70">
              Connectez-vous avec un compte grossiste ou fournisseur pour accéder aux offres
              Importateurs & Grossistes.
            </p>
          </div>
        )}

        {profile && !canSeeImporterSpace && !canSeeGrossisteSpace && !isAdmin && (
          <div className="rounded-3xl border border-brand-border bg-white/95 p-6 text-center shadow-card-md">
            <p className="text-xl font-semibold text-brand-dark">Espace restreint</p>
            {profile.seller_category === 'importateur' ? (
              <p className="mt-2 text-brand-dark/70">
                En tant qu&apos;importateur, vos offres sont visibles uniquement par les grossistes
                agréés. Utilisez votre tableau de bord pour les publier et suivre les commandes.
              </p>
            ) : (
              <p className="mt-2 text-brand-dark/70">
                Votre profil n&apos;est pas autorisé à consulter les offres interprofessionnelles.
                Contactez l&apos;équipe ZST pour rejoindre les grossistes ou importateurs.
              </p>
            )}
          </div>
        )}

        {canSeeImporterSpace &&
          renderSection(
            'Espace Importateurs ZST',
            'Lots importés disponibles uniquement pour les grossistes agréés.',
            sortedImporterOffers,
            importerDisplayMode,
            setImporterDisplayMode,
            importerSort,
            setImporterSort
          )}

        {canSeeGrossisteSpace &&
          renderSection(
            'Espace Grossistes ZST',
            'Stocks régionaux réservés aux fournisseurs vérifiés.',
            sortedGrossisteOffers,
            grossisteDisplayMode,
            setGrossisteDisplayMode,
            grossisteSort,
            setGrossisteSort
          )}
      </div>
    </div>
  )
}

