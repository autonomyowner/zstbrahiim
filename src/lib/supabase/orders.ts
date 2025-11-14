// Orders API - matches existing frontend data format exactly
import { supabase } from './client'
import type {
  Order,
  OrderWithItems,
  OrderStatus,
  PaymentStatus,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  SellerStats,
} from './types'

export type SellerDashboardStatsParams = {
  sellerId: string
  startDate: string
  endDate: string
}

export type SellerDashboardStatsTrend = {
  totalOrders: number | null
  totalRevenue: number | null
  monthlyRevenue: number | null
  completionRate: number | null
}

export type SellerDashboardStats = {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue: number
  totalProducts: number
  lowStockProducts: number
  averageOrderValue: number
  completionRate: number
  range: {
    start: string
    end: string
    label: string
    description: string
  }
  previousRange: {
    start: string
    end: string
  }
  trend: SellerDashboardStatsTrend
}

const dateFormatterShort = new Intl.DateTimeFormat('fr-DZ', {
  day: '2-digit',
  month: 'short',
})

const dateFormatterLong = new Intl.DateTimeFormat('fr-DZ', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const calcTrend = (current: number, previous: number): number | null => {
  if (previous === 0) {
    if (current === 0) {
      return 0
    }
    return null
  }
  return ((current - previous) / previous) * 100
}

const summarizeOrders = (
  orders: Array<{ status: OrderStatus; total: number }>
): {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  totalRevenue: number
} => {
  return orders.reduce(
    (summary, order) => {
      summary.totalOrders += 1
      summary.totalRevenue += Number(order.total) || 0

      switch (order.status) {
        case 'pending':
          summary.pendingOrders += 1
          break
        case 'processing':
          summary.processingOrders += 1
          break
        case 'delivered':
          summary.completedOrders += 1
          break
        default:
          break
      }

      return summary
    },
    {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    }
  )
}

// Adapter to convert database format to frontend format
const adaptOrder = (dbOrder: any): any => {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customer: {
      name: dbOrder.customer_name,
      email: dbOrder.customer_email,
      phone: dbOrder.customer_phone,
      address: dbOrder.customer_address,
      wilaya: dbOrder.customer_wilaya,
    },
    items: (dbOrder.order_items || []).map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      productImage: item.product_image,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
    total: Number(dbOrder.total),
    status: dbOrder.status,
    paymentStatus: dbOrder.payment_status,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    deliveryDate: dbOrder.delivery_date,
    trackingNumber: dbOrder.tracking_number,
    notes: dbOrder.notes,
  }
}

// Get all orders (admin only or user's own orders)
export const getOrders = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          subtotal
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }

    return (data || []).map(adaptOrder)
  } catch (error) {
    console.error('Error in getOrders:', error)
    return []
  }
}

// Get orders by status
export const getOrdersByStatus = async (status: OrderStatus): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          subtotal
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }

    return (data || []).map(adaptOrder)
  } catch (error) {
    console.error('Error in getOrdersByStatus:', error)
    return []
  }
}

// Get order by ID
export const getOrderById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          subtotal
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order by ID:', error)
      return null
    }

    if (!data) return null

    return adaptOrder(data)
  } catch (error) {
    console.error('Error in getOrderById:', error)
    return null
  }
}

// Get order by order number
export const getOrderByNumber = async (orderNumber: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          subtotal
        )
      `)
      .eq('order_number', orderNumber)
      .single()

    if (error) {
      console.error('Error fetching order by number:', error)
      return null
    }

    if (!data) return null

    return adaptOrder(data)
  } catch (error) {
    console.error('Error in getOrderByNumber:', error)
    return null
  }
}

// Create order
export const createOrder = async (orderData: CreateOrderRequest): Promise<string | null> => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Calculate total
    let total = 0
    const items = []

    for (const item of orderData.items) {
      // Fetch product details
      const { data: product } = await supabase
        .from('products')
        .select('name, price, product_images!inner(image_url)')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const price = Number(product.price)
        const subtotal = price * item.quantity

        total += subtotal

        items.push({
          product_id: item.product_id,
          product_name: product.name,
          product_image: (product as any).product_images?.[0]?.image_url || '',
          quantity: item.quantity,
          price,
          subtotal,
        })
      }
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        customer_wilaya: orderData.customer_wilaya,
        total,
        status: 'pending',
        payment_status: 'pending',
        delivery_date: null,
        tracking_number: null,
        notes: null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw orderError
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      ...item,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    return order.id
  } catch (error) {
    console.error('Error in createOrder:', error)
    return null
  }
}

// Create order from checkout (single product)
export const createOrderFromCheckout = async (orderData: {
  user_id: string | null
  seller_id: string | null
  product_id: string
  quantity: number
  total_price: number
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_wilaya: string
  shipping_baladia: string
  shipping_address: string
  delivery_type: string
  status: OrderStatus
  payment_status: PaymentStatus
}): Promise<string | null> => {
  try {
    // Fetch product details including seller_id
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name, price, seller_id, product_images(image_url)')
      .eq('id', orderData.product_id)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError)
      throw new Error('Product not found')
    }

    // Use seller_id from product (not from orderData which might be null)
    const productData = product as any
    const actualSellerId = productData.seller_id || orderData.seller_id

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        seller_id: actualSellerId,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.shipping_address,
        customer_wilaya: orderData.shipping_wilaya,
        total: orderData.total_price,
        status: orderData.status,
        payment_status: orderData.payment_status,
        delivery_date: null,
        tracking_number: null,
        notes: `Baladia: ${orderData.shipping_baladia}, Type: ${orderData.delivery_type}`,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw orderError
    }

    // Insert order item
    const imageUrl = productData.product_images?.[0]?.image_url || ''
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: orderData.product_id,
        product_name: productData.name,
        product_image: imageUrl,
        quantity: orderData.quantity,
        price: orderData.total_price / orderData.quantity,
        subtotal: orderData.total_price,
      })

    if (itemError) {
      console.error('Error creating order item:', itemError)
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemError
    }

    return order.id
  } catch (error) {
    console.error('Error in createOrderFromCheckout:', error)
    return null
  }
}

// Get orders for a specific seller
export const getOrdersForSeller = async (sellerId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          subtotal
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching seller orders:', error)
      throw error
    }

    return (data || []).map(adaptOrder)
  } catch (error) {
    console.error('Error in getOrdersForSeller:', error)
    return []
  }
}

// Get orders for a specific customer (user)
export const getOrdersForCustomer = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          subtotal
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customer orders:', error)
      throw error
    }

    return (data || []).map(adaptOrder)
  } catch (error) {
    console.error('Error in getOrdersForCustomer:', error)
    return []
  }
}

// Update order status (admin only)
export const updateOrderStatus = async (
  updateData: UpdateOrderStatusRequest
): Promise<boolean> => {
  try {
    const updateFields: any = {
      status: updateData.status,
    }

    if (updateData.tracking_number) {
      updateFields.tracking_number = updateData.tracking_number
    }

    if (updateData.delivery_date) {
      updateFields.delivery_date = updateData.delivery_date
    }

    if (updateData.notes) {
      updateFields.notes = updateData.notes
    }

    const { error } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', updateData.order_id)

    if (error) {
      console.error('Error updating order status:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in updateOrderStatus:', error)
    return false
  }
}

// Update payment status
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating payment status:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error)
    return false
  }
}

// Delete order (admin only)
export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId)

    if (error) {
      console.error('Error deleting order:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteOrder:', error)
    return false
  }
}

// Get seller statistics
export const getSellerStats = async (): Promise<any> => {
  try {
    // Get stats from view
    const { data: statsData, error: statsError } = await supabase
      .from('seller_stats_view')
      .select('*')
      .single()

    if (statsError) {
      console.error('Error fetching seller stats:', statsError)
      throw statsError
    }

    // Get product stats
    const { data: productStats, error: productError } = await supabase
      .from('product_stats_view')
      .select('*')
      .single()

    if (productError) {
      console.error('Error fetching product stats:', productError)
      throw productError
    }

    return {
      totalOrders: Number(statsData.total_orders) || 0,
      pendingOrders: Number(statsData.pending_orders) || 0,
      processingOrders: Number(statsData.processing_orders) || 0,
      completedOrders: Number(statsData.completed_orders) || 0,
      totalRevenue: Number(statsData.total_revenue) || 0,
      monthlyRevenue: Number(statsData.monthly_revenue) || 0,
      totalProducts: Number(productStats.total_products) || 0,
      lowStockProducts: Number(productStats.out_of_stock_products) || 0,
    }
  } catch (error) {
    console.error('Error in getSellerStats:', error)
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalProducts: 0,
      lowStockProducts: 0,
    }
  }
}

export const getSellerDashboardStats = async ({
  sellerId,
  startDate,
  endDate,
}: SellerDashboardStatsParams): Promise<SellerDashboardStats> => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date range supplied to getSellerDashboardStats')
  }

  // Ensure start is not after end
  if (start > end) {
    ;[startDate, endDate] = [end.toISOString(), start.toISOString()]
  }

  const adjustedStart = new Date(startDate)
  const adjustedEnd = new Date(endDate)
  const rangeDuration = Math.max(adjustedEnd.getTime() - adjustedStart.getTime(), 0)
  const previousRangeEnd = new Date(adjustedStart.getTime() - 1)
  const previousRangeStart = new Date(previousRangeEnd.getTime() - rangeDuration)

  const rangeLabel = `${dateFormatterShort.format(adjustedStart)} – ${dateFormatterShort.format(
    adjustedEnd
  )}`
  const rangeDescription = `Du ${dateFormatterLong.format(
    adjustedStart
  )} au ${dateFormatterLong.format(adjustedEnd)}`

  const currentMonthStart = new Date(
    Date.UTC(adjustedEnd.getUTCFullYear(), adjustedEnd.getUTCMonth(), 1)
  )
  const previousMonthStart = new Date(
    Date.UTC(adjustedEnd.getUTCFullYear(), adjustedEnd.getUTCMonth() - 1, 1)
  )
  const previousMonthEnd = new Date(currentMonthStart.getTime() - 1)

  const [
    { data: currentOrdersData, error: currentOrdersError },
    { data: previousOrdersData, error: previousOrdersError },
    { data: monthOrdersData, error: monthOrdersError },
    { data: previousMonthOrdersData, error: previousMonthOrdersError },
    { data: productsData, error: productsError },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('status,total,created_at')
      .eq('seller_id', sellerId)
      .gte('created_at', adjustedStart.toISOString())
      .lte('created_at', adjustedEnd.toISOString()),
    supabase
      .from('orders')
      .select('status,total,created_at')
      .eq('seller_id', sellerId)
      .gte('created_at', previousRangeStart.toISOString())
      .lte('created_at', previousRangeEnd.toISOString()),
    supabase
      .from('orders')
      .select('status,total,created_at')
      .eq('seller_id', sellerId)
      .gte(currentMonthStart.toISOString())
      .lte(adjustedEnd.toISOString()),
    supabase
      .from('orders')
      .select('status,total,created_at')
      .eq('seller_id', sellerId)
      .gte(previousMonthStart.toISOString())
      .lte(previousMonthEnd.toISOString()),
    supabase.from('products').select('in_stock').eq('seller_id', sellerId),
  ])

  if (
    currentOrdersError ||
    previousOrdersError ||
    monthOrdersError ||
    previousMonthOrdersError ||
    productsError
  ) {
    console.error('Error fetching seller dashboard stats:', {
      currentOrdersError,
      previousOrdersError,
      monthOrdersError,
      previousMonthOrdersError,
      productsError,
    })
  }

  const currentSummary = summarizeOrders((currentOrdersData as any[]) || [])
  const previousSummary = summarizeOrders((previousOrdersData as any[]) || [])

  const monthSummary = summarizeOrders((monthOrdersData as any[]) || [])
  const previousMonthSummary = summarizeOrders((previousMonthOrdersData as any[]) || [])
  const totalProducts = (productsData || []).length
  const lowStockProducts = (productsData || []).filter((product) => product.in_stock === false)
    .length

  const averageOrderValue =
    currentSummary.totalOrders > 0
      ? currentSummary.totalRevenue / currentSummary.totalOrders
      : 0

  const completionRate =
    currentSummary.totalOrders > 0
      ? (currentSummary.completedOrders / currentSummary.totalOrders) * 100
      : 0

  return {
    totalOrders: currentSummary.totalOrders,
    pendingOrders: currentSummary.pendingOrders,
    processingOrders: currentSummary.processingOrders,
    completedOrders: currentSummary.completedOrders,
    totalRevenue: currentSummary.totalRevenue,
    monthlyRevenue: monthSummary.totalRevenue,
    totalProducts,
    lowStockProducts,
    averageOrderValue,
    completionRate,
    range: {
      start: adjustedStart.toISOString(),
      end: adjustedEnd.toISOString(),
      label: rangeLabel,
      description: rangeDescription,
    },
    previousRange: {
      start: previousRangeStart.toISOString(),
      end: previousRangeEnd.toISOString(),
    },
    trend: {
      totalOrders: calcTrend(currentSummary.totalOrders, previousSummary.totalOrders),
      totalRevenue: calcTrend(currentSummary.totalRevenue, previousSummary.totalRevenue),
      monthlyRevenue: calcTrend(monthSummary.totalRevenue, previousMonthSummary.totalRevenue),
      completionRate: calcTrend(
        completionRate,
        previousSummary.totalOrders > 0
          ? (previousSummary.completedOrders / previousSummary.totalOrders) * 100
          : 0
      ),
    },
  }
}

// Helper functions for formatting (matching existing data format)
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(price)
}

export const getStatusColor = (status: OrderStatus): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  }
  return colors[status]
}

export const getStatusLabel = (status: OrderStatus): string => {
  const labels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  }
  return labels[status]
}

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    paid: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    refunded: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return colors[status]
}

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels = {
    pending: 'En attente',
    paid: 'Payée',
    failed: 'Échouée',
    refunded: 'Remboursée',
  }
  return labels[status]
}
