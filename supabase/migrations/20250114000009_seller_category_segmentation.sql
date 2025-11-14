-- Seller category segmentation for Importateur / Grossiste / Fournisseur

-- 1. Seller category enum
CREATE TYPE seller_category AS ENUM ('fournisseur', 'importateur', 'grossiste');

-- 2. Extend user_profiles with seller_category metadata
ALTER TABLE public.user_profiles
  ADD COLUMN seller_category seller_category;

CREATE INDEX idx_user_profiles_seller_category ON public.user_profiles(seller_category);

UPDATE public.user_profiles
SET seller_category = 'fournisseur'
WHERE role = 'seller' AND seller_category IS NULL;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT seller_category_required_for_sellers
  CHECK (role <> 'seller' OR seller_category IS NOT NULL);

COMMENT ON COLUMN public.user_profiles.seller_category IS 'Segmentation for sellers: fournisseur, importateur, grossiste';

-- 3. Track seller category on products for filtering
ALTER TABLE public.products
  ADD COLUMN seller_category seller_category;

CREATE INDEX idx_products_seller_category ON public.products(seller_category);

UPDATE public.products p
SET seller_category = COALESCE(up.seller_category, 'fournisseur')
FROM public.user_profiles up
WHERE p.seller_id = up.id AND p.seller_category IS NULL;

COMMENT ON COLUMN public.products.seller_category IS 'Resolved seller category used for visibility rules';

-- 4. Keep product seller category in sync with profile changes
CREATE OR REPLACE FUNCTION set_product_seller_category()
RETURNS TRIGGER AS $$
DECLARE
  seller_cat seller_category;
BEGIN
  IF NEW.seller_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT up.seller_category INTO seller_cat
  FROM public.user_profiles up
  WHERE up.id = NEW.seller_id;

  IF seller_cat IS NULL THEN
    NEW.seller_category := 'fournisseur';
  ELSE
    NEW.seller_category := seller_cat;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_product_seller_category_before_write ON public.products;

CREATE TRIGGER set_product_seller_category_before_write
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_seller_category();

CREATE OR REPLACE FUNCTION sync_products_seller_category()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET seller_category = NEW.seller_category
  WHERE seller_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_products_seller_category_on_profiles ON public.user_profiles;

CREATE TRIGGER sync_products_seller_category_on_profiles
  AFTER UPDATE OF seller_category ON public.user_profiles
  FOR EACH ROW
  WHEN (OLD.seller_category IS DISTINCT FROM NEW.seller_category)
  EXECUTE FUNCTION sync_products_seller_category();

-- 5. Update RLS policies to enforce visibility logic
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

CREATE POLICY "Products viewable by audience"
  ON public.products
  FOR SELECT
  USING (
    seller_id IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.id = seller_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_profiles seller
      WHERE seller.id = seller_id
        AND (
          seller.seller_category IS NULL
          OR seller.seller_category = 'fournisseur'
          OR EXISTS (
            SELECT 1
            FROM public.user_profiles viewer
            WHERE viewer.id = auth.uid()
              AND (
                viewer.role = 'admin'
                OR (seller.seller_category = 'importateur' AND viewer.seller_category = 'grossiste')
                OR (seller.seller_category = 'grossiste' AND viewer.seller_category = 'fournisseur')
              )
          )
        )
    )
  );

DROP POLICY IF EXISTS "Product images are viewable by everyone" ON public.product_images;

CREATE POLICY "Product images viewable by audience"
  ON public.product_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      LEFT JOIN public.user_profiles seller ON seller.id = p.seller_id
      WHERE p.id = product_id
        AND (
          p.seller_id IS NULL
          OR seller.seller_category IS NULL
          OR seller.seller_category = 'fournisseur'
          OR EXISTS (
            SELECT 1
            FROM public.user_profiles viewer
            WHERE viewer.id = auth.uid()
              AND (
                viewer.role = 'admin'
                OR (seller.seller_category = 'importateur' AND viewer.seller_category = 'grossiste')
                OR (seller.seller_category = 'grossiste' AND viewer.seller_category = 'fournisseur')
              )
          )
        )
    )
  );

COMMENT ON POLICY "Products viewable by audience" ON public.products IS 'Restricts importer/grossiste offers to the proper audience';
COMMENT ON POLICY "Product images viewable by audience" ON public.product_images IS 'Ensures media visibility matches product visibility rules';

