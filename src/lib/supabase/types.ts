// TypeScript types matching Supabase database schema
// These types correspond exactly to your database tables

export type UserRole = 'customer' | 'seller' | 'admin'
export type SellerType = 'retailer' | 'importer' | 'wholesaler'
export type ProductType = 'Parfum Femme' | 'Parfum Homme' | 'Eau de Parfum' | 'Eau de Toilette'
export type ProductNeed = 'Journée' | 'Soirée' | 'Quotidien' | 'Spécial'
export type ProductCategoryType = 'perfume' | 'clothing'
export type ServiceCategory =
  | 'Développement Web'
  | 'Design Graphique'
  | 'Montage Vidéo'
  | 'Marketing Digital'
  | 'Rédaction'
  | 'Photographie'
  | 'Traduction'
  | 'Consultation'
export type ExperienceLevel = 'Débutant' | 'Intermédiaire' | 'Expert'
export type PriceType = 'fixed' | 'hourly' | 'starting-at'
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Database Tables
export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  provider_name: string | null
  provider_avatar: string | null
  bio: string | null
  seller_type: SellerType | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  original_price: number | null
  category: string
  product_type: ProductType
  product_category: ProductCategoryType
  need: ProductNeed | null
  in_stock: boolean
  is_promo: boolean
  is_new: boolean | null
  rating: number | null
  viewers_count: number
  countdown_end_date: string | null
  description: string
  benefits: string[]
  ingredients: string
  usage_instructions: string
  delivery_estimate: string
  shipping_info: string
  returns_info: string
  payment_info: string
  exclusive_offers: string | null
  created_at: string
  updated_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export type FreelanceService = {
  id: string
  slug: string
  provider_id: string
  service_title: string
  category: ServiceCategory
  experience_level: ExperienceLevel
  rating: number
  reviews_count: number
  completed_projects: number
  response_time: string
  price: number
  price_type: PriceType
  description: string
  short_description: string
  skills: string[]
  delivery_time: string
  revisions: string
  languages: string[]
  availability: AvailabilityStatus
  featured: boolean | null
  verified: boolean | null
  top_rated: boolean | null
  created_at: string
  updated_at: string
}

export type FreelancePortfolio = {
  id: string
  service_id: string
  title: string
  description: string
  image_url: string
  display_order: number
  created_at: string
}

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_wilaya: string
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  delivery_date: string | null
  tracking_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string
  quantity: number
  price: number
  subtotal: number
  created_at: string
}

// Joined/Extended Types for API responses
export type ProductWithImages = Product & {
  images: ProductImage[]
}

export type FreelanceServiceWithDetails = FreelanceService & {
  portfolio: FreelancePortfolio[]
  provider: Pick<UserProfile, 'provider_name' | 'provider_avatar' | 'bio'>
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}

// Stats and Analytics Types
export type SellerStats = {
  total_orders: number
  pending_orders: number
  processing_orders: number
  completed_orders: number
  total_revenue: number
  monthly_revenue: number
}

export type ProductStats = {
  total_products: number
  out_of_stock_products: number
  perfume_count: number
  clothing_count: number
}

// API Request/Response Types
export type CreateOrderRequest = {
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_wilaya: string
  items: {
    product_id: string
    quantity: number
  }[]
}

export type UpdateOrderStatusRequest = {
  order_id: string
  status: OrderStatus
  tracking_number?: string
  delivery_date?: string
  notes?: string
}

export type CreateProductRequest = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'viewers_count'> & {
  images: string[]
}

export type UpdateProductRequest = Partial<CreateProductRequest> & {
  id: string
}

export type CreateServiceRequest = Omit<
  FreelanceService,
  'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews_count' | 'completed_projects'
> & {
  portfolio: Omit<FreelancePortfolio, 'id' | 'service_id' | 'created_at'>[]
}

export type UpdateServiceRequest = Partial<CreateServiceRequest> & {
  id: string
}

// Filter and Search Types
export type ProductFilters = {
  category?: string
  product_type?: ProductType | ProductType[]
  need?: ProductNeed | ProductNeed[]
  in_stock?: boolean
  is_promo?: boolean
  min_price?: number
  max_price?: number
  brand?: string | string[]
  product_category?: ProductCategoryType
}

export type ServiceFilters = {
  category?: ServiceCategory | ServiceCategory[]
  experience_level?: ExperienceLevel | ExperienceLevel[]
  availability?: AvailabilityStatus
  min_price?: number
  max_price?: number
  featured?: boolean
  verified?: boolean
  top_rated?: boolean
}

export type SortOption = 'best-sellers' | 'price-asc' | 'price-desc' | 'newest' | 'highest-rated'

// Supabase Database Type (for type-safe queries)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'viewers_count'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
      }
      freelance_services: {
        Row: FreelanceService
        Insert: Omit<FreelanceService, 'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews_count' | 'completed_projects'>
        Update: Partial<Omit<FreelanceService, 'id' | 'created_at' | 'updated_at'>>
      }
      freelance_portfolios: {
        Row: FreelancePortfolio
        Insert: Omit<FreelancePortfolio, 'id' | 'created_at'>
        Update: Partial<Omit<FreelancePortfolio, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
    }
    Views: {
      seller_stats_view: {
        Row: SellerStats
      }
      product_stats_view: {
        Row: ProductStats
      }
    }
  }
}
