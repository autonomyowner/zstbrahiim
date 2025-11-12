# Supabase API Reference for ZST

Complete API reference for all Supabase services in the ZST project.

## Table of Contents

1. [Products API](#products-api)
2. [Freelance Services API](#freelance-services-api)
3. [Orders API](#orders-api)
4. [Authentication API](#authentication-api)
5. [Storage API](#storage-api)
6. [Edge Functions](#edge-functions)

---

## Products API

Import from: `src/lib/supabase/products.ts`

### getProducts(filters?)

Get all products with optional filters.

```typescript
import { getProducts } from '@/lib/supabase/products'

// Get all products
const products = await getProducts()

// Get women's perfumes
const womenPerfumes = await getProducts({
  product_category: 'perfume',
  product_type: 'Parfum Femme'
})

// Get products in stock, on promo
const promoProducts = await getProducts({
  in_stock: true,
  is_promo: true
})

// Filter by price range
const affordableProducts = await getProducts({
  min_price: 1000,
  max_price: 10000
})
```

**Parameters:**
- `filters?: ProductFilters` (optional)
  - `category?: string` - Product category
  - `product_type?: ProductType | ProductType[]` - Product type(s)
  - `product_category?: 'perfume' | 'clothing'` - Product category type
  - `need?: ProductNeed | ProductNeed[]` - Product need(s)
  - `in_stock?: boolean` - Stock availability
  - `is_promo?: boolean` - Promo status
  - `min_price?: number` - Minimum price
  - `max_price?: number` - Maximum price
  - `brand?: string | string[]` - Brand name(s)

**Returns:** `Promise<Product[]>` - Array of products in frontend format

---

### getWomenPerfumes()

Get all women's perfumes.

```typescript
const womenPerfumes = await getWomenPerfumes()
```

**Returns:** `Promise<Product[]>`

---

### getMenPerfumes()

Get all men's perfumes.

```typescript
const menPerfumes = await getMenPerfumes()
```

**Returns:** `Promise<Product[]>`

---

### getWinterClothes()

Get all winter clothing products.

```typescript
const winterClothes = await getWinterClothes()
```

**Returns:** `Promise<Product[]>`

---

### getProductById(id)

Get a single product by ID.

```typescript
const product = await getProductById('wf-1')
```

**Parameters:**
- `id: string` - Product ID

**Returns:** `Promise<Product | null>`

**Note:** Automatically increments viewers count

---

### getProductBySlug(slug)

Get a single product by slug.

```typescript
const product = await getProductBySlug('parfum-femme-11800')
```

**Parameters:**
- `slug: string` - Product slug

**Returns:** `Promise<Product | null>`

---

### searchProducts(query, filters?)

Search products by text query.

```typescript
// Search by name/brand/description
const results = await searchProducts('rose')

// Search with filters
const results = await searchProducts('parfum', {
  product_category: 'perfume',
  in_stock: true
})
```

**Parameters:**
- `query: string` - Search query
- `filters?: ProductFilters` (optional) - Additional filters

**Returns:** `Promise<Product[]>`

---

### sortProducts(products, sortBy)

Sort an array of products.

```typescript
import { sortProducts } from '@/lib/supabase/products'

const sorted = sortProducts(products, 'price-asc')
```

**Parameters:**
- `products: Product[]` - Products to sort
- `sortBy: SortOption` - Sort option
  - `'best-sellers'` - By viewers count (desc)
  - `'price-asc'` - By price (ascending)
  - `'price-desc'` - By price (descending)
  - `'newest'` - By creation date (newest first)
  - `'highest-rated'` - By rating (highest first)

**Returns:** `Product[]` - Sorted products

---

### Admin Functions

#### createProduct(productData)

Create a new product (admin only).

```typescript
const productId = await createProduct({
  slug: 'new-perfume',
  name: 'New Perfume',
  brand: 'ZST',
  price: 10000,
  category: 'Santé & Beauté',
  product_type: 'Parfum Femme',
  product_category: 'perfume',
  in_stock: true,
  is_promo: false,
  description: 'A beautiful fragrance...',
  benefits: ['Long lasting', 'Elegant'],
  ingredients: 'Eau de Parfum, Alcools, Fragrance',
  usage_instructions: 'Apply to pulse points',
  delivery_estimate: '2-3 days',
  shipping_info: 'Free shipping over 20000 DA',
  returns_info: '7 days return policy',
  payment_info: 'Cash on delivery',
  images: ['/perfums/image1.jpg', '/perfums/image2.jpg']
})
```

**Returns:** `Promise<string | null>` - Product ID if successful

---

#### updateProduct(updateData)

Update an existing product (admin only).

```typescript
const success = await updateProduct({
  id: 'wf-1',
  price: 12000,
  is_promo: true
})
```

**Returns:** `Promise<boolean>`

---

#### deleteProduct(productId)

Delete a product (admin only).

```typescript
const success = await deleteProduct('wf-1')
```

**Returns:** `Promise<boolean>`

---

## Freelance Services API

Import from: `src/lib/supabase/services.ts`

### getFreelanceServices(filters?)

Get all freelance services with optional filters.

```typescript
import { getFreelanceServices } from '@/lib/supabase/services'

// Get all services
const services = await getFreelanceServices()

// Get services by category
const webDevServices = await getFreelanceServices({
  category: 'Développement Web'
})

// Get available expert services
const expertServices = await getFreelanceServices({
  experience_level: 'Expert',
  availability: 'available'
})

// Get featured services
const featured = await getFreelanceServices({
  featured: true
})
```

**Parameters:**
- `filters?: ServiceFilters` (optional)
  - `category?: ServiceCategory | ServiceCategory[]`
  - `experience_level?: ExperienceLevel | ExperienceLevel[]`
  - `availability?: 'available' | 'busy' | 'unavailable'`
  - `min_price?: number`
  - `max_price?: number`
  - `featured?: boolean`
  - `verified?: boolean`
  - `top_rated?: boolean`

**Returns:** `Promise<FreelanceService[]>`

---

### getFeaturedServices()

Get featured services only.

```typescript
const featuredServices = await getFeaturedServices()
```

**Returns:** `Promise<FreelanceService[]>`

---

### getServicesByCategory(category)

Get services by category.

```typescript
const webDevServices = await getServicesByCategory('Développement Web')
```

**Returns:** `Promise<FreelanceService[]>`

---

### getServiceById(id)

Get a single service by ID.

```typescript
const service = await getServiceById('fs-1')
```

**Returns:** `Promise<FreelanceService | null>`

---

### getServiceBySlug(slug)

Get a single service by slug.

```typescript
const service = await getServiceBySlug('developpement-site-web-professionnel')
```

**Returns:** `Promise<FreelanceService | null>`

---

### searchServices(query, filters?)

Search services by text query.

```typescript
// Search by title/description/skills
const results = await searchServices('web design')

// Search with filters
const results = await searchServices('video', {
  category: 'Montage Vidéo',
  availability: 'available'
})
```

**Returns:** `Promise<FreelanceService[]>`

---

### Seller Functions

#### createService(serviceData)

Create a new freelance service (seller only).

```typescript
const serviceId = await createService({
  slug: 'my-new-service',
  provider_id: 'user-id-here',
  service_title: 'My Amazing Service',
  category: 'Design Graphique',
  experience_level: 'Intermédiaire',
  response_time: '1 hour',
  price: 10000,
  price_type: 'fixed',
  description: 'Detailed description...',
  short_description: 'Short summary...',
  skills: ['Photoshop', 'Illustrator'],
  delivery_time: '3-5 days',
  revisions: '3',
  languages: ['Français', 'Arabe'],
  availability: 'available',
  portfolio: [
    {
      title: 'Project 1',
      description: 'Amazing project',
      image_url: '/portfolio/project1.jpg',
      display_order: 0
    }
  ]
})
```

**Returns:** `Promise<string | null>` - Service ID if successful

---

## Orders API

Import from: `src/lib/supabase/orders.ts`

### getOrders()

Get all orders (user's own orders or all if admin).

```typescript
import { getOrders } from '@/lib/supabase/orders'

const orders = await getOrders()
```

**Returns:** `Promise<Order[]>`

---

### getOrdersByStatus(status)

Get orders by status.

```typescript
const pendingOrders = await getOrdersByStatus('pending')
```

**Parameters:**
- `status: OrderStatus` - 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

**Returns:** `Promise<Order[]>`

---

### getOrderById(id)

Get a single order by ID.

```typescript
const order = await getOrderById('order-uuid')
```

**Returns:** `Promise<Order | null>`

---

### createOrder(orderData)

Create a new order.

```typescript
const orderId = await createOrder({
  customer_name: 'Ahmed Benali',
  customer_email: 'ahmed@example.com',
  customer_phone: '+213 555 123 456',
  customer_address: '12 Rue des Martyrs',
  customer_wilaya: 'Alger',
  items: [
    {
      product_id: 'wf-1',
      quantity: 2
    },
    {
      product_id: 'wf-2',
      quantity: 1
    }
  ]
})
```

**Returns:** `Promise<string | null>` - Order ID if successful

---

### Admin Functions

#### updateOrderStatus(updateData)

Update order status (admin only).

```typescript
const success = await updateOrderStatus({
  order_id: 'order-uuid',
  status: 'shipped',
  tracking_number: 'TRK-ALG-2025-123',
  delivery_date: '2025-01-15',
  notes: 'Package shipped via Yalidine'
})
```

**Returns:** `Promise<boolean>`

---

#### getSellerStats()

Get seller statistics.

```typescript
const stats = await getSellerStats()
// Returns: { totalOrders, pendingOrders, processingOrders, completedOrders, totalRevenue, monthlyRevenue, totalProducts, lowStockProducts }
```

**Returns:** `Promise<SellerStats>`

---

## Authentication API

Import from: `src/lib/supabase/auth.ts`

### signUp(email, password, fullName, phone?, role?)

Create a new user account.

```typescript
import { signUp } from '@/lib/supabase/auth'

const { user, error } = await signUp(
  'user@example.com',
  'password123',
  'Ahmed Benali',
  '+213 555 123 456',
  'customer' // optional, defaults to 'customer'
)
```

**Returns:** `Promise<{ user: User | null, error: Error | null }>`

---

### signIn(email, password)

Sign in with email and password.

```typescript
const { user, error } = await signIn('user@example.com', 'password123')
```

**Returns:** `Promise<{ user: User | null, error: Error | null }>`

---

### signOut()

Sign out the current user.

```typescript
const { error } = await signOut()
```

**Returns:** `Promise<{ error: Error | null }>`

---

### getCurrentUser()

Get the currently authenticated user.

```typescript
const user = await getCurrentUser()
```

**Returns:** `Promise<User | null>`

---

### getCurrentUserProfile()

Get the current user's profile.

```typescript
const profile = await getCurrentUserProfile()
// Returns: { id, email, full_name, phone, role, provider_name, ... }
```

**Returns:** `Promise<UserProfile | null>`

---

### updateUserProfile(updates)

Update the current user's profile.

```typescript
const success = await updateUserProfile({
  full_name: 'New Name',
  phone: '+213 555 999 888',
  provider_name: 'My Business',
  bio: 'Professional web developer'
})
```

**Returns:** `Promise<boolean>`

---

### isAuthenticated()

Check if user is authenticated.

```typescript
const authenticated = await isAuthenticated()
```

**Returns:** `Promise<boolean>`

---

### isAdmin()

Check if current user is admin.

```typescript
const isUserAdmin = await isAdmin()
```

**Returns:** `Promise<boolean>`

---

### isSeller()

Check if current user is seller or admin.

```typescript
const isUserSeller = await isSeller()
```

**Returns:** `Promise<boolean>`

---

## Storage API

Import from: `src/lib/supabase/client.ts`

### uploadFile(bucket, path, file)

Upload a file to storage.

```typescript
import { uploadFile } from '@/lib/supabase/client'

const file = event.target.files[0]
const publicUrl = await uploadFile('products', 'perfums/new-image.jpg', file)
```

**Returns:** `Promise<string>` - Public URL of uploaded file

---

### getStoragePublicUrl(bucket, path)

Get public URL for a storage object.

```typescript
import { getStoragePublicUrl } from '@/lib/supabase/client'

const url = getStoragePublicUrl('products', 'perfums/image.jpg')
```

**Returns:** `string` - Public URL

---

### deleteFile(bucket, path)

Delete a file from storage.

```typescript
import { deleteFile } from '@/lib/supabase/client'

await deleteFile('products', 'perfums/old-image.jpg')
```

**Returns:** `Promise<void>`

---

## Edge Functions

### create-order

Create an order with transaction safety.

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_name: 'Ahmed Benali',
    customer_email: 'ahmed@example.com',
    customer_phone: '+213 555 123 456',
    customer_address: '12 Rue des Martyrs',
    customer_wilaya: 'Alger',
    items: [
      { product_id: 'wf-1', quantity: 2 }
    ]
  })
})

const data = await response.json()
// Returns: { success: true, order_id, order_number, total }
```

---

### update-order-status

Update order status with notifications.

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/update-order-status`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseServiceKey}`, // Admin only
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    order_id: 'order-uuid',
    status: 'shipped',
    tracking_number: 'TRK-ALG-2025-123',
    delivery_date: '2025-01-15'
  })
})
```

---

### export-data

Export orders or products to TXT format.

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/export-data`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseServiceKey}`, // Admin only
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'orders' // or 'products'
  })
})

const txtData = await response.text()
// Download as file
const blob = new Blob([txtData], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
```

---

## Type Definitions

All TypeScript types are available in `src/lib/supabase/types.ts`.

Import them as needed:

```typescript
import type {
  Product,
  FreelanceService,
  Order,
  UserProfile,
  ProductFilters,
  ServiceFilters,
  // ... and more
} from '@/lib/supabase/types'
```

---

**Last Updated**: January 12, 2025
