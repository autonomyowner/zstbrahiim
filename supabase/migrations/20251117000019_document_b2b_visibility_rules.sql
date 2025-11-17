-- Document B2B Product Visibility Rules
-- This migration adds comprehensive documentation to clarify the RLS policy

-- Current visibility matrix (enforced by RLS policy "Products viewable by audience"):
--
-- | Seller Category → | fournisseur | importateur | grossiste  |
-- | Viewer ↓          |             |             |            |
-- |-------------------|-------------|-------------|------------|
-- | fournisseur       | ✅ VISIBLE  | ❌ HIDDEN   | ✅ VISIBLE |
-- | importateur       | ✅ VISIBLE  | ❌ HIDDEN   | ❌ HIDDEN  |
-- | grossiste         | ✅ VISIBLE  | ✅ VISIBLE  | ❌ HIDDEN  |
-- | admin             | ✅ VISIBLE  | ✅ VISIBLE  | ✅ VISIBLE |
-- | customer          | ✅ VISIBLE  | ❌ HIDDEN   | ❌ HIDDEN  |
-- | (not logged in)   | ✅ VISIBLE  | ❌ HIDDEN   | ❌ HIDDEN  |
--
-- KEY BUSINESS RULES:
-- 1. Fournisseur products are PUBLIC (visible on main marketplace)
-- 2. Importateur products are B2B-only, visible ONLY to grossistes
-- 3. Grossiste products are B2B-only, visible ONLY to fournisseurs
-- 4. Sellers can always see their own products regardless of category
-- 5. Admins can see all products
--
-- SECURITY GUARANTEE:
-- ✅ Fournisseurs CANNOT see importateur offers (enforced by RLS)
-- ✅ Importateurs CANNOT see grossiste offers (enforced by RLS)
-- ✅ Grossistes CANNOT see other grossiste offers (enforced by RLS)
-- ✅ B2B offers are completely hidden from non-authenticated users

-- Add detailed comment to the RLS policy
COMMENT ON POLICY "Products viewable by audience" ON public.products IS
'Enforces B2B visibility rules:
- Fournisseur products: PUBLIC (visible to all)
- Importateur products: B2B-only, visible ONLY to grossistes and admins
- Grossiste products: B2B-only, visible ONLY to fournisseurs and admins
- Sellers can view their own products
Security: Prevents fournisseurs from viewing importateur offers';

-- Add detailed comment to the product images RLS policy
COMMENT ON POLICY "Product images viewable by audience" ON public.product_images IS
'Ensures product images follow the same visibility rules as products.
Prevents image leakage for B2B-restricted products';
