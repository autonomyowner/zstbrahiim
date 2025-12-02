-- Add seller_id column to orders table
-- This migration adds the missing seller_id column that is required for order tracking

-- Add seller_id column to orders table
ALTER TABLE public.orders
ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);

-- Make customer_email nullable to support guest checkout
ALTER TABLE public.orders
ALTER COLUMN customer_email DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.seller_id IS 'Reference to the seller who owns the product being ordered';
COMMENT ON COLUMN public.orders.customer_email IS 'Customer email - can be null for guest checkout';
