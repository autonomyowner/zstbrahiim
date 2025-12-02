-- ZST E-commerce & Freelance Marketplace Database Schema
-- Initial Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE product_type AS ENUM ('Parfum Femme', 'Parfum Homme', 'Eau de Parfum', 'Eau de Toilette');
CREATE TYPE product_need AS ENUM ('Journée', 'Soirée', 'Quotidien', 'Spécial');
CREATE TYPE product_category_type AS ENUM ('perfume', 'clothing');
CREATE TYPE service_category AS ENUM ('Développement Web', 'Design Graphique', 'Montage Vidéo', 'Marketing Digital', 'Rédaction', 'Photographie', 'Traduction', 'Consultation');
CREATE TYPE experience_level AS ENUM ('Débutant', 'Intermédiaire', 'Expert');
CREATE TYPE price_type AS ENUM ('fixed', 'hourly', 'starting-at');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'freelancer', 'admin');
CREATE TYPE seller_type AS ENUM ('retailer', 'importer', 'wholesaler');

-- =====================================================
-- USERS & PROFILES
-- =====================================================

-- User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',

  -- Seller/Provider specific fields
  provider_name TEXT,
  provider_avatar TEXT,
  bio TEXT,
  seller_type seller_type,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- =====================================================
-- PRODUCTS
-- =====================================================

-- Products table (perfumes and winter clothes)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= 0),
  category TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_category product_category_type NOT NULL DEFAULT 'perfume',
  need TEXT,
  seller_id UUID REFERENCES auth.users(id),

  -- Status flags
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_promo BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN DEFAULT false,

  -- Rating and engagement
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  viewers_count INTEGER NOT NULL DEFAULT 0,
  countdown_end_date TIMESTAMP WITH TIME ZONE,

  -- Product details
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  ingredients TEXT NOT NULL,
  usage_instructions TEXT NOT NULL,
  delivery_estimate TEXT NOT NULL,

  -- Additional information
  shipping_info TEXT NOT NULL,
  returns_info TEXT NOT NULL,
  payment_info TEXT NOT NULL,
  exclusive_offers TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(product_category);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_is_promo ON public.products(is_promo);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);

-- =====================================================
-- FREELANCE SERVICES
-- =====================================================

-- Freelance services table
CREATE TABLE public.freelance_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Service details
  service_title TEXT NOT NULL,
  category service_category NOT NULL,
  experience_level experience_level NOT NULL,

  -- Ratings and stats
  rating NUMERIC(2, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0,
  completed_projects INTEGER NOT NULL DEFAULT 0,
  response_time TEXT NOT NULL,

  -- Pricing
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  price_type price_type NOT NULL,

  -- Descriptions
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',

  -- Service terms
  delivery_time TEXT NOT NULL,
  revisions TEXT NOT NULL,
  languages TEXT[] NOT NULL DEFAULT '{}',

  -- Status flags
  availability availability_status NOT NULL DEFAULT 'available',
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  top_rated BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freelance portfolio items
CREATE TABLE public.freelance_portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES public.freelance_services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for freelance services
CREATE INDEX idx_freelance_services_slug ON public.freelance_services(slug);
CREATE INDEX idx_freelance_services_provider ON public.freelance_services(provider_id);
CREATE INDEX idx_freelance_services_category ON public.freelance_services(category);
CREATE INDEX idx_freelance_services_featured ON public.freelance_services(featured);
CREATE INDEX idx_freelance_portfolios_service_id ON public.freelance_portfolios(service_id);

-- =====================================================
-- ORDERS
-- =====================================================

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_wilaya TEXT NOT NULL,

  -- Order details
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',

  -- Shipping details
  delivery_date TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

  -- Snapshot of product at time of order
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- Seller statistics view
CREATE VIEW seller_stats_view AS
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
  SUM(total) as total_revenue,
  SUM(total) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as monthly_revenue
FROM orders;

-- Product statistics view (for seller dashboard)
CREATE VIEW product_stats_view AS
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE in_stock = false) as out_of_stock_products,
  COUNT(*) FILTER (WHERE product_category = 'perfume') as perfume_count,
  COUNT(*) FILTER (WHERE product_category = 'clothing') as clothing_count
FROM products;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  year_part TEXT;
  counter INTEGER;
BEGIN
  year_part := to_char(CURRENT_DATE, 'YYYY');

  -- Get the count of orders for this year
  SELECT COUNT(*) + 1 INTO counter
  FROM orders
  WHERE order_number LIKE 'ORD-' || year_part || '-%';

  new_order_number := 'ORD-' || year_part || '-' || lpad(counter::TEXT, 3, '0');

  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for freelance_services
CREATE TRIGGER update_freelance_services_updated_at
  BEFORE UPDATE ON public.freelance_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order number on insert
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create initial admin user profile
-- Note: You'll need to create the auth user first through Supabase Dashboard or Auth API
-- Then insert the profile here with the actual UUID

COMMENT ON TABLE public.user_profiles IS 'Extended user information beyond auth.users';
COMMENT ON TABLE public.products IS 'All products including perfumes and winter clothes';
COMMENT ON TABLE public.product_images IS 'Product image gallery';
COMMENT ON TABLE public.freelance_services IS 'Freelance marketplace service listings';
COMMENT ON TABLE public.freelance_portfolios IS 'Portfolio items for freelance services';
COMMENT ON TABLE public.orders IS 'Customer orders';
COMMENT ON TABLE public.order_items IS 'Individual items within orders';
