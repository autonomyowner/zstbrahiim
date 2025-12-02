# ZST Backend Documentation

Complete technical documentation for the ZST Supabase backend infrastructure.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Database Configuration](#database-configuration)
3. [Authentication & Security](#authentication--security)
4. [Database Schema](#database-schema)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Storage Buckets](#storage-buckets)
7. [Database Migrations](#database-migrations)
8. [API Keys & Configuration](#api-keys--configuration)
9. [Performance & Indexes](#performance--indexes)
10. [Real-time Subscriptions](#real-time-subscriptions)

---

## Project Overview

### Supabase Project Details

- **Project Name**: zst
- **Project ID**: enbrhhuubjvapadqyvds
- **Region**: eu-west-3 (Europe - Paris)
- **Status**: ACTIVE_HEALTHY
- **Database Version**: PostgreSQL 17.6.1.043
- **Created**: November 12, 2025
- **API URL**: https://enbrhhuubjvapadqyvds.supabase.co

### Installed Extensions

The following PostgreSQL extensions are installed and active:

- **pgcrypto** (v1.3) - Cryptographic functions
- **uuid-ossp** (v1.1) - UUID generation
- **pg_stat_statements** (v1.11) - SQL statistics tracking
- **supabase_vault** (v0.3.1) - Secure secrets management
- **pg_graphql** (v1.5.11) - GraphQL support
- **plpgsql** (v1.0) - PL/pgSQL procedural language

---

## Database Configuration

### Connection Details

```
Host: db.enbrhhuubjvapadqyvds.supabase.co
Database: postgres
Port: 5432
SSL: Required
```

### Schemas

- **public** - Application tables (45 tables)
- **auth** - Supabase authentication (23 tables)
- **storage** - File storage management (8 tables)

---

## Authentication & Security

### Authentication System

Supabase Auth handles all user authentication with the following features:

- Email/password authentication
- PKCE flow for secure authentication
- Session management with refresh tokens
- Multi-factor authentication (MFA) support
- SSO/SAML support (configured but not active)

### User Roles

The platform implements a multi-role system via the `user_profiles` table:

```typescript
enum user_role {
  'customer'    // Default role for shoppers
  'seller'      // Product sellers with category segmentation
  'freelancer'  // Service providers
  'admin'       // Full platform access
}
```

### Seller Categories

Sellers are further segmented by business type:

```typescript
enum seller_category {
  'fournisseur'   // Retailers (visible on main marketplace)
  'importateur'   // Importers (B2B only)
  'grossiste'     // Wholesalers (B2B only)
}
```

This segmentation controls product visibility:
- **fournisseur**: Products visible on homepage
- **importateur/grossiste**: Products visible only on B2B pages

---

## Database Schema

### Core Tables

#### 1. user_profiles (45 rows)

User account information and role management.

**Key Columns:**
- `id` (uuid) - Primary key, references auth.users
- `email` (text) - User email
- `full_name` (text) - Display name
- `phone` (text) - Contact number
- `role` (user_role) - User role (default: customer)
- `seller_category` (seller_category) - For seller segmentation
- `provider_name` (text) - Business name for sellers
- `provider_avatar` (text) - Profile image URL
- `bio` (text) - User/seller description
- `is_demo_user` (boolean) - Demo account flag
- `created_at`, `updated_at` (timestamptz)

**Foreign Keys:**
- Referenced by: products, orders, b2b_offers, freelance_services, wishlist, cart_items

---

#### 2. products (18 rows)

Product catalog with multi-category support.

**Key Columns:**
- `id` (uuid) - Primary key
- `slug` (text, unique) - URL-friendly identifier
- `name` (text) - Product name
- `brand` (text) - Brand name
- `price` (numeric) - Current price
- `original_price` (numeric) - Original price (for discounts)
- `category` (text) - Flexible category field
- `product_type` (text) - Product type (e.g., "Parfum Femme")
- `product_category` (product_category_type) - perfume | clothing
- `seller_id` (uuid) - References auth.users
- `seller_category` (seller_category) - Cached from user_profiles
- `min_quantity` (integer) - Minimum order quantity (default: 1)
- `in_stock` (boolean) - Availability status
- `is_promo` (boolean) - Promotional item flag
- `is_new` (boolean) - New arrival flag
- `rating` (numeric) - Product rating (0-5)
- `viewers_count` (integer) - View count
- `countdown_end_date` (timestamptz) - For limited offers
- `description`, `benefits`, `ingredients`, `usage_instructions` (text)
- `delivery_estimate`, `shipping_info`, `returns_info`, `payment_info` (text)
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `price >= 0`
- `rating >= 0 AND rating <= 5`
- `min_quantity >= 1`

**Foreign Keys:**
- `seller_id` → auth.users.id

---

#### 3. product_images (18 rows)

Multiple images per product support.

**Key Columns:**
- `id` (uuid) - Primary key
- `product_id` (uuid) - References products
- `image_url` (text) - Storage URL
- `is_primary` (boolean) - Primary display image
- `display_order` (integer) - Sort order
- `created_at` (timestamptz)

---

#### 4. product_videos (1 row)

Optional product demo videos.

**Key Columns:**
- `id` (uuid) - Primary key
- `product_id` (uuid) - References products (one video per product)
- `video_url` (text) - Public video URL
- `thumbnail_url` (text) - Video thumbnail
- `video_storage_path` (text) - Internal storage path
- `thumbnail_storage_path` (text) - Thumbnail storage path
- `duration_seconds` (integer) - Video length (max: 30 seconds)
- `file_size_bytes` (integer) - File size (max: 10MB)
- `created_at` (timestamptz)

**Constraints:**
- `duration_seconds > 0 AND duration_seconds <= 30`
- `file_size_bytes > 0 AND file_size_bytes <= 10485760` (10MB)

---

#### 5. orders (47 rows)

Customer order management with guest checkout support.

**Key Columns:**
- `id` (uuid) - Primary key
- `order_number` (text, unique) - Auto-generated via sequence
- `user_id` (uuid, nullable) - References user_profiles (null for guests)
- `seller_id` (uuid, nullable) - References auth.users
- `customer_name` (text) - Shipping name
- `customer_email` (text, nullable) - Contact email
- `customer_phone` (text) - Contact phone
- `customer_address` (text) - Delivery address
- `customer_wilaya` (text) - Algerian province
- `total` (numeric) - Order total
- `status` (order_status) - pending | processing | shipped | delivered | cancelled
- `payment_status` (payment_status) - pending | paid | failed | refunded
- `delivery_date` (timestamptz) - Expected/actual delivery
- `tracking_number` (text, nullable) - Shipment tracking
- `notes` (text, nullable) - Order notes
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `total >= 0`

**Real-time**: Enabled for seller order tracking

---

#### 6. order_items (47 rows)

Line items for orders.

**Key Columns:**
- `id` (uuid) - Primary key
- `order_id` (uuid) - References orders
- `product_id` (uuid, nullable) - References products
- `product_name` (text) - Cached product name
- `product_image` (text) - Cached image URL
- `quantity` (integer) - Order quantity
- `price` (numeric) - Price at time of order
- `subtotal` (numeric) - Line total
- `created_at` (timestamptz)

**Constraints:**
- `quantity > 0`
- `price >= 0`
- `subtotal >= 0`

---

#### 7. cart_items (4 rows)

Shopping cart management.

**Key Columns:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `product_id` (text) - Product ID (UUID or string for static products)
- `product_name` (text) - Cached display name
- `product_image` (text, nullable) - Cached image
- `product_price` (numeric) - Cached price
- `quantity` (integer) - Cart quantity (default: 1)
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `quantity > 0`

---

#### 8. wishlist (2 rows)

User wishlist/favorites.

**Key Columns:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `product_id` (uuid) - References products
- `created_at` (timestamptz)

---

#### 9. freelance_services (11 rows)

Freelancer service listings.

**Key Columns:**
- `id` (uuid) - Primary key
- `slug` (text, unique) - URL identifier
- `provider_id` (uuid) - References user_profiles
- `service_title` (text) - Service name
- `category` (service_category) - Service category
- `experience_level` (experience_level) - Débutant | Intermédiaire | Expert
- `rating` (numeric) - Service rating (0-5, default: 0)
- `reviews_count` (integer) - Number of reviews
- `completed_projects` (integer) - Project count
- `response_time` (text) - Response time estimate
- `price` (numeric) - Service price
- `price_type` (price_type) - fixed | hourly | starting-at
- `description`, `short_description` (text)
- `skills` (text[]) - Array of skills
- `delivery_time` (text) - Delivery estimate
- `revisions` (text) - Revision policy
- `languages` (text[]) - Spoken languages
- `availability` (availability_status) - available | busy | unavailable
- `featured`, `verified`, `top_rated` (boolean)
- `video_url` (text, nullable) - Service video
- `created_at`, `updated_at` (timestamptz)

**Enums:**
- `service_category`: Développement Web, Design Graphique, Montage Vidéo, Marketing Digital, Rédaction, Photographie, Traduction, Consultation
- `experience_level`: Débutant, Intermédiaire, Expert
- `price_type`: fixed, hourly, starting-at
- `availability_status`: available, busy, unavailable

---

#### 10. freelance_portfolios (30 rows)

Portfolio items for freelance services.

**Key Columns:**
- `id` (uuid) - Primary key
- `service_id` (uuid) - References freelance_services
- `title` (text) - Portfolio item title
- `description` (text) - Project description
- `image_url` (text) - Project image
- `display_order` (integer) - Sort order
- `created_at` (timestamptz)

---

#### 11. b2b_offers (1 row)

B2B marketplace offers for business-to-business trading.

**Key Columns:**
- `id` (uuid) - Primary key
- `seller_id` (uuid) - References user_profiles
- `title` (text) - Offer title
- `description` (text) - Offer details
- `images` (text[]) - Product images
- `tags` (text[]) - Search tags
- `base_price` (numeric) - Starting price
- `min_quantity` (integer) - Minimum order quantity
- `available_quantity` (integer) - Stock available
- `offer_type` (b2b_offer_type) - negotiable | auction
- `status` (b2b_offer_status) - active | expired | closed | sold
- `current_bid` (numeric, nullable) - Current auction bid
- `highest_bidder_id` (uuid, nullable) - References user_profiles
- `starts_at`, `ends_at` (timestamptz, nullable) - Auction timeframe
- `target_category` (seller_category) - Target buyer type
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `base_price > 0`
- `min_quantity > 0`
- `available_quantity >= 0`

**Hierarchical Trading:**
- Importateurs → Grossistes
- Grossistes → Fournisseurs

---

#### 12. b2b_offer_responses (0 rows)

Buyer responses to B2B offers (bids or negotiations).

**Key Columns:**
- `id` (uuid) - Primary key
- `offer_id` (uuid) - References b2b_offers
- `buyer_id` (uuid) - References user_profiles
- `response_type` (b2b_response_type) - bid | negotiation
- `status` (b2b_response_status) - pending | accepted | rejected | outbid | withdrawn
- `amount` (numeric) - Bid/offer amount
- `quantity` (integer) - Requested quantity
- `message` (text, nullable) - Negotiation message
- `created_at`, `updated_at` (timestamptz)

**Constraints:**
- `amount > 0`
- `quantity > 0`

---

#### 13. b2b_notifications (0 rows)

Real-time notifications for B2B activities.

**Key Columns:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - References user_profiles
- `type` (b2b_notification_type) - Notification type
- `title` (text) - Notification title
- `message` (text) - Notification content
- `offer_id` (uuid, nullable) - Related offer
- `response_id` (uuid, nullable) - Related response
- `metadata` (jsonb) - Additional data
- `read` (boolean, default: false)
- `read_at` (timestamptz, nullable)
- `created_at` (timestamptz)

**Notification Types:**
- new_offer, new_bid, outbid
- negotiation_submitted, negotiation_accepted, negotiation_rejected
- auction_won, auction_lost, auction_ending_soon
- offer_expired, bid_accepted, bid_rejected

---

## Row Level Security (RLS) Policies

All tables have RLS enabled. Key policy patterns:

### Products

**SELECT**:
- Products with `seller_category = 'fournisseur'` are visible to everyone
- Products from `importateur` visible only to `grossiste` sellers
- Products from `grossiste` visible only to `fournisseur` sellers
- Sellers can always see their own products
- Admins can see all products

**INSERT/UPDATE/DELETE**:
- Sellers can only manage their own products (`seller_id = auth.uid()`)
- `seller_id` must be set on insert

### Orders

**SELECT**:
- Users can view their own orders (`user_id = auth.uid()`)
- Guest orders viewable by anyone (user_id IS NULL)
- Sellers can view orders for their products (`seller_id = auth.uid()`)
- Admins can view all orders

**INSERT**:
- Anyone can create orders (guest checkout enabled)

**UPDATE**:
- Sellers can update orders for their products
- Admins can update all orders

**DELETE**:
- Only admins can delete orders

### Cart Items & Wishlist

**All Operations**:
- Users can only access their own cart/wishlist (`user_id = auth.uid()`)

### Freelance Services

**SELECT**:
- All services publicly viewable

**INSERT**:
- Freelancers and sellers can create services
- `provider_id` must equal `auth.uid()`

**UPDATE/DELETE**:
- Service owners and admins only

### B2B Offers

**SELECT**:
- Offer creators can view their offers
- Active offers visible to appropriate target categories:
  - `target_category = 'fournisseur'` → visible to fournisseur sellers
  - `target_category = 'grossiste'` → visible to grossiste sellers
- Admins can view all offers

**INSERT**:
- Only importateurs and grossistes can create offers
- Must be authenticated seller with appropriate category

**UPDATE/DELETE**:
- Offer owners and admins only

### B2B Offer Responses

**SELECT**:
- Buyers can view their responses
- Sellers can view responses to their offers
- Admins can view all

**INSERT**:
- Authenticated sellers can respond to offers

**UPDATE**:
- Buyers can update pending responses
- Sellers can update responses to their offers
- Admins can update all

---

## Storage Buckets

### Bucket Configuration

All buckets are **public** (no authentication required for reads).

| Bucket | Purpose | Objects | Size | Created |
|--------|---------|---------|------|---------|
| **products** | Product images | 96 | 62 MB | Nov 12, 2025 |
| **product-videos** | Product demo videos | 9 | 17 MB | Nov 14, 2025 |
| **product-thumbnails** | Video thumbnails | 4 | 27 KB | Nov 14, 2025 |
| **avatars** | User profile images | 0 | 0 B | Nov 12, 2025 |
| **portfolios** | Freelancer portfolios | 0 | 0 B | Nov 12, 2025 |

### Storage Policies

**products bucket:**
- Read: Public
- Upload: Authenticated users only
- Update/Delete: File owner or admin

**product-videos & product-thumbnails:**
- Read: Public
- Upload: Sellers uploading to their products
- Update/Delete: Product owner or admin

**avatars:**
- Read: Public
- Upload: Authenticated users
- Update/Delete: Owner only

**portfolios:**
- Read: Public
- Upload: Freelancers uploading to their services
- Update/Delete: Service owner only

### Storage Limits

- **Video Duration**: Max 30 seconds
- **Video File Size**: Max 10 MB
- **No limits**: Set on other file types (use Supabase defaults)

---

## Database Migrations

### Migration History (45 migrations applied)

The database has undergone 45 migrations, including:

**Initial Setup:**
1. `initial_schema_fixed` - Base schema creation
2. `rls_policies` - Row Level Security policies
3. `seed_all_products` - Initial data seeding

**User & Authentication:**
4. `fix_handle_new_user_function` - Auto-create user profiles
10. `add_freelancer_role` - Freelancer support
24. `seller_category_segmentation` - Seller categorization
25. `handle_new_user_seller_category` - Auto-assign categories
26. `adjust_product_visibility_policies` - Category-based visibility

**Product Management:**
5. `update_product_rls_for_sellers` - Seller isolation
7. `make_product_fields_flexible` - Dynamic product types
8. `add_seller_id_to_products` - Seller attribution
21. `create_product_videos_support` - Video uploads
40. `add_min_quantity_to_products` - Wholesale support

**Order Management:**
9. `add_seller_id_to_orders` - Seller order tracking
13. `fix_order_rls_guest_checkout` - Guest orders
14. `fix_order_number_race_condition` - Sequence safety
15. `use_sequence_for_order_numbers` - Auto-incrementing orders
38. `enable_realtime_orders` - Real-time subscriptions

**Storage:**
6. `update_storage_policies_for_sellers` - File permissions
22. `add_storage_paths_to_product_videos` - Internal paths
23. `product_media_storage_policies` - Media policies
35. `add_video_storage_buckets_fixed` - Video buckets
37. `fix_cart_items_foreign_key` - Data integrity

**B2B Marketplace:**
27. `create_b2b_offers_table` - B2B offers
28. `create_b2b_offer_responses_table` - Bid/negotiation
29. `create_b2b_notifications_table` - Notifications
30. `create_b2b_views_and_helpers` - Helper functions
31-32. `fix_create_b2b_notification_function` - Triggers

**Shopping Features:**
33. `create_cart_items_table` - Shopping cart
39. `create_wishlist_table` - Wishlist/favorites

**Performance & Security:**
34. `add_performance_indexes_and_functions` - Query optimization
36. `add_performance_indexes_and_fix_security` - Index tuning
41-45. Performance and RLS optimization

### Migration Files Location

All migration SQL files are in: `zstbrahiim/supabase/migrations/`

---

## API Keys & Configuration

### Publishable Keys

**Anon Key (Legacy JWT):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnJoaHV1Ymp2YXBhZHF5dmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDc2NjEsImV4cCI6MjA3ODQ4MzY2MX0.fAfcPDZjuODgcUKDChzx5DVqVmHCmN6ypf0kETwk5qI
```

**Type**: Legacy anon key
**Status**: Active, not disabled
**Expires**: 2078 (long-lived)

### Service Role Key

The service role key is stored in `.env.local.example` - **keep private**, server-side only.

### Environment Variables

**For Website:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://enbrhhuubjvapadqyvds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-above]
SUPABASE_SERVICE_ROLE_KEY=[private-service-key]
```

**For Mobile App:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://enbrhhuubjvapadqyvds.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key-above]
```

---

## Performance & Indexes

### Key Indexes

**Products:**
- `products_seller_id_idx` - Seller lookup
- `products_seller_category_idx` - Category filtering
- `products_slug_idx` - URL lookups

**Orders:**
- `orders_user_id_idx` - User order history
- `orders_seller_id_idx` - Seller order management
- `orders_order_number_idx` - Order lookups
- `orders_created_at_idx` - Time-based queries

**Cart & Wishlist:**
- `cart_items_user_id_idx` - User cart lookup
- `cart_items_product_id_idx` - Product references
- `wishlist_user_id_idx` - User wishlist
- `wishlist_user_product_idx` - Unique constraint

**B2B:**
- `b2b_offers_seller_id_idx` - Seller offers
- `b2b_offers_status_idx` - Active offers
- `b2b_offer_responses_offer_id_idx` - Offer responses
- `b2b_notifications_user_id_idx` - User notifications

### Query Optimization

- RLS policies use indexed columns for efficient filtering
- Composite indexes on frequently joined columns
- Proper use of foreign keys for referential integrity
- EXPLAIN ANALYZE recommended for complex queries

---

## Real-time Subscriptions

### Enabled Tables

**orders table** has real-time enabled for:
- Seller dashboard order tracking
- Live order status updates
- Real-time notifications

### Usage Example (JavaScript)

```javascript
const { data, error } = await supabase
  .channel('orders')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `seller_id=eq.${userId}`
    },
    (payload) => {
      console.log('Order update:', payload)
    }
  )
  .subscribe()
```

### Other Real-time Use Cases

- B2B offer bidding updates
- Cart synchronization across devices
- Notification delivery

---

## Database Statistics

### Current Usage

- **Total Tables**: 76 (public: 13, auth: 23, storage: 8)
- **Total Rows**: ~400+ across all tables
- **Storage Used**: ~79 MB (62 MB products, 17 MB videos)
- **Active Users**: 34 registered users
- **Products**: 18 database products (+ static data)
- **Orders**: 47 completed orders
- **Extensions**: 6 active

---

## Security Best Practices

### Current Implementation

1. **RLS Enabled**: All public tables have RLS policies
2. **Guest Checkout**: Supported with anonymous orders
3. **Seller Isolation**: Products strictly isolated by seller_id
4. **Category Segmentation**: B2B marketplace visibility controlled
5. **Foreign Keys**: Referential integrity enforced
6. **Storage Policies**: Upload restricted to authenticated users

### Recommendations

1. **Regular Backups**: Enable point-in-time recovery
2. **SSL/TLS**: Always use SSL connections (enforced by Supabase)
3. **Key Rotation**: Rotate service role key periodically
4. **Audit Logs**: Monitor auth.audit_log_entries
5. **Rate Limiting**: Configure API rate limits in Supabase dashboard
6. **Monitoring**: Set up performance and error alerts

---

## Maintenance & Monitoring

### Health Checks

- Database status: **ACTIVE_HEALTHY**
- Connection pooling: Enabled (Supabase managed)
- Automatic backups: Enabled (Supabase managed)

### Performance Monitoring

- Use Supabase Dashboard > Logs for query analysis
- Monitor slow queries via `pg_stat_statements`
- Check RLS policy performance with EXPLAIN

### Scaling Considerations

- Current plan supports moderate traffic
- Consider connection pooling for high concurrency
- Monitor storage growth (currently 79 MB)
- Review index usage as data grows

---

## Support & Resources

### Supabase Dashboard

Access the Supabase dashboard:
https://app.supabase.com/project/enbrhhuubjvapadqyvds

### Key Features Available

- SQL Editor for direct queries
- Table Editor for data management
- Authentication management
- Storage browser
- Real-time logs
- API documentation (auto-generated)

### Documentation

- Official Supabase Docs: https://supabase.com/docs
- PostgreSQL 17 Docs: https://www.postgresql.org/docs/17/

---

## Appendix: Enum Types

### Complete Enum Definitions

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
  'customer', 'seller', 'admin', 'freelancer'
);

-- Seller categories
CREATE TYPE seller_category AS ENUM (
  'fournisseur', 'importateur', 'grossiste'
);

-- Product categories
CREATE TYPE product_category_type AS ENUM (
  'perfume', 'clothing'
);

-- Order statuses
CREATE TYPE order_status AS ENUM (
  'pending', 'processing', 'shipped', 'delivered', 'cancelled'
);

-- Payment statuses
CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);

-- Service categories
CREATE TYPE service_category AS ENUM (
  'Développement Web', 'Design Graphique', 'Montage Vidéo',
  'Marketing Digital', 'Rédaction', 'Photographie',
  'Traduction', 'Consultation'
);

-- Experience levels
CREATE TYPE experience_level AS ENUM (
  'Débutant', 'Intermédiaire', 'Expert'
);

-- Price types
CREATE TYPE price_type AS ENUM (
  'fixed', 'hourly', 'starting-at'
);

-- Availability status
CREATE TYPE availability_status AS ENUM (
  'available', 'busy', 'unavailable'
);

-- B2B offer types
CREATE TYPE b2b_offer_type AS ENUM (
  'negotiable', 'auction'
);

-- B2B offer status
CREATE TYPE b2b_offer_status AS ENUM (
  'active', 'expired', 'closed', 'sold'
);

-- B2B response types
CREATE TYPE b2b_response_type AS ENUM (
  'bid', 'negotiation'
);

-- B2B response status
CREATE TYPE b2b_response_status AS ENUM (
  'pending', 'accepted', 'rejected', 'outbid', 'withdrawn'
);

-- B2B notification types
CREATE TYPE b2b_notification_type AS ENUM (
  'new_offer', 'new_bid', 'outbid',
  'negotiation_submitted', 'negotiation_accepted', 'negotiation_rejected',
  'auction_won', 'auction_lost', 'auction_ending_soon',
  'offer_expired', 'bid_accepted', 'bid_rejected'
);
```

---

**Generated**: December 2, 2025
**Project**: ZST Multi-Vendor Marketplace
**Backend**: Supabase PostgreSQL
**Region**: eu-west-3
