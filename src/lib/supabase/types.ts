// TypeScript types matching Supabase database schema
// These types correspond exactly to your database tables

export type UserRole = 'customer' | 'seller' | 'freelancer' | 'admin'
export type SellerType = 'retailer' | 'importer' | 'wholesaler'
export type SellerCategory = 'fournisseur' | 'importateur' | 'grossiste'
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
  seller_category: SellerCategory | null
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
  seller_id?: string | null
  seller_category: SellerCategory | null
  min_quantity: number
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export type ProductVideo = {
  id: string
  product_id: string
  video_url: string
  video_storage_path: string
  thumbnail_url: string
  thumbnail_storage_path: string
  duration_seconds: number
  file_size_bytes: number
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
  seller_id?: string | null
  customer_name: string
  customer_email: string | null
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
  video?: ProductVideo
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

// B2B Marketplace Types
export type B2BOfferType = 'negotiable' | 'auction'
export type B2BOfferStatus = 'active' | 'expired' | 'closed' | 'sold'
export type B2BResponseType = 'bid' | 'negotiation'
export type B2BResponseStatus = 'pending' | 'accepted' | 'rejected' | 'outbid' | 'withdrawn'
export type B2BNotificationType =
  | 'new_offer'
  | 'new_bid'
  | 'outbid'
  | 'negotiation_submitted'
  | 'negotiation_accepted'
  | 'negotiation_rejected'
  | 'auction_won'
  | 'auction_lost'
  | 'auction_ending_soon'
  | 'offer_expired'

export type B2BOffer = {
  id: string
  seller_id: string
  title: string
  description: string
  images: string[]
  tags: string[]
  base_price: number
  min_quantity: number
  available_quantity: number
  offer_type: B2BOfferType
  status: B2BOfferStatus
  current_bid: number | null
  highest_bidder_id: string | null
  starts_at: string | null
  ends_at: string | null
  target_category: SellerCategory
  created_at: string
  updated_at: string
}

export type B2BOfferWithDetails = B2BOffer & {
  seller_name: string
  seller_category: SellerCategory
  seller_email: string
  pending_responses_count: number
  total_responses_count: number
  highest_bid_amount: number | null
  display_status: string
  seconds_remaining: number | null
}

export type B2BOfferResponse = {
  id: string
  offer_id: string
  buyer_id: string
  response_type: B2BResponseType
  status: B2BResponseStatus
  amount: number
  quantity: number
  message: string | null
  created_at: string
  updated_at: string
}

export type B2BResponseWithDetails = B2BOfferResponse & {
  offer_title: string
  seller_id: string
  offer_type: B2BOfferType
  offer_status: B2BOfferStatus
  buyer_name: string
  buyer_category: SellerCategory
  seller_name: string
  seller_category: SellerCategory
}

export type B2BNotification = {
  id: string
  user_id: string
  type: B2BNotificationType
  title: string
  message: string
  offer_id: string | null
  response_id: string | null
  metadata: Record<string, any>
  read: boolean
  read_at: string | null
  created_at: string
}

// B2B API Request Types
export type CreateB2BOfferRequest = {
  title: string
  description: string
  images?: string[]
  tags?: string[]
  base_price: number
  min_quantity: number
  available_quantity: number
  offer_type: B2BOfferType
  starts_at?: string
  ends_at?: string
}

export type UpdateB2BOfferRequest = Partial<
  Omit<B2BOffer, 'id' | 'seller_id' | 'created_at' | 'updated_at' | 'target_category'>
>

export type CreateB2BResponseRequest = {
  offer_id: string
  response_type: B2BResponseType
  amount: number
  quantity: number
  message?: string
}

// Supabase Database Type (for type-safe queries)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'viewers_count'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
        Relationships: []
      }
      product_videos: {
        Row: ProductVideo
        Insert: Omit<ProductVideo, 'id' | 'created_at'>
        Update: Partial<Omit<ProductVideo, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'product_videos_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      freelance_services: {
        Row: FreelanceService
        Insert: Omit<FreelanceService, 'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews_count' | 'completed_projects'>
        Update: Partial<Omit<FreelanceService, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      freelance_portfolios: {
        Row: FreelancePortfolio
        Insert: Omit<FreelancePortfolio, 'id' | 'created_at'>
        Update: Partial<Omit<FreelancePortfolio, 'id' | 'created_at'>>
        Relationships: []
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: {
      seller_stats_view: {
        Row: SellerStats
        Relationships: []
      }
      product_stats_view: {
        Row: ProductStats
        Relationships: []
      }
      seller_products_view: {
        Row: Product
        Relationships: []
      }
      seller_product_images_view: {
        Row: ProductImage
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
