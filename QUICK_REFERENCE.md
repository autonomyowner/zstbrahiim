# Seller Isolation - Quick Reference Card

## 🎯 One-Sentence Summary
Each seller can only see, edit, and delete their own products with fresh dashboard statistics.

## 📊 Dashboard Stats Query

```typescript
// Get current seller's dashboard statistics
const { data: stats } = await supabase
  .from('seller_dashboard_stats')
  .select('*')
  .single()

// Returns:
// {
//   seller_id: 'uuid',
//   total_products: 10,
//   out_of_stock_products: 2,
//   perfume_count: 7,
//   clothing_count: 3,
//   total_orders: 25,
//   pending_orders: 5,
//   processing_orders: 10,
//   completed_orders: 8,
//   cancelled_orders: 2,
//   total_revenue: 5000,
//   monthly_revenue: 1200,
//   weekly_revenue: 300,
//   avg_order_value: 200
// }
```

## 🛍️ Product Operations

### List Seller's Products
```typescript
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    product_images(*)
  `)
  .order('created_at', { ascending: false })
// Auto-filtered to seller's products only
```

### Create Product
```typescript
const { data: product } = await supabase
  .from('products')
  .insert({
    name: 'Product Name',
    price: 100,
    category: 'perfume',
    // seller_id auto-set by trigger
  })
  .select()
  .single()
```

### Update Product
```typescript
const { data: product } = await supabase
  .from('products')
  .update({ price: 150 })
  .eq('id', productId)
  .select()
  .single()
// Only works if seller owns this product
```

### Delete Product
```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)
// Only works if seller owns this product
```

## 📦 Order Operations

### List Seller's Orders
```typescript
const { data: orders } = await supabase
  .from('orders')
  .select(`
    *,
    order_items(*)
  `)
  .order('created_at', { ascending: false })
// Auto-filtered to seller's orders only
```

### Update Order Status
```typescript
const { data: order } = await supabase
  .from('orders')
  .update({ status: 'processing' })
  .eq('id', orderId)
  .select()
  .single()
// Only works if order is for seller's product
```

## 🖼️ Product Images

### Add Image to Product
```typescript
const { data: image } = await supabase
  .from('product_images')
  .insert({
    product_id: productId,
    image_url: 'https://...',
    is_primary: true
  })
  .select()
  .single()
// Only works if seller owns the product
```

## 🔐 Security Rules

| Operation | Public | Seller | Admin |
|-----------|--------|--------|-------|
| **View Products** | ✅ All | ✅ All | ✅ All |
| **Create Product** | ❌ | ✅ Own | ✅ Any |
| **Edit Product** | ❌ | ✅ Own | ✅ Any |
| **Delete Product** | ❌ | ✅ Own | ✅ Any |
| **View Orders** | ❌ | ✅ Own | ✅ All |
| **Edit Orders** | ❌ | ✅ Own | ✅ All |

## 🎨 Dashboard Component Example

```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function SellerDashboard() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // Get dashboard stats
      const { data: statsData } = await supabase
        .from('seller_dashboard_stats')
        .select('*')
        .single()
      
      // Get seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*)
        `)
        .order('created_at', { ascending: false })
      
      setStats(statsData)
      setProducts(productsData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="dashboard">
      <h1>My Store Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total_products}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{stats.total_orders}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.monthly_revenue} DA</h3>
          <p>Monthly Revenue</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending_orders}</h3>
          <p>Pending Orders</p>
        </div>
      </div>

      {/* Products List */}
      <div className="products-section">
        <h2>My Products ({products.length})</h2>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              onEdit={(id) => handleEdit(id)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

## 🚨 Common Issues

### "I can't see my products"
- ✅ Check: User is authenticated?
- ✅ Check: User role is 'seller'?
- ✅ Check: Products have seller_id set?

### "Permission denied"
- ✅ User is trying to access another seller's data
- ✅ This is expected behavior (security working correctly)

### "seller_id is null"
- ✅ Trigger should auto-set this
- ✅ Check: User is authenticated when creating product
- ✅ Verify trigger is enabled: `auto_set_seller_id`

## 📁 Files Created

1. `SELLER_ISOLATION_GUIDE.md` - Complete implementation guide
2. `IMPLEMENTATION_SUMMARY.md` - What was done and why
3. `QUICK_REFERENCE.md` - This file (quick lookup)

## 🔗 Database Objects

| Type | Name | Purpose |
|------|------|---------|
| View | `seller_dashboard_stats` | Seller-specific statistics |
| Function | `set_seller_id_on_product()` | Auto-assign seller_id |
| Trigger | `auto_set_seller_id` | Run on product INSERT |
| Policies | `Sellers can * their own products` | RLS enforcement |

## ⚡ Key Points

1. **No manual seller_id needed** - Auto-set by trigger
2. **Queries are auto-filtered** - RLS handles it
3. **Fresh dashboard per seller** - Independent stats
4. **Database-level security** - Can't be bypassed
5. **Admin has full access** - For management

## 📞 Need Help?

See the full guide: [SELLER_ISOLATION_GUIDE.md](./SELLER_ISOLATION_GUIDE.md)

---

**Last Updated**: November 14, 2025

