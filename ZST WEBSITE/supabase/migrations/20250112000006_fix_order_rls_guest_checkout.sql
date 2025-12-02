-- Fix RLS policies to allow guest checkout
-- This migration updates the orders and order_items policies to support both authenticated and guest users

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

-- Create new policy that allows both authenticated and guest users to create orders
CREATE POLICY "Users can create orders (authenticated or guest)"
  ON public.orders
  FOR INSERT
  WITH CHECK (true); -- Allow anyone to create orders

-- Drop the existing restrictive policy for order items
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;

-- Create new policy that allows both authenticated and guest users to create order items
CREATE POLICY "Users can create order items (authenticated or guest)"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true); -- Allow anyone to create order items

-- Update the SELECT policy for orders to include guest orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders or guest orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    user_id IS NULL OR -- Guest orders
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seller')
    )
  );

-- Update the SELECT policy for order items to include guest orders
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

CREATE POLICY "Users can view their own order items or guest order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (
        user_id = auth.uid() OR
        user_id IS NULL OR -- Guest orders
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'seller')
        )
      )
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "Users can create orders (authenticated or guest)" ON public.orders IS 'Allows both authenticated users and guests to create orders';
COMMENT ON POLICY "Users can create order items (authenticated or guest)" ON public.order_items IS 'Allows both authenticated users and guests to create order items';
