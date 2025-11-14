-- Allow sellers to view their own products/media regardless of category.

BEGIN;

DROP POLICY IF EXISTS "Products viewable by audience" ON public.products;

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
          seller.id = auth.uid()
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

DROP POLICY IF EXISTS "Product images viewable by audience" ON public.product_images;

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
          OR seller.id = auth.uid()
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

COMMIT;

