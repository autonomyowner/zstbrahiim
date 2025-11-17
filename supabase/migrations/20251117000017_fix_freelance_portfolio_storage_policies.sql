-- Fix storage policies for freelance portfolio images
-- Allow freelancers to upload images to portfolios and products buckets

-- =====================================================
-- FIX PORTFOLIOS BUCKET POLICIES
-- =====================================================

-- Drop old policy and recreate with freelancer role included
DROP POLICY IF EXISTS "Service owners can upload portfolio images" ON storage.objects;

CREATE POLICY "Service owners can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolios' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'freelancer', 'admin')
    )
  );

-- =====================================================
-- FIX PRODUCTS BUCKET POLICIES FOR FREELANCERS
-- =====================================================

-- Drop old policy and recreate to allow freelancers to upload to products bucket
DROP POLICY IF EXISTS "Sellers and admins can upload product images" ON storage.objects;

CREATE POLICY "Sellers and admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'freelancer', 'admin')
    )
  );

-- Also update UPDATE and DELETE policies for products bucket
DROP POLICY IF EXISTS "Sellers and admins can update product images" ON storage.objects;

CREATE POLICY "Sellers and admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'freelancer', 'admin')
    )
  );

DROP POLICY IF EXISTS "Sellers and admins can delete product images" ON storage.objects;

CREATE POLICY "Sellers and admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('seller', 'freelancer', 'admin')
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "Service owners can upload portfolio images" ON storage.objects
  IS 'Allow sellers, freelancers, and admins to upload portfolio images';
COMMENT ON POLICY "Sellers and admins can upload product images" ON storage.objects
  IS 'Allow sellers, freelancers, and admins to upload product/portfolio images';
