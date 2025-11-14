# Seller Data Isolation Guide

## Overview

Your Supabase database now implements **seller-specific data isolation**. Each authenticated seller can only view, edit, and delete their own products and see their own dashboard statistics. Every new seller starts with a fresh dashboard that calculates metrics from zero.

## What's Been Implemented

### 1. **Row Level Security (RLS) Policies**

#### Products Table
- ✅ **SELECT**: Everyone can view products (public catalog)
- ✅ **INSERT**: Sellers can only insert products with their own `seller_id`
- ✅ **UPDATE**: Sellers can only update their own products
- ✅ **DELETE**: Sellers can only delete their own products
- ✅ **Admin Override**: Admins can manage all products

#### Product Images Table
- ✅ **SELECT**: Everyone can view product images
- ✅ **INSERT/UPDATE/DELETE**: Sellers can only manage images for their own products

#### Orders Table
- ✅ Sellers can only view and update orders related to their products
- ✅ Each order is automatically linked to the seller via `seller_id`

### 2. **Automatic seller_id Assignment**

A trigger automatically sets the `seller_id` when a seller creates a product:

```sql
-- Trigger: auto_set_seller_id
-- Function: set_seller_id_on_product()
```

This means sellers don't need to manually specify their ID when creating products.

### 3. **Seller Dashboard Stats View**

A dedicated view `seller_dashboard_stats` provides real-time statistics for each seller:

```sql
SELECT * FROM seller_dashboard_stats;
```

**Returns (for the authenticated seller only):**
- `seller_id` - The authenticated seller's ID
- `total_products` - Total number of products they've added
- `out_of_stock_products` - Count of out-of-stock products
- `perfume_count` - Count of perfume products
- `clothing_count` - Count of clothing products
- `total_orders` - Total orders for their products
- `pending_orders` - Orders with status 'pending'
- `processing_orders` - Orders with status 'processing'
- `completed_orders` - Orders with status 'delivered'
- `cancelled_orders` - Orders with status 'cancelled'
- `total_revenue` - Total revenue from delivered orders
- `monthly_revenue` - Revenue for the current month
- `weekly_revenue` - Revenue for the last 7 days
- `avg_order_value` - Average order value for delivered orders

## How to Use in Your Application

### Frontend Implementation (React/Next.js Example)

#### 1. Create a Product (Seller Dashboard)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      price: productData.price,
      category: productData.category,
      // seller_id is automatically set by the trigger
      // No need to specify it!
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating product:', error)
    return null
  }
  
  return data
}
```

#### 2. Fetch Seller's Products Only

```typescript
async function getMyProducts() {
  // This query automatically filters to show only the authenticated seller's products
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data // Only returns products where seller_id = auth.uid()
}
```

**Important**: Due to RLS policies, the query above will automatically filter to show only products belonging to the authenticated seller. No additional WHERE clause needed!

#### 3. Update a Product

```typescript
async function updateProduct(productId, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single()
  
  // This will only succeed if the product belongs to the authenticated seller
  if (error) {
    console.error('Error updating product:', error)
    return null
  }
  
  return data
}
```

#### 4. Delete a Product

```typescript
async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
  
  // This will only succeed if the product belongs to the authenticated seller
  if (error) {
    console.error('Error deleting product:', error)
    return false
  }
  
  return true
}
```

#### 5. Get Dashboard Statistics

```typescript
async function getDashboardStats() {
  const { data, error } = await supabase
    .from('seller_dashboard_stats')
    .select('*')
    .single()
  
  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
  
  return data
}

// Example usage in a React component
function SellerDashboard() {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats()
      setStats(data)
    }
    
    loadStats()
  }, [])
  
  if (!stats) return <div>Loading...</div>
  
  return (
    <div className="dashboard">
      <h1>My Dashboard</h1>
      <div className="stats-grid">
        <StatCard title="Total Products" value={stats.total_products} />
        <StatCard title="Total Orders" value={stats.total_orders} />
        <StatCard title="Monthly Revenue" value={`${stats.monthly_revenue} DA`} />
        <StatCard title="Pending Orders" value={stats.pending_orders} />
      </div>
    </div>
  )
}
```

## Security Features

### 🔒 Automatic Protection

1. **No seller can see another seller's products** in their dashboard queries
2. **No seller can edit another seller's products** even if they know the product ID
3. **No seller can delete another seller's products**
4. **Dashboard statistics are calculated independently** for each seller
5. **Admin users have full access** to all data for management purposes

### 🛡️ RLS Enforcement

All security is enforced at the **database level** using Row Level Security policies. This means:

- ✅ Security works even if frontend code has bugs
- ✅ Direct database access is protected
- ✅ API requests are automatically filtered
- ✅ No way to bypass the security (except as admin)

## Testing the Implementation

### Test as Seller A

```typescript
// Login as Seller A
await supabase.auth.signInWithPassword({
  email: 'seller-a@example.com',
  password: 'password'
})

// Create a product
const product = await createProduct({
  name: 'Product A',
  price: 100
})

// View products - should only see Seller A's products
const products = await getMyProducts()
console.log(products) // Only shows products created by Seller A
```

### Test as Seller B

```typescript
// Login as Seller B
await supabase.auth.signInWithPassword({
  email: 'seller-b@example.com',
  password: 'password'
})

// View products - should only see Seller B's products
const products = await getMyProducts()
console.log(products) // Only shows products created by Seller B

// Try to update Seller A's product (should fail)
const result = await updateProduct(productA.id, { price: 200 })
console.log(result) // null - not allowed
```

## Database Schema Reference

### Products Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `seller_id` | uuid | Foreign key to auth.users (auto-set via trigger) |
| `name` | text | Product name |
| `price` | numeric | Product price |
| ... | ... | Other product fields |

### Orders Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `seller_id` | uuid | Foreign key to auth.users (seller who owns the product) |
| `user_id` | uuid | Customer who placed the order |
| `total` | numeric | Order total amount |
| `status` | order_status | Order status (pending, processing, delivered, etc.) |

## Troubleshooting

### Issue: Products don't appear in seller's dashboard

**Solution**: Ensure the user is authenticated and has the 'seller' role:

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  console.error('User not authenticated')
  return
}

// Check user profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', user.id)
  .single()

console.log('User role:', profile.role) // Should be 'seller'
```

### Issue: "seller_id cannot be null" error

**Solution**: This shouldn't happen due to the trigger, but if it does, ensure:

1. The user is authenticated
2. The trigger `auto_set_seller_id` is enabled
3. The user has a valid role in `user_profiles`

### Issue: Admin can't see all products

**Solution**: Ensure the admin user has role='admin' in the `user_profiles` table:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'admin-user-id';
```

## Migration History

The following migrations have been applied:

1. ✅ `implement_seller_specific_isolation` - Core RLS policies for seller isolation
2. ✅ `fix_security_warnings_for_seller_isolation` - Security improvements
3. ✅ `assign_orphaned_products_to_valid_sellers` - Migrate existing data
4. ✅ `fix_view_security_invoker` - Secure dashboard stats view

## Best Practices

1. **Always authenticate users** before allowing product management
2. **Don't try to bypass RLS** - trust the database policies
3. **Use the dashboard stats view** instead of calculating metrics in the frontend
4. **Let the trigger handle seller_id** - don't manually set it
5. **Test with multiple seller accounts** to verify isolation works

## Product Video Enhancements

- Each product can include one optional demo video (max **30s** and **10 MB**).
- Videos are stored in the `product-videos` and `product-thumbnails` storage buckets with metadata persisted in the `product_videos` table (single row per product).
- The upload flow auto-generates a JPEG thumbnail from the first frame so product grids remain image-first for fast loading.
- The seller dashboard automatically enforces:
  - Client-side validation (size + duration) before upload.
  - Automatic thumbnail extraction via Canvas/Video API.
  - Upload to Supabase Storage, followed by an upsert into `product_videos`.
  - Secure cleanup when videos are replaced or deleted.
- Product lists/grids still use image thumbnails (or fall back to the generated video thumbnail).
- Product detail pages lazy-load the video using the HTML5 `<video>` element with native controls and poster support.

### Upload helper (client-side)

```typescript
import { upsertProductVideo } from '@/lib/supabase/productVideos'

await upsertProductVideo({
  productId,
  file: selectedVideo.file,
  durationSeconds: selectedVideo.durationSeconds,
  thumbnailBlob: selectedVideo.thumbnailBlob,
})
```

The helper automatically uploads both assets, stores metadata, and cleans up older files if a seller re-uploads their clip.

## Support

For issues or questions:
- Check the Supabase dashboard for RLS policy details
- Review the database logs for error messages
- Ensure your user authentication is working correctly
- Verify the user has the correct role ('seller' or 'admin')

---

**Last Updated**: November 2025  
**Database Version**: PostgreSQL 15+ with Supabase

