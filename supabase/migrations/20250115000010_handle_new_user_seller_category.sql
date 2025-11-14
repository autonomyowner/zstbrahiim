-- Ensure handle_new_user trigger populates seller_category metadata
-- and backfill any existing seller accounts missing the field.

BEGIN;

-- Recreate the handle_new_user trigger function with seller_category support.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value public.user_role;
  seller_category_value public.seller_category;
BEGIN
  user_role_value := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    'customer'::public.user_role
  );

  IF user_role_value = 'seller' THEN
    seller_category_value := COALESCE(
      (NEW.raw_user_meta_data->>'seller_category')::public.seller_category,
      'fournisseur'::public.seller_category
    );
  ELSE
    seller_category_value := NULL;
  END IF;

  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    phone,
    role,
    seller_category,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    user_role_value,
    seller_category_value,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    seller_category = COALESCE(EXCLUDED.seller_category, public.user_profiles.seller_category),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill seller profiles missing due to earlier trigger issues.
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  phone,
  role,
  seller_category,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  'seller'::public.user_role,
  COALESCE(
    (u.raw_user_meta_data->>'seller_category')::public.seller_category,
    'fournisseur'::public.seller_category
  ),
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.id = u.id
WHERE up.id IS NULL
  AND COALESCE(
    (u.raw_user_meta_data->>'role')::public.user_role,
    'customer'::public.user_role
  ) = 'seller'::public.user_role;

-- Ensure existing seller profiles have a seller_category to satisfy constraint.
WITH metadata AS (
  SELECT
    u.id,
    COALESCE(
      (u.raw_user_meta_data->>'seller_category')::public.seller_category,
      'fournisseur'::public.seller_category
    ) AS seller_category
  FROM auth.users u
)
UPDATE public.user_profiles up
SET
  seller_category = COALESCE(metadata.seller_category, 'fournisseur'::public.seller_category),
  updated_at = NOW()
FROM metadata
WHERE up.id = metadata.id
  AND up.role = 'seller'
  AND up.seller_category IS NULL;

COMMIT;

