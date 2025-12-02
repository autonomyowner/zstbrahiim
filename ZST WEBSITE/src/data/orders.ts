export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type SellerType = 'retailer' | 'importer' | 'wholesaler'

export type OrderItem = {
  productId: string | null
  productName: string
  productImage: string
  quantity: number
  price: number
  subtotal: number
}

export type Order = {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string | null
    phone: string
    address: string
    wilaya: string
  }
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
  deliveryDate?: string | null
  trackingNumber?: string | null
  notes?: string | null
}

// Mock orders data
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    customer: {
      name: 'Ahmed Benali',
      email: 'ahmed.benali@email.com',
      phone: '+213 555 123 456',
      address: '12 Rue des Martyrs',
      wilaya: 'Alger',
    },
    items: [
      {
        productId: '1',
        productName: 'Parfum Luxury Rose',
        productImage: '/perfums/women/1.jpg',
        quantity: 2,
        price: 12500,
        subtotal: 25000,
      },
    ],
    total: 25000,
    status: 'pending',
    paymentStatus: 'paid',
    createdAt: '2025-11-10T10:30:00',
    updatedAt: '2025-11-10T10:30:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    customer: {
      name: 'Fatima Zahra',
      email: 'fatima.zahra@email.com',
      phone: '+213 555 789 012',
      address: '45 Avenue de la Liberté',
      wilaya: 'Oran',
    },
    items: [
      {
        productId: '2',
        productName: 'Eau de Parfum Jasmine',
        productImage: '/perfums/women/2.jpg',
        quantity: 1,
        price: 15000,
        subtotal: 15000,
      },
      {
        productId: '3',
        productName: 'Parfum Oriental Night',
        productImage: '/perfums/women/3.jpg',
        quantity: 1,
        price: 18000,
        subtotal: 18000,
      },
    ],
    total: 33000,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: '2025-11-09T14:20:00',
    updatedAt: '2025-11-10T09:15:00',
    trackingNumber: 'TRK-ALG-2025-456',
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    customer: {
      name: 'Karim Hassani',
      email: 'karim.hassani@email.com',
      phone: '+213 555 345 678',
      address: '78 Boulevard Mohamed V',
      wilaya: 'Constantine',
    },
    items: [
      {
        productId: '4',
        productName: 'Parfum Homme Oud',
        productImage: '/perfums/men/1.jpg',
        quantity: 3,
        price: 16000,
        subtotal: 48000,
      },
    ],
    total: 48000,
    status: 'shipped',
    paymentStatus: 'paid',
    createdAt: '2025-11-08T16:45:00',
    updatedAt: '2025-11-09T11:30:00',
    deliveryDate: '2025-11-12',
    trackingNumber: 'TRK-ALG-2025-123',
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    customer: {
      name: 'Sophia Mansouri',
      email: 'sophia.mansouri@email.com',
      phone: '+213 555 901 234',
      address: '23 Rue de la Paix',
      wilaya: 'Bouzareah',
    },
    items: [
      {
        productId: '5',
        productName: 'Eau de Toilette Fresh',
        productImage: '/perfums/women/4.jpg',
        quantity: 2,
        price: 9500,
        subtotal: 19000,
      },
    ],
    total: 19000,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2025-11-05T09:00:00',
    updatedAt: '2025-11-07T15:20:00',
    deliveryDate: '2025-11-07',
    trackingNumber: 'TRK-ALG-2025-789',
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    customer: {
      name: 'Youcef Belkacem',
      email: 'youcef.belkacem@email.com',
      phone: '+213 555 567 890',
      address: '56 Rue Ibn Khaldoun',
      wilaya: 'Tlemcen',
    },
    items: [
      {
        productId: '6',
        productName: 'Parfum Luxury Collection',
        productImage: '/perfums/men/2.jpg',
        quantity: 1,
        price: 22000,
        subtotal: 22000,
      },
    ],
    total: 22000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2025-11-03T11:30:00',
    updatedAt: '2025-11-04T10:00:00',
    notes: 'Client requested cancellation',
  },
]

// Helper functions
export function getOrdersByStatus(status: OrderStatus): Order[] {
  return mockOrders.filter((order) => order.status === status)
}

export function getOrderById(id: string): Order | undefined {
  return mockOrders.find((order) => order.id === id)
}

export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
  }).format(price)
}

export function getStatusColor(status: OrderStatus): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  }
  return colors[status]
}

export function getStatusLabel(status: OrderStatus): string {
  const labels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  }
  return labels[status]
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    paid: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    refunded: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return colors[status]
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels = {
    pending: 'En attente',
    paid: 'Payée',
    failed: 'Échouée',
    refunded: 'Remboursée',
  }
  return labels[status]
}
