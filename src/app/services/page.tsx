'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardStats } from '@/components/seller/DashboardStats'
import { QuickActions } from '@/components/seller/QuickActions'
import { OrdersTable } from '@/components/seller/OrdersTable'
import { OrderFilters } from '@/components/seller/OrderFilters'
import { ProductManagement } from '@/components/seller/ProductManagement'
import { AnalyticsSection } from '@/components/seller/AnalyticsSection'
import { AddProductModal, type ProductFormData } from '@/components/seller/AddProductModal'
import { EditProductModal } from '@/components/seller/EditProductModal'
import { OrderDetailsModal } from '@/components/seller/OrderDetailsModal'
import { ExportButton } from '@/components/seller/ExportButton'
import { mockOrders, mockSellerStats, type Order, type OrderStatus, type PaymentStatus } from '@/data/orders'
import { type Product } from '@/data/products'
import { printInvoice } from '@/utils/printInvoice'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/supabase/products'
import { isSeller } from '@/lib/supabase/auth'

type TabType = 'dashboard' | 'orders' | 'products' | 'analytics'

export default function SellerPortalPage(): JSX.Element {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [productsList, setProductsList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

  // Fetch products from Supabase
  useEffect(() => {
    if (authChecking) return
    
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const fetchedProducts = await getProducts()
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

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    )
  }

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsModalOpen(true)
  }

  const handleAddProduct = () => {
    setIsAddProductModalOpen(true)
  }

  const handleAddProductSubmit = async (productData: ProductFormData) => {
    try {
      setProductError(null)
      
      // Prepare product data for Supabase
      const productPayload = {
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
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
      }

      const productId = await createProduct(productPayload)
      
      if (productId) {
        setSuccessMessage(`Produit "${productData.name}" ajouté avec succès!`)
        // Refresh products list
        const updatedProducts = await getProducts()
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

  const handleEditProductSubmit = async (productId: string, productData: ProductFormData) => {
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
        setSuccessMessage(`Produit "${productData.name}" modifié avec succès!`)
        // Refresh products list
        const updatedProducts = await getProducts()
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
          // Refresh products list
          const updatedProducts = await getProducts()
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

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Tableau de Bord' },
    { id: 'orders' as TabType, label: 'Commandes' },
    { id: 'products' as TabType, label: 'Produits' },
    { id: 'analytics' as TabType, label: 'Analytiques' },
  ]

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
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {productError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {productError}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-900 mb-2">
            Portail Vendeur
          </h1>
          <p className="text-kitchen-lux-dark-green-700">
            Gérez vos commandes, produits et analysez vos performances
          </p>
        </div>

        {/* Seller Type Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-full text-sm font-medium">
            Grossiste / Importateur / Détaillant
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-kitchen-lux-dark-green-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-kitchen-lux-dark-green-600 text-kitchen-lux-dark-green-900'
                    : 'border-transparent text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-900 hover:border-kitchen-lux-dark-green-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'dashboard' && (
            <div>
              <DashboardStats stats={mockSellerStats} />
              <QuickActions
                onViewOrders={() => setActiveTab('orders')}
                onAddProduct={handleAddProduct}
                onManageInventory={() => setActiveTab('products')}
                onViewAnalytics={() => setActiveTab('analytics')}
              />

              {/* Recent Orders Preview */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900">
                    Commandes Récentes
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-900 font-medium"
                  >
                    Voir tout →
                  </button>
                </div>
                <OrdersTable
                  orders={orders.slice(0, 5)}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onViewDetails={handleViewOrderDetails}
                />
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900">
                  Gestion des Commandes
                </h2>
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
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900">
                  Gestion des Produits
                </h2>
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

          {activeTab === 'analytics' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900">
                  Analytiques & Rapports
                </h2>
                <ExportButton orders={orders} products={productsList} type="all" />
              </div>
              <AnalyticsSection stats={mockSellerStats} />
            </div>
          )}
        </div>
      </div>

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
    </div>
  )
}
