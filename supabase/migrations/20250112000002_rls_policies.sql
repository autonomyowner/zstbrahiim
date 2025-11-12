-- Row Level Security (RLS) Policies for ZST E-commerce & Freelance Marketplace
-- This file sets up security policies to control data access

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Anyone can view public provider/seller information
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.user_profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Everyone can view products
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

-- Sellers and admins can insert products
CREATE POLICY "Sellers and admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers and admins can update products
CREATE POLICY "Sellers and admins can update products"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers and admins can delete products
CREATE POLICY "Sellers and admins can delete products"
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- =====================================================
-- PRODUCT IMAGES POLICIES
-- =====================================================

-- Everyone can view product images
CREATE POLICY "Product images are viewable by everyone"
  ON public.product_images
  FOR SELECT
  USING (true);

-- Sellers and admins can insert product images
CREATE POLICY "Sellers and admins can insert product images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers and admins can update product images
CREATE POLICY "Sellers and admins can update product images"
  ON public.product_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers and admins can delete product images
CREATE POLICY "Sellers and admins can delete product images"
  ON public.product_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- =====================================================
-- FREELANCE SERVICES POLICIES
-- =====================================================

-- Everyone can view freelance services
CREATE POLICY "Freelance services are viewable by everyone"
  ON public.freelance_services
  FOR SELECT
  USING (true);

-- Authenticated users with seller or freelancer role can create services
CREATE POLICY "Freelancers and sellers can insert their own services"
  ON public.freelance_services
  FOR INSERT
  WITH CHECK (
    auth.uid() = provider_id AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'freelancer', 'admin')
    )
  );

-- Service owners and admins can update services
CREATE POLICY "Service owners and admins can update services"
  ON public.freelance_services
  FOR UPDATE
  USING (
    auth.uid() = provider_id OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service owners and admins can delete services
CREATE POLICY "Service owners and admins can delete services"
  ON public.freelance_services
  FOR DELETE
  USING (
    auth.uid() = provider_id OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FREELANCE PORTFOLIOS POLICIES
-- =====================================================

-- Everyone can view portfolio items
CREATE POLICY "Portfolio items are viewable by everyone"
  ON public.freelance_portfolios
  FOR SELECT
  USING (true);

-- Service owners can insert portfolio items
CREATE POLICY "Service owners can insert portfolio items"
  ON public.freelance_portfolios
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.freelance_services
      WHERE id = service_id AND provider_id = auth.uid()
    )
  );

-- Service owners can update portfolio items
CREATE POLICY "Service owners can update portfolio items"
  ON public.freelance_portfolios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.freelance_services
      WHERE id = service_id AND provider_id = auth.uid()
    )
  );

-- Service owners can delete portfolio items
CREATE POLICY "Service owners can delete portfolio items"
  ON public.freelance_portfolios
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.freelance_services
      WHERE id = service_id AND provider_id = auth.uid()
    )
  );

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Users can view their own orders, admins can view all
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update orders (for status changes)
CREATE POLICY "Only admins can update orders"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete orders
CREATE POLICY "Only admins can delete orders"
  ON public.orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================

-- Users can view order items for their orders
CREATE POLICY "Users can view their own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Order items are created with orders (via triggers or application logic)
CREATE POLICY "Authenticated users can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update order items
CREATE POLICY "Only admins can update order items"
  ON public.order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete order items
CREATE POLICY "Only admins can delete order items"
  ON public.order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is seller
CREATE OR REPLACE FUNCTION is_seller()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('seller', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to views
GRANT SELECT ON seller_stats_view TO authenticated;
GRANT SELECT ON product_stats_view TO authenticated;

-- Comments for documentation
COMMENT ON POLICY "Public profiles are viewable by everyone" ON public.user_profiles IS 'Allow public viewing of provider/seller information';
COMMENT ON POLICY "Products are viewable by everyone" ON public.products IS 'Public product catalog';
COMMENT ON POLICY "Freelance services are viewable by everyone" ON public.freelance_services IS 'Public freelance marketplace';
