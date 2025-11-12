# 🔧 Order System Troubleshooting & Fix

## Issue: "Aucune commande trouvée" in Seller Dashboard

### Root Cause
Orders were being created but `seller_id` was null, so sellers couldn't see them.

### Why It Happened
1. Old products (created before the update) don't have `seller_id`
2. Orders for those products got `seller_id = null`
3. Seller dashboard filters by `seller_id = current_user_id`
4. Orders with null seller_id didn't match

## ✅ Fixes Applied

### 1. Updated Order Creation Function
**File**: `src/lib/supabase/orders.ts`

**Change**: Now fetches `seller_id` directly from the product when creating order:

```typescript
// Fetch product details including seller_id
const { data: product } = await supabase
  .from('products')
  .select('name, price, seller_id, product_images (image_url)')
  .eq('id', orderData.product_id)
  .single()

// Use seller_id from product
const actualSellerId = product.seller_id || orderData.seller_id
```

### 2. Fixed Existing Orders
Ran SQL to update orders that had null seller_id:

```sql
UPDATE public.orders o
SET seller_id = p.seller_id
FROM public.order_items oi
JOIN public.products p ON oi.product_id = p.id
WHERE o.id = oi.order_id
AND o.seller_id IS NULL
AND p.seller_id IS NOT NULL;
```

### 3. Made customer_email Nullable
Orders no longer require customer email (since we collect phone instead):

```sql
ALTER TABLE public.orders 
ALTER COLUMN customer_email DROP NOT NULL;
```

## 🎯 Current Status

### Working Orders:
- ✅ **ORD-2025-002**: Has seller_id `820789a7-49be-4239-a598-e478d9cdb273` → **VISIBLE in dashboard**
- ❌ **ORD-2025-001**: Product has no seller_id → **Not visible** (this is expected)

### Why Some Orders Don't Show:

**Old products** created before the `seller_id` update don't have an owner. These are:
- Static seeded products from migrations
- Products created before November 12, 2025 updates

**New products** created through the seller portal will have `seller_id` automatically.

## 🔄 How It Works Now

### For New Products:
1. Seller creates product → `seller_id` saved automatically
2. Customer orders product → Order gets `seller_id` from product
3. Order appears in seller's dashboard ✅

### For Old Products Without seller_id:
1. Product has `seller_id = null`
2. Orders for this product get `seller_id = null`
3. Orders don't appear in any seller's dashboard (orphaned)

## 🛠️ How to Fix Old Products

If you want old products to show orders in seller dashboards:

### Option 1: Assign seller_id to existing products
```sql
-- Assign all products without seller_id to a specific seller
UPDATE public.products
SET seller_id = '820789a7-49be-4239-a598-e478d9cdb273'  -- Your seller ID
WHERE seller_id IS NULL;

-- Then update their orders
UPDATE public.orders o
SET seller_id = p.seller_id
FROM public.order_items oi
JOIN public.products p ON oi.product_id = p.id
WHERE o.id = oi.order_id
AND o.seller_id IS NULL;
```

### Option 2: Leave them as-is
Old seeded products remain without seller, new products work perfectly.

## ✅ Verification

### Check if orders are visible:

**Step 1**: Get your seller ID
```sql
SELECT id, email, role 
FROM public.user_profiles 
WHERE email = 'autonomy.owner@gmail.com';
```

**Step 2**: Check your products
```sql
SELECT id, name, seller_id 
FROM public.products 
WHERE seller_id = 'your-seller-id';
```

**Step 3**: Check your orders
```sql
SELECT id, order_number, customer_name, total, status 
FROM public.orders 
WHERE seller_id = 'your-seller-id';
```

### Test New Order Flow:

1. **As Seller**: Create a new product with image upload
2. **As Customer**: Buy that product
3. **As Seller**: Check dashboard → Order should appear! ✅

## 📊 Current Database State

### Orders Created:
- **ORD-2025-001**: Product has no seller → Not visible
- **ORD-2025-002**: Product owned by `820789a7...` → ✅ **Visible to that seller**

### Products:
- **whey**: Has seller_id `820789a7...` → Orders will work ✅
- **mockapp images**: No seller_id → Orders won't show in dashboard ❌

## 🎯 Solution Summary

**For immediate fix**:
Refresh your seller dashboard - you should now see **ORD-2025-002** (the order for "whey" product).

**For future**:
All new products and orders will work perfectly with the seller dashboard!

**To assign old products**:
Run the SQL in Option 1 above to assign all orphaned products to your seller account.

---

**Fixed**: November 12, 2025  
**Status**: ✅ RESOLVED  
**Next Action**: Refresh seller dashboard to see order!

