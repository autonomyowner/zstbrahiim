export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      products: {
        Row: {
          benefits: string[]
          brand: string
          category: string
          countdown_end_date: string | null
          created_at: string | null
          delivery_estimate: string
          description: string
          exclusive_offers: string | null
          id: string
          in_stock: boolean
          ingredients: string
          is_new: boolean | null
          is_promo: boolean
          name: string
          need: string | null
          original_price: number | null
          payment_info: string
          price: number
          product_category: Database["public"]["Enums"]["product_category_type"]
          product_type: string
          rating: number | null
          returns_info: string
          seller_id: string | null
          shipping_info: string
          slug: string
          updated_at: string | null
          usage_instructions: string
          viewers_count: number
        }
        Insert: {
          benefits?: string[]
          brand: string
          category: string
          countdown_end_date?: string | null
          created_at?: string | null
          delivery_estimate: string
          description: string
          exclusive_offers?: string | null
          id?: string
          in_stock?: boolean
          ingredients: string
          is_new?: boolean | null
          is_promo?: boolean
          name: string
          need?: string | null
          original_price?: number | null
          payment_info: string
          price: number
          product_category?: Database["public"]["Enums"]["product_category_type"]
          product_type: string
          rating?: number | null
          returns_info: string
          seller_id?: string | null
          shipping_info: string
          slug: string
          updated_at?: string | null
          usage_instructions: string
          viewers_count?: number
        }
        Update: {
          benefits?: string[]
          brand?: string
          category?: string
          countdown_end_date?: string | null
          created_at?: string | null
          delivery_estimate?: string
          description?: string
          exclusive_offers?: string | null
          id?: string
          in_stock?: boolean
          ingredients?: string
          is_new?: boolean | null
          is_promo?: boolean
          name?: string
          need?: string | null
          original_price?: number | null
          payment_info?: string
          price?: number
          product_category?: Database["public"]["Enums"]["product_category_type"]
          product_type?: string
          rating?: number | null
          returns_info?: string
          seller_id?: string | null
          shipping_info?: string
          slug?: string
          updated_at?: string | null
          usage_instructions?: string
          viewers_count?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_address: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_wilaya: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          seller_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_wilaya: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_wilaya?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_seller: { Args: never; Returns: boolean }
    }
    Enums: {
      availability_status: "available" | "busy" | "unavailable"
      experience_level: "Débutant" | "Intermédiaire" | "Expert"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      price_type: "fixed" | "hourly" | "starting-at"
      product_category_type: "perfume" | "clothing"
      product_need: "Journée" | "Soirée" | "Quotidien" | "Spécial"
      product_type:
        | "Parfum Femme"
        | "Parfum Homme"
        | "Eau de Parfum"
        | "Eau de Toilette"
      seller_type: "retailer" | "importer" | "wholesaler"
      service_category:
        | "Développement Web"
        | "Design Graphique"
        | "Montage Vidéo"
        | "Marketing Digital"
        | "Rédaction"
        | "Photographie"
        | "Traduction"
        | "Consultation"
      user_role: "customer" | "seller" | "admin"
    }
    CompositeTypes: {}
  }
}

