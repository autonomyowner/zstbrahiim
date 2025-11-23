'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OrdersTable } from '@/components/seller/OrdersTable'
import { OrderFilters } from '@/components/seller/OrderFilters'
import { ProductManagement } from '@/components/seller/ProductManagement'
import { StatsRangePicker, type StatsRangePreset } from '@/components/seller/StatsRangePicker'
import {
  AddProductModal,
  type ProductFormData,
  type ProductVideoFormValue,
} from '@/components/seller/AddProductModal'
import { EditProductModal } from '@/components/seller/EditProductModal'
import { OrderDetailsModal } from '@/components/seller/OrderDetailsModal'
import { ExportButton } from '@/components/seller/ExportButton'
import { mockOrders, type Order, type OrderStatus, type PaymentStatus } from '@/data/orders'
import { type Product } from '@/data/products'
import { printInvoice } from '@/utils/printInvoice'
import { getSellerProducts, createProduct, updateProduct, deleteProduct } from '@/lib/supabase/products'
import { getCurrentUserProfile, isSeller } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import {
  getOrdersForSeller,
  updateOrderStatus as updateOrderStatusInDb,
  getSellerDashboardStats,
  type SellerDashboardStats,
} from '@/lib/supabase/orders'
import { upsertProductVideo, deleteProductVideo } from '@/lib/supabase/productVideos'
import type { UserProfile, B2BOfferWithDetails, CreateB2BOfferRequest } from '@/lib/supabase/types'
import { getMyOffers, createOffer as createB2BOffer, deleteOffer } from '@/lib/supabase/b2b-offers'
import { getSellerStatistics } from '@/lib/supabase/b2b-offers'
import CreateOfferModal from '@/components/b2b/CreateOfferModal'
import OfferCard from '@/components/b2b/OfferCard'
import OfferDetailsModal from '@/components/b2b/OfferDetailsModal'

type TabType = 'dashboard' | 'orders' | 'products' | 'analytics' | 'b2b'

const rangePresetDays: Record<StatsRangePreset, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

const computeRange = (preset: StatsRangePreset) => {
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const start = new Date(end)
  start.setDate(end.getDate() - (rangePresetDays[preset] - 1))
  start.setHours(0, 0, 0, 0)

  return { start, end }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Compact stat card for mobile
function StatCard({
  label,
  value,
  trend,
  trendUp,
  variant = 'default'
}: {
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning'
}) {
  const variantStyles = {
    default: 'bg-white border-brand-border',
    primary: 'bg-brand-dark text-white border-brand-dark',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
  }

  return (
    <div className={`
      relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-5
      transition-all duration-300 hover:shadow-card-md
      ${variantStyles[variant]}
    `}>
      <p className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-widest ${
        variant === 'primary' ? 'text-white/60' : 'text-text-muted'
      }`}>
        {label}
      </p>
      <p className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-black tracking-tight ${
        variant === 'primary' ? 'text-brand-primary' : 'text-text-primary'
      }`}>
        {value}
      </p>
      {trend && (
        <div className={`mt-2 sm:mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold ${
          trendUp
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-600'
        }`}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}

// Compact action button for mobile
function ActionButton({
  title,
  description,
  onClick,
  variant = 'default'
}: {
  title: string
  description: string
  onClick: () => void
  variant?: 'default' | 'primary'
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group flex flex-col items-start gap-1 sm:gap-2 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left w-full
        transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-0.5
        ${variant === 'primary'
          ? 'bg-brand-dark text-white shadow-card-md'
          : 'bg-white border border-brand-border'
        }
      `}
    >
      <span className={`text-sm sm:text-base font-bold ${
        variant === 'primary' ? 'text-brand-primary' : 'text-text-primary'
      }`}>
        {title}
      </span>
      <span className={`text-xs sm:text-sm leading-relaxed ${
        variant === 'primary' ? 'text-white/70' : 'text-text-muted'
      }`}>
        {description}
      </span>
    </button>
  )
}

// Mobile bottom navigation component
function MobileBottomNav({
  activeTab,
  onTabChange,
  showB2B
}: {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  showB2B: boolean
}) {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Accueil', shortLabel: 'Accueil' },
    { id: 'orders' as TabType, label: 'Commandes', shortLabel: 'Cmd' },
    { id: 'products' as TabType, label: 'Produits', shortLabel: 'Prod' },
    ...(showB2B ? [{ id: 'b2b' as TabType, label: 'B2B', shortLabel: 'B2B' }] : []),
    { id: 'analytics' as TabType, label: 'Stats', shortLabel: 'Stats' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-white/95 backdrop-blur-md md:hidden safe-area-pb">
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex flex-1 flex-col items-center justify-center gap-0.5 py-2 px-1
              transition-colors
              ${activeTab === tab.id
                ? 'text-brand-dark'
                : 'text-text-muted'
              }
            `}
          >
            <div className={`
              h-1 w-6 rounded-full mb-1 transition-all
              ${activeTab === tab.id ? 'bg-brand-primary' : 'bg-transparent'}
            `} />
            <span className="text-[11px] font-semibold">{tab.shortLabel}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function SellerPortalPage(): JSX.Element {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [productsList, setProductsList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sellerProfile, setSellerProfile] = useState<UserProfile | null>(null)
  const [statsPreset, setStatsPreset] = useState<StatsRangePreset>('30d')
  const statsRange = useMemo(() => computeRange(statsPreset), [statsPreset])
  const [dashboardStats, setDashboardStats] = useState<SellerDashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // B2B states
  const [b2bOffers, setB2BOffers] = useState<B2BOfferWithDetails[]>([])
  const [b2bStats, setB2BStats] = useState<any>(null)
  const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false)
  const [isB2BDetailsModalOpen, setIsB2BDetailsModalOpen] = useState(false)
  const [selectedB2BOffer, setSelectedB2BOffer] = useState<B2BOfferWithDetails | null>(null)
  const [b2bLoading, setB2BLoading] = useState(false)

  // Order filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')

  // Check authentication and seller role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSellerAccess = await isSeller()
        if (!hasSellerAccess) {
          router.push('/signin')
          return
        }
        setAuthChecking(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/signin')
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (authChecking) return

    const fetchProfile = async () => {
      try {
        const profile = await getCurrentUserProfile()
        setSellerProfile(profile)
      } catch (error) {
        console.error('Error fetching seller profile:', error)
      }
    }

    fetchProfile()
  }, [authChecking])

  // Fetch products from Supabase (only seller's products)
  useEffect(() => {
    if (authChecking) return

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const fetchedProducts = await getSellerProducts()
        setProductsList(fetchedProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProductError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [authChecking])

  // Fetch orders for seller
  useEffect(() => {
    if (authChecking) return

    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const sellerOrders = await getOrdersForSeller(user.id)
        setOrders(sellerOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }
    fetchOrders()
  }, [authChecking])

  // Fetch dashboard stats
  useEffect(() => {
    if (authChecking) return

    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        setStatsError(null)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setDashboardStats(null)
          return
        }

        const stats = await getSellerDashboardStats({
          sellerId: user.id,
          startDate: statsRange.start.toISOString(),
          endDate: statsRange.end.toISOString(),
        })

        setDashboardStats(stats)
      } catch (error) {
        console.error('Error fetching seller dashboard stats:', error)
        setStatsError('Impossible de charger les statistiques')
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [authChecking, statsRange.start.getTime(), statsRange.end.getTime()])

  // Fetch B2B offers for importateurs and grossistes
  useEffect(() => {
    if (authChecking) return
    if (!sellerProfile) return
    if (sellerProfile.seller_category !== 'importateur' && sellerProfile.seller_category !== 'grossiste') return

    const fetchB2BData = async () => {
      try {
        setB2BLoading(true)
        const offers = await getMyOffers()
        setB2BOffers(offers)

        const stats = await getSellerStatistics()
        setB2BStats(stats)
      } catch (error) {
        console.error('Error fetching B2B data:', error)
      } finally {
        setB2BLoading(false)
      }
    }

    fetchB2BData()
  }, [authChecking, sellerProfile])

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

      return matchesStatus && matchesPayment
    })
  }, [orders, statusFilter, paymentFilter])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const success = await updateOrderStatusInDb({
        order_id: orderId,
        status: newStatus,
      })

      if (success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        )
        setSuccessMessage('Statut de commande mis à jour')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setProductError('Erreur lors de la mise à jour du statut')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setProductError('Erreur lors de la mise à jour du statut')
    }
  }

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsModalOpen(true)
  }

  const handleAddProduct = () => {
    setIsAddProductModalOpen(true)
  }

  const handleAddProductSubmit = async (
    productData: ProductFormData,
    video?: ProductVideoFormValue | null
  ) => {
    try {
      setProductError(null)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setProductError('Vous devez être connecté pour ajouter un produit')
        return
      }

      const productPayload = {
        slug: `${productData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: productData.name,
        brand: productData.brand,
        price: productData.price,
        original_price: productData.originalPrice ?? null,
        category: productData.category,
        product_type: productData.productType,
        product_category: 'perfume' as const,
        need: productData.need ?? null,
        in_stock: productData.inStock,
        is_promo: productData.isPromo,
        is_new: productData.isNew ?? null,
        rating: null,
        countdown_end_date: null,
        description: productData.description,
        benefits: [],
        ingredients: '',
        usage_instructions: '',
        delivery_estimate: productData.deliveryEstimate,
        shipping_info: 'Livraison gratuite à partir de 20 000 DA',
        returns_info: 'Retours acceptés sous 14 jours',
        payment_info: 'Paiement à la livraison',
        exclusive_offers: null,
        images: [productData.image],
        seller_id: user.id,
        seller_category: sellerProfile?.seller_category ?? null,
      }

      const productId = await createProduct(productPayload)

      if (productId) {
        if (video) {
          try {
            await upsertProductVideo({
              productId,
              file: video.file,
              durationSeconds: video.durationSeconds,
              thumbnailBlob: video.thumbnailBlob,
            })
          } catch (videoError: any) {
            console.error('Error uploading product video:', videoError)
            setProductError(videoError?.message || "Erreur lors de l'ajout de la vidéo.")
          }
        }

        setSuccessMessage(`Produit "${productData.name}" ajouté avec succès!`)
        const updatedProducts = await getSellerProducts()
        setProductsList(updatedProducts)
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setProductError('Failed to create product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      setProductError('Error adding product. Please try again.')
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditProductModalOpen(true)
  }

  const handleEditProductSubmit = async (
    productId: string,
    productData: ProductFormData,
    video?: ProductVideoFormValue | null,
    removeVideo?: boolean
  ) => {
    try {
      setProductError(null)

      const updatePayload = {
        id: productId,
        name: productData.name,
        brand: productData.brand,
        price: productData.price,
        original_price: productData.originalPrice ?? null,
        category: productData.category,
        product_type: productData.productType,
        need: productData.need ?? null,
        in_stock: productData.inStock,
        is_promo: productData.isPromo,
        is_new: productData.isNew ?? null,
        description: productData.description,
        benefits: [],
        ingredients: '',
        usage_instructions: '',
        delivery_estimate: productData.deliveryEstimate,
        images: [productData.image],
      }

      const success = await updateProduct(updatePayload)

      if (success) {
        if (removeVideo) {
          try {
            await deleteProductVideo(productId)
          } catch (error: any) {
            console.error('Error removing product video:', error)
            setProductError(error?.message || 'Erreur lors de la suppression de la vidéo.')
          }
        } else if (video) {
          try {
            await upsertProductVideo({
              productId,
              file: video.file,
              durationSeconds: video.durationSeconds,
              thumbnailBlob: video.thumbnailBlob,
            })
          } catch (videoError: any) {
            console.error('Error updating product video:', videoError)
            setProductError(videoError?.message || 'Erreur lors de la mise à jour de la vidéo.')
          }
        }

        setSuccessMessage(`Produit "${productData.name}" modifié avec succès!`)
        const updatedProducts = await getSellerProducts()
        setProductsList(updatedProducts)
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setProductError('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setProductError('Error updating product. Please try again.')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      try {
        setProductError(null)
        const success = await deleteProduct(productId)

        if (success) {
          setSuccessMessage('Produit supprimé avec succès!')
          const updatedProducts = await getSellerProducts()
          setProductsList(updatedProducts)
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          setProductError('Failed to delete product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        setProductError('Error deleting product. Please try again.')
      }
    }
  }

  const handlePrintInvoice = (order: Order) => {
    printInvoice(order)
  }

  // B2B handlers
  const handleCreateB2BOffer = async (offerData: CreateB2BOfferRequest) => {
    try {
      setProductError(null)
      await createB2BOffer(offerData)
      setSuccessMessage('Offre B2B créée avec succès!')

      const offers = await getMyOffers()
      setB2BOffers(offers)

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Error creating B2B offer:', error)
      setProductError(error.message || "Erreur lors de la création de l'offre B2B")
    }
  }

  const handleDeleteB2BOffer = async (offerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre B2B?')) {
      try {
        setProductError(null)
        await deleteOffer(offerId)
        setSuccessMessage('Offre B2B supprimée avec succès!')

        const offers = await getMyOffers()
        setB2BOffers(offers)

        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (error: any) {
        console.error('Error deleting B2B offer:', error)
        setProductError(error.message || "Erreur lors de la suppression de l'offre B2B")
      }
    }
  }

  const handleViewB2BDetails = (offer: B2BOfferWithDetails) => {
    setSelectedB2BOffer(offer)
    setIsB2BDetailsModalOpen(true)
  }

  const canAccessB2B = () => {
    return sellerProfile?.seller_category === 'importateur' || sellerProfile?.seller_category === 'grossiste'
  }

  const getTrendProps = (value: number | null): { trend?: string; trendUp?: boolean } => {
    if (value === null || Number.isNaN(value)) return {}
    const rounded = Math.round(value * 10) / 10
    return {
      trend: `${rounded > 0 ? '+' : ''}${rounded}%`,
      trendUp: rounded >= 0,
    }
  }

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-brand-border"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-dark animate-spin"></div>
          </div>
          <p className="text-text-muted font-medium text-sm">Vérification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-light pb-16 md:pb-0">
      {/* Desktop Header - Hidden on mobile */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark">
                <span className="text-lg font-black text-brand-primary">Z</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Espace Vendeur
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {sellerProfile?.provider_name || sellerProfile?.full_name || 'Dashboard'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="flex items-center gap-1">
              {[
                { id: 'dashboard' as TabType, label: 'Accueil' },
                { id: 'orders' as TabType, label: 'Commandes' },
                { id: 'products' as TabType, label: 'Produits' },
                ...(canAccessB2B() ? [{ id: 'b2b' as TabType, label: 'B2B' }] : []),
                { id: 'analytics' as TabType, label: 'Stats' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-4 py-2 text-sm font-semibold transition-colors
                    ${activeTab === tab.id
                      ? 'text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                    }
                  `}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-primary" />
                  )}
                </button>
              ))}
            </nav>

            {/* Seller Badge */}
            {sellerProfile?.seller_category && sellerProfile.seller_category !== 'fournisseur' && (
              <div className="flex items-center gap-2 rounded-full bg-brand-dark px-3 py-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  {sellerProfile.seller_category === 'grossiste' ? 'Grossiste' : 'Importateur'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header - Simplified */}
      <header className="md:hidden sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-dark">
              <span className="text-base font-black text-brand-primary">Z</span>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                {sellerProfile?.provider_name || sellerProfile?.full_name || 'Dashboard'}
              </p>
            </div>
          </div>
          {sellerProfile?.seller_category && sellerProfile.seller_category !== 'fournisseur' && (
            <div className="rounded-full bg-brand-dark px-2.5 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                {sellerProfile.seller_category === 'grossiste' ? 'GROS' : 'IMP'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Toast Messages */}
      {(successMessage || productError) && (
        <div className="fixed top-16 md:top-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 animate-fade-in">
          <div className={`
            rounded-xl px-4 py-3 shadow-card-md
            ${successMessage
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
            }
          `}>
            <p className="text-sm font-semibold">{successMessage || productError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6 md:py-8 sm:px-6 lg:px-8">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-muted">Bienvenue,</p>
                <h1 className="mt-0.5 sm:mt-1 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-text-primary">
                  {sellerProfile?.provider_name || sellerProfile?.full_name || 'Votre Boutique'}
                </h1>
              </div>
              <StatsRangePicker
                value={statsPreset}
                onChange={setStatsPreset}
                startDate={statsRange.start}
                endDate={statsRange.end}
              />
            </div>

            {/* Stats Grid - 2 columns on mobile */}
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 sm:h-32 animate-pulse rounded-xl sm:rounded-2xl bg-brand-border/30" />
                ))}
              </div>
            ) : dashboardStats && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  label="Revenu"
                  value={formatCurrency(dashboardStats.totalRevenue)}
                  {...getTrendProps(dashboardStats.trend.totalRevenue)}
                  variant="primary"
                />
                <StatCard
                  label="Commandes"
                  value={dashboardStats.totalOrders}
                  {...getTrendProps(dashboardStats.trend.totalOrders)}
                />
                <StatCard
                  label="En Attente"
                  value={dashboardStats.pendingOrders}
                  variant={dashboardStats.pendingOrders > 0 ? 'warning' : 'default'}
                />
                <StatCard
                  label="Produits"
                  value={dashboardStats.totalProducts}
                />
              </div>
            )}

            {/* Quick Actions - 2 columns on mobile */}
            <section>
              <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-text-primary">Actions Rapides</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <ActionButton
                  title="Nouveau Produit"
                  description="Ajouter au catalogue"
                  onClick={handleAddProduct}
                  variant="primary"
                />
                <ActionButton
                  title="Commandes"
                  description="Gérer les commandes"
                  onClick={() => setActiveTab('orders')}
                />
                <ActionButton
                  title="Inventaire"
                  description="Stocks et prix"
                  onClick={() => setActiveTab('products')}
                />
                {canAccessB2B() && (
                  <ActionButton
                    title="Offre B2B"
                    description="Créer une offre"
                    onClick={() => setIsCreateOfferModalOpen(true)}
                  />
                )}
              </div>
            </section>

            {/* Recent Orders Preview */}
            <section className="rounded-xl sm:rounded-2xl border border-brand-border bg-white p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">Commandes Récentes</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs sm:text-sm font-semibold text-brand-dark"
                >
                  Voir tout
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <OrdersTable
                  orders={orders.slice(0, 5)}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onViewDetails={handleViewOrderDetails}
                />
              </div>
            </section>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary">Commandes</h1>
                <p className="mt-0.5 text-xs sm:text-sm text-text-muted">
                  {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ExportButton orders={filteredOrders} products={productsList} type="orders" />
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-brand-border bg-white p-4 sm:p-6">
              <OrderFilters
                statusFilter={statusFilter}
                paymentFilter={paymentFilter}
                onStatusFilterChange={setStatusFilter}
                onPaymentFilterChange={setPaymentFilter}
              />
              <div className="mt-4 sm:mt-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <OrdersTable
                  orders={filteredOrders}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onViewDetails={handleViewOrderDetails}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary">Produits</h1>
                <p className="mt-0.5 text-xs sm:text-sm text-text-muted">
                  {productsList.length} produit{productsList.length !== 1 ? 's' : ''} actif{productsList.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <ExportButton orders={orders} products={productsList} type="products" />
                <button
                  onClick={handleAddProduct}
                  className="rounded-lg sm:rounded-xl bg-brand-dark px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-brand-primary transition-all active:scale-95"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <ProductManagement
              products={productsList}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}

        {/* B2B Tab */}
        {activeTab === 'b2b' && canAccessB2B() && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary">Offres B2B</h1>
                <p className="mt-0.5 text-xs sm:text-sm text-text-muted">
                  Gérez vos offres grossistes
                </p>
              </div>
              <button
                onClick={() => setIsCreateOfferModalOpen(true)}
                className="rounded-lg sm:rounded-xl bg-brand-dark px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-brand-primary transition-all active:scale-95"
              >
                Nouvelle offre
              </button>
            </div>

            {/* B2B Stats */}
            {b2bStats && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard label="Actives" value={b2bStats.active_offers_count || 0} />
                <StatCard label="Réponses" value={b2bStats.total_responses_count || 0} />
                <StatCard label="Vendues" value={b2bStats.sold_offers_count || 0} variant="success" />
                <StatCard
                  label="Max Enchère"
                  value={b2bStats.highest_bid ? `${b2bStats.highest_bid}` : '—'}
                />
              </div>
            )}

            {/* B2B Offers Grid */}
            {b2bLoading ? (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 sm:h-64 animate-pulse rounded-xl sm:rounded-2xl bg-brand-border/30" />
                ))}
              </div>
            ) : b2bOffers.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {b2bOffers.map((offer) => (
                  <div key={offer.id} className="relative">
                    <OfferCard
                      offer={offer}
                      onViewDetails={handleViewB2BDetails}
                      onMakeOffer={() => {}}
                    />
                    <button
                      onClick={() => handleDeleteB2BOffer(offer.id)}
                      className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg bg-red-600 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white transition-colors active:bg-red-700"
                    >
                      Suppr.
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-brand-border bg-white/50 px-4 sm:px-6 py-12 sm:py-16 text-center">
                <p className="text-base sm:text-lg font-semibold text-text-muted">Aucune offre B2B</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-text-muted">
                  Créez votre première offre
                </p>
                <button
                  onClick={() => setIsCreateOfferModalOpen(true)}
                  className="mt-4 sm:mt-6 rounded-xl bg-brand-dark px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-brand-primary transition-all active:scale-95"
                >
                  Créer une offre
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary">Statistiques</h1>
                <p className="mt-0.5 text-xs sm:text-sm text-text-muted">
                  Performances de vente
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <StatsRangePicker
                  value={statsPreset}
                  onChange={setStatsPreset}
                  startDate={statsRange.start}
                  endDate={statsRange.end}
                />
                <ExportButton orders={orders} products={productsList} type="all" />
              </div>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 sm:h-32 animate-pulse rounded-xl sm:rounded-2xl bg-brand-border/30" />
                ))}
              </div>
            ) : dashboardStats && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  label="Revenu Total"
                  value={formatCurrency(dashboardStats.totalRevenue)}
                  {...getTrendProps(dashboardStats.trend.totalRevenue)}
                  variant="primary"
                />
                <StatCard
                  label="Revenu Mois"
                  value={formatCurrency(dashboardStats.monthlyRevenue)}
                  {...getTrendProps(dashboardStats.trend.monthlyRevenue)}
                />
                <StatCard
                  label="Commandes"
                  value={dashboardStats.totalOrders}
                  {...getTrendProps(dashboardStats.trend.totalOrders)}
                />
                <StatCard
                  label="Réussite"
                  value={`${Math.round(dashboardStats.completionRate)}%`}
                  {...getTrendProps(dashboardStats.trend.completionRate)}
                  variant="success"
                />
                <StatCard label="En Attente" value={dashboardStats.pendingOrders} />
                <StatCard label="Traitement" value={dashboardStats.processingOrders} />
                <StatCard label="Complétées" value={dashboardStats.completedOrders} variant="success" />
                <StatCard
                  label="Stock Faible"
                  value={dashboardStats.lowStockProducts}
                  variant={dashboardStats.lowStockProducts > 0 ? 'warning' : 'default'}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showB2B={canAccessB2B()}
      />

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSubmit={handleAddProductSubmit}
      />

      <EditProductModal
        isOpen={isEditProductModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsEditProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleEditProductSubmit}
      />

      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        order={selectedOrder}
        onClose={() => {
          setIsOrderDetailsModalOpen(false)
          setSelectedOrder(null)
        }}
        onPrintInvoice={handlePrintInvoice}
      />

      {canAccessB2B() && sellerProfile?.seller_category && (
        <>
          <CreateOfferModal
            isOpen={isCreateOfferModalOpen}
            onClose={() => setIsCreateOfferModalOpen(false)}
            onSubmit={handleCreateB2BOffer}
            sellerCategory={sellerProfile.seller_category as 'importateur' | 'grossiste'}
          />

          <OfferDetailsModal
            isOpen={isB2BDetailsModalOpen}
            onClose={() => {
              setIsB2BDetailsModalOpen(false)
              setSelectedB2BOffer(null)
            }}
            offer={selectedB2BOffer}
            onSubmitResponse={async () => {}}
            canRespond={false}
            isOwner={true}
          />
        </>
      )}
    </div>
  )
}
