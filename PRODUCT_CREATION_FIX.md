# ✅ Product Creation RLS Fix Applied

## 🐛 The Problem

When users tried to create products in the seller portal (`/services`), they received the error:

```
Error creating product: {
  code: '42501',
  message: 'new row violates row-level security policy for table "products"'
}
```

### Root Cause

The Row-Level Security (RLS) policies on the `products` and `product_images` tables only allowed users with the `admin` role to create, update, and delete products. Users with the `seller` role were blocked.

---

## ✅ The Fix

### What Was Done:

1. **Updated RLS policies for `products` table**:
   - Changed INSERT policy to allow `seller` OR `admin` roles
   - Changed UPDATE policy to allow `seller` OR `admin` roles
   - Changed DELETE policy to allow `seller` OR `admin` roles

2. **Updated RLS policies for `product_images` table**:
   - Changed INSERT policy to allow `seller` OR `admin` roles
   - Changed UPDATE policy to allow `seller` OR `admin` roles
   - Changed DELETE policy to allow `seller` OR `admin` roles

3. **Applied migration to Supabase database**:
   - Migration name: `update_product_rls_for_sellers`
   - Successfully deployed to production

---

## 🧪 How to Test

### Prerequisites:
Your user account must have the `seller` or `admin` role. Check your role:

```sql
SELECT id, email, full_name, role 
FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

### If your role is `customer`, update it to `seller`:

**Option 1: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/enbrhhuubjvapadqyvds
2. Navigate to: **Table Editor** → **user_profiles**
3. Find your user by email
4. Click on the `role` field and change it to `seller`
5. Save changes

**Option 2: Using SQL**
Run this query in the SQL Editor:

```sql
UPDATE public.user_profiles 
SET role = 'seller' 
WHERE email = 'your-email@example.com';
```

### Test Product Creation:

1. **Log in** to your account on www.zsst.xyz
2. Navigate to: **www.zsst.xyz/services** (Seller Portal)
3. Click **"Ajouter un produit"** (Add Product)
4. Fill in the product details:
   - Name
   - Brand
   - Price
   - Category
   - Description
   - etc.
5. Click **Submit**

### Expected Result:

✅ **Product created successfully!**  
✅ Product appears in your products list  
✅ No RLS policy errors in console  
✅ Product is visible on the main catalog  

---

## 🔐 Updated Security Policies

### Products Table Policies:

| Policy Name | Operation | Who Can Access |
|------------|-----------|----------------|
| Products are viewable by everyone | SELECT | Everyone (public) |
| **Sellers and admins can insert products** | INSERT | `seller` OR `admin` |
| **Sellers and admins can update products** | UPDATE | `seller` OR `admin` |
| **Sellers and admins can delete products** | DELETE | `seller` OR `admin` |

### Product Images Table Policies:

| Policy Name | Operation | Who Can Access |
|------------|-----------|----------------|
| Product images are viewable by everyone | SELECT | Everyone (public) |
| **Sellers and admins can insert product images** | INSERT | `seller` OR `admin` |
| **Sellers and admins can update product images** | UPDATE | `seller` OR `admin` |
| **Sellers and admins can delete product images** | DELETE | `seller` OR `admin` |

---

## 📝 User Roles Explained

Your database has three user roles:

1. **`customer`** (default)
   - Can browse products
   - Can place orders
   - Cannot create products

2. **`seller`**
   - Everything a customer can do
   - Can create, edit, and delete products
   - Can manage their product listings
   - Can access seller portal

3. **`admin`**
   - Full access to everything
   - Can manage all products (not just their own)
   - Can manage orders
   - Can modify user roles

---

## 🚀 Next Steps

1. **Ensure your user has the `seller` role** (see instructions above)
2. **Log out and log back in** to refresh your session
3. **Try creating a product** in the seller portal
4. If you still get errors, check the browser console for details

---

## 🔍 Verification

To verify the policies are correctly applied, run this in SQL Editor:

```sql
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename IN ('products', 'product_images')
ORDER BY tablename, policyname;
```

You should see policies named "Sellers and admins can..." for INSERT, UPDATE, and DELETE operations.

---

## 📞 Troubleshooting

### Issue: Still getting RLS error after fix

**Solution**: 
1. Clear your browser cache
2. Log out and log back in
3. Verify your role is `seller` or `admin`
4. Check that you're logged in (not browsing anonymously)

### Issue: "User not found" or "No user profile"

**Solution**: 
Your user profile may not exist. Check:
```sql
SELECT * FROM public.user_profiles WHERE id = auth.uid();
```

### Issue: Products created but not visible

**Solution**: 
Check if the `in_stock` flag is set to `true` and the product has images.

---

**Last Updated**: November 12, 2025  
**Migration**: `update_product_rls_for_sellers`  
**Project**: ZST (enbrhhuubjvapadqyvds)  
**Status**: ✅ FIXED

