'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardStats } from '@/components/seller/DashboardStats'
import { QuickActions } from '@/components/seller/QuickActions'
import { OrdersTable } from '@/components/seller/OrdersTable'
import { OrderFilters } from '@/components/seller/OrderFilters'
import { ProductManagement } from '@/components/seller/ProductManagement'
import { AnalyticsSection } from '@/components/seller/AnalyticsSection'
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
import { getOfferResponses } from '@/lib/supabase/b2b-responses'
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
  const [searchQuery, setSearchQuery] = useState('')

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
        // Use getSellerProducts to fetch only the authenticated seller's products
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
      const matchesSearch =
        searchQuery === '' ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesPayment && matchesSearch
    })
  }, [orders, statusFilter, paymentFilter, searchQuery])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update in database
      const success = await updateOrderStatusInDb({
        order_id: orderId,
        status: newStatus,
      })
      
      if (success) {
        // Update local state
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
      
      // Get current user (seller)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setProductError('Vous devez être connecté pour ajouter un produit')
        return
      }
      
      // Prepare product data for Supabase
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
        benefits: productData.benefits.split('\n').filter((b: string) => b.trim()),
        ingredients: productData.ingredients,
        usage_instructions: productData.usageInstructions,
        delivery_estimate: productData.deliveryEstimate,
        shipping_info: 'Livraison gratuite à partir de 20 000 DA',
        returns_info: 'Retours acceptés sous 14 jours',
        payment_info: 'Paiement à la livraison',
        exclusive_offers: null,
        images: [productData.image],
        seller_id: user.id, // Add seller ID to track product ownership
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
            setProductError(videoError?.message || 'Erreur lors de l’ajout de la vidéo.')
          }
        }

        setSuccessMessage(`Produit "${productData.name}" ajouté avec succès!`)
        // Refresh products list (only seller's products)
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
        benefits: productData.benefits.split('\n').filter((b: string) => b.trim()),
        ingredients: productData.ingredients,
        usage_instructions: productData.usageInstructions,
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
        // Refresh products list (only seller's products)
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
          // Refresh products list (only seller's products)
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

      // Refresh B2B offers
      const offers = await getMyOffers()
      setB2BOffers(offers)

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Error creating B2B offer:', error)
      setProductError(error.message || 'Erreur lors de la création de l\'offre B2B')
    }
  }

  const handleDeleteB2BOffer = async (offerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre B2B?')) {
      try {
        setProductError(null)
        await deleteOffer(offerId)
        setSuccessMessage('Offre B2B supprimée avec succès!')

        // Refresh B2B offers
        const offers = await getMyOffers()
        setB2BOffers(offers)

        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (error: any) {
        console.error('Error deleting B2B offer:', error)
        setProductError(error.message || 'Erreur lors de la suppression de l\'offre B2B')
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

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Tableau de Bord' },
    { id: 'orders' as TabType, label: 'Commandes' },
    { id: 'products' as TabType, label: 'Produits' },
    ...(canAccessB2B() ? [{ id: 'b2b' as TabType, label: 'Offres B2B' }] : []),
    { id: 'analytics' as TabType, label: 'Analytiques' },
  ]

  const sellerSpaceBanner = useMemo(() => {
    if (!sellerProfile || !sellerProfile.seller_category || sellerProfile.seller_category === 'fournisseur') {
      return null
    }

    return sellerProfile.seller_category === 'grossiste'
      ? {
          title: 'Espace grossistes ZST',
          description: 'Accès direct aux offres importateurs et commandes inter-boutiques.',
        }
      : {
          title: 'Espace importateurs ZST',
          description: 'Publiez vos lots réservés aux grossistes certifiés ZST.',
        }
  }, [sellerProfile])

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kitchen-lux-dark-green-900 mx-auto mb-4"></div>
          <p className="text-kitchen-lux-dark-green-700">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-light px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-72 xl:w-80">
            <div className="sticky top-28 rounded-3xl bg-brand-dark p-5 sm:p-6 text-text-inverted shadow-card-md">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-primary px-3 py-2 text-brand-dark font-black text-lg">
                  Z
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 whitespace-nowrap overflow-hidden text-ellipsis">
                    Seller suite
                  </p>
                  <p className="text-base sm:text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    ZST Dashboard
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs sm:text-sm text-white/70 leading-relaxed">
                Suivez vos commandes, gérez le catalogue et exportez vos rapports.
              </p>
              <div className="mt-6 space-y-2 text-xs sm:text-sm font-semibold">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-left transition ${
                      activeTab === tab.id ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {sellerSpaceBanner && (
              <div className="mb-6 rounded-2xl border border-brand-border bg-white px-5 py-4 text-brand-dark shadow-card-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-dark/70">
                  {sellerSpaceBanner.title}
                </p>
                <p className="mt-2 text-sm text-brand-dark/80">{sellerSpaceBanner.description}</p>
              </div>
            )}
            {successMessage && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-800 shadow-card-sm">
                {successMessage}
              </div>
            )}
            {productError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-card-sm">
                {productError}
              </div>
            )}

            <div className="mb-8">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-muted">
                Portail vendeur
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary">
                  Espace fournisseur ZST
                </h1>
                <span className="rounded-full bg-brand-dark px-3 sm:px-4 py-1 text-[9px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-primary whitespace-nowrap">
                  Grossiste / Importateur
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                Gérez vos commandes, vos fiches produits et analysez vos performances en un seul endroit.
              </p>
            </div>

            <div className="mb-8 border-b border-brand-border">
              <nav className="flex gap-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? 'bg-brand-dark text-text-inverted'
                        : 'bg-white text-text-muted ring-1 ring-brand-border hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-10">
              {activeTab === 'dashboard' && (
                <div>
                  <div className="space-y-4">
                    <StatsRangePicker
                      value={statsPreset}
                      onChange={setStatsPreset}
                      startDate={statsRange.start}
                      endDate={statsRange.end}
                    />
                    {statsError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {statsError}
                      </div>
                    )}
                    {statsLoading && (
                      <div className="rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-text-muted shadow-card-sm">
                        Chargement des statistiques...
                      </div>
                    )}
                    {!statsLoading && dashboardStats && (
                      <DashboardStats stats={dashboardStats} />
                    )}
                  </div>
                  <QuickActions
                    onViewOrders={() => setActiveTab('orders')}
                    onAddProduct={handleAddProduct}
                    onManageInventory={() => setActiveTab('products')}
                    onViewAnalytics={() => setActiveTab('analytics')}
                    onCreateB2BOffer={canAccessB2B() ? () => setIsCreateOfferModalOpen(true) : undefined}
                  />
                  <div className="mt-10 rounded-3xl border border-brand-border bg-white/95 p-6 shadow-card-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-text-primary">Commandes récentes</h2>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-sm font-semibold text-brand-dark"
                      >
                        Voir tout →
                      </button>
                    </div>
                    <div className="mt-4">
                      <OrdersTable
                        orders={orders.slice(0, 5)}
                        onUpdateStatus={handleUpdateOrderStatus}
                        onViewDetails={handleViewOrderDetails}
                      />
                    </div>
                  </div>
                  {!statsLoading && dashboardStats && (
                    <div className="mt-10">
                      <AnalyticsSection stats={dashboardStats} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Commandes</p>
                      <h2 className="text-2xl font-semibold text-text-primary">Gestion des commandes</h2>
                    </div>
                    <ExportButton orders={filteredOrders} products={productsList} type="orders" />
                  </div>
                  <OrderFilters
                    statusFilter={statusFilter}
                    paymentFilter={paymentFilter}
                    searchQuery={searchQuery}
                    onStatusFilterChange={setStatusFilter}
                    onPaymentFilterChange={setPaymentFilter}
                    onSearchQueryChange={setSearchQuery}
                  />
                  <OrdersTable
                    orders={filteredOrders}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onViewDetails={handleViewOrderDetails}
                  />
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Catalogue</p>
                      <h2 className="text-2xl font-semibold text-text-primary">Gestion des produits</h2>
                    </div>
                    <ExportButton orders={orders} products={productsList} type="products" />
                  </div>
                  <ProductManagement
                    products={productsList}
                    onAddProduct={handleAddProduct}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                </div>
              )}

              {activeTab === 'b2b' && canAccessB2B() && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                        {sellerProfile?.seller_category === 'importateur' ? 'Importateur' : 'Grossiste'}
                      </p>
                      <h2 className="text-2xl font-semibold text-text-primary">Mes offres B2B</h2>
                    </div>
                    <button
                      onClick={() => setIsCreateOfferModalOpen(true)}
                      className="rounded-xl bg-brand-dark px-6 py-3 text-sm font-bold text-brand-primary transition-all hover:bg-black shadow-card-sm hover:shadow-card-md"
                    >
                      Créer une offre B2B
                    </button>
                  </div>

                  {/* B2B Statistics */}
                  {b2bStats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Offres actives</p>
                        <p className="mt-2 text-2xl font-bold text-text-primary">{b2bStats.active_offers_count || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Réponses reçues</p>
                        <p className="mt-2 text-2xl font-bold text-text-primary">{b2bStats.total_responses_count || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Offres vendues</p>
                        <p className="mt-2 text-2xl font-bold text-text-primary">{b2bStats.sold_offers_count || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Enchère max</p>
                        <p className="mt-2 text-2xl font-bold text-text-primary">
                          {b2bStats.highest_bid ? `${b2bStats.highest_bid} DZD` : '0 DZD'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* B2B Offers List */}
                  {b2bLoading ? (
                    <div className="rounded-2xl border border-brand-border bg-white px-4 py-12 text-center shadow-card-sm">
                      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-brand-dark"></div>
                      <p className="text-text-muted">Chargement des offres B2B...</p>
                    </div>
                  ) : b2bOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {b2bOffers.map((offer) => (
                        <div key={offer.id} className="relative">
                          <OfferCard
                            offer={offer}
                            onViewDetails={handleViewB2BDetails}
                            onMakeOffer={() => {}}
                          />
                          <button
                            onClick={() => handleDeleteB2BOffer(offer.id)}
                            className="absolute top-4 right-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-brand-border bg-white px-4 py-12 text-center shadow-card-sm">
                      <p className="text-lg font-semibold text-text-muted mb-2">
                        Aucune offre B2B pour le moment
                      </p>
                      <p className="text-sm text-text-muted mb-4">
                        Créez votre première offre pour commencer à vendre en gros
                      </p>
                      <button
                        onClick={() => setIsCreateOfferModalOpen(true)}
                        className="rounded-xl bg-brand-dark px-6 py-3 text-sm font-bold text-brand-primary hover:bg-black transition-all"
                      >
                        Créer une offre B2B
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Rapports</p>
                      <h2 className="text-2xl font-semibold text-text-primary">Analytiques & rapports</h2>
                    </div>
                    <ExportButton orders={orders} products={productsList} type="all" />
                  </div>
                  <StatsRangePicker
                    value={statsPreset}
                    onChange={setStatsPreset}
                    startDate={statsRange.start}
                    endDate={statsRange.end}
                  />
                  {statsError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {statsError}
                    </div>
                  )}
                  {statsLoading && (
                    <div className="rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm text-text-muted shadow-card-sm">
                      Chargement des statistiques...
                    </div>
                  )}
                  {!statsLoading && dashboardStats && <AnalyticsSection stats={dashboardStats} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
