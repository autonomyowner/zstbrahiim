-- Storage Buckets and Policies for ZST E-commerce & Freelance Marketplace
-- This file sets up storage buckets for images and files

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Bucket for product images (perfumes and winter clothes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for user/provider avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for freelance portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR PRODUCTS BUCKET
-- =====================================================

-- Everyone can view product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Sellers and admins can upload product images
CREATE POLICY "Sellers and admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers and admins can update product images
CREATE POLICY "Sellers and admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Sellers and admins can delete product images
CREATE POLICY "Sellers and admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- =====================================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- =====================================================

-- Everyone can view avatars
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- STORAGE POLICIES FOR PORTFOLIOS BUCKET
-- =====================================================

-- Everyone can view portfolio images
CREATE POLICY "Portfolio images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolios');

-- Service owners can upload portfolio images
CREATE POLICY "Service owners can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolios' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- Service owners can update their portfolio images
CREATE POLICY "Service owners can update portfolio images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolios' AND
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Service owners can delete their portfolio images
CREATE POLICY "Service owners can delete portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolios' AND
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get public URL for storage object
CREATE OR REPLACE FUNCTION get_storage_url(bucket text, path text)
RETURNS text AS $$
DECLARE
  base_url text;
BEGIN
  SELECT concat(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/',
    bucket,
    '/',
    path
  ) INTO base_url;

  RETURN base_url;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_storage_url IS 'Generate public URL for storage objects';
