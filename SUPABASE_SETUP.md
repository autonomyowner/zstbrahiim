# Supabase Backend Setup Guide for ZST

This guide will walk you through setting up the complete Supabase backend for your ZST e-commerce and freelance marketplace platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Migration](#database-migration)
4. [Storage Configuration](#storage-configuration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Data Migration](#data-migration)
7. [Frontend Integration](#frontend-integration)
8. [Testing](#testing)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- Supabase CLI installed (`npm install -g supabase`)
- Git installed

## Supabase Project Setup

### Step 1: Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: ZST Marketplace
   - **Database Password**: (Save this securely!)
   - **Region**: Choose the closest to Algeria (EU West recommended)
4. Wait for the project to be provisioned (~2 minutes)

### Step 2: Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbG...` (safe to use in browser)
   - **Service Role Key**: `eyJhbG...` (keep secret, server-side only)

### Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **IMPORTANT**: Add `.env.local` to `.gitignore` (it should already be there)

---

## Database Migration

### Step 1: Initialize Supabase CLI

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

To find your project ref: Go to **Settings** → **General** in Supabase dashboard.

### Step 2: Run Database Migrations

Run the migrations in order:

```bash
# Migration 1: Initial schema (tables, types, functions, triggers)
supabase db push supabase/migrations/20250112000001_initial_schema.sql

# Migration 2: RLS policies
supabase db push supabase/migrations/20250112000002_rls_policies.sql

# Migration 3: Storage setup
supabase db push supabase/migrations/20250112000003_storage_setup.sql
```

**Alternative**: Run all migrations at once
```bash
supabase db push
```

### Step 3: Verify Migration

Go to your Supabase dashboard → **Table Editor** and verify that all tables exist:
- user_profiles
- products
- product_images
- freelance_services
- freelance_portfolios
- orders
- order_items

---

## Storage Configuration

### Verify Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Verify these buckets exist (created by migration):
   - `products` (public)
   - `avatars` (public)
   - `portfolios` (public)

### Upload Existing Images

You need to upload your existing images to Supabase Storage:

**Option 1: Manual Upload (for small datasets)**
1. Go to **Storage** → `products` bucket
2. Create folders: `/perfums/`, `/winter/`
3. Upload images from your local `/public/perfums/` and `/public/winter/` directories

**Option 2: Automated Upload (recommended)**
Create a script `scripts/upload-images.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function uploadImages() {
  const imageDir = path.join(process.cwd(), 'public', 'perfums')
  const files = fs.readdirSync(imageDir)

  for (const file of files) {
    const filePath = path.join(imageDir, file)
    const fileBuffer = fs.readFileSync(filePath)

    const { error } = await supabase.storage
      .from('products')
      .upload(`perfums/${file}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) console.error(`Error uploading ${file}:`, error)
    else console.log(`✅ Uploaded: ${file}`)
  }
}

uploadImages()
```

---

## Edge Functions Deployment

### Step 1: Deploy Edge Functions

```bash
# Deploy create-order function
supabase functions deploy create-order

# Deploy update-order-status function
supabase functions deploy update-order-status

# Deploy export-data function
supabase functions deploy export-data
```

### Step 2: Test Edge Functions

```bash
# Test create-order locally
supabase functions serve create-order

# In another terminal, test with curl
curl -X POST http://localhost:54321/functions/v1/create-order \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "+213 555 123 456",
    "customer_address": "123 Test Street",
    "customer_wilaya": "Alger",
    "items": [
      {
        "product_id": "wf-1",
        "quantity": 2
      }
    ]
  }'
```

---

## Data Migration

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client library
- `tsx` - TypeScript execution engine
- `dotenv` - Environment variable loader

### Step 2: Create Admin User

```bash
npm run create-admin
```

Follow the prompts to create your first admin user. This user will have full access to manage products, orders, and services.

### Step 3: Migrate Existing Data

```bash
npm run migrate
```

This script will:
1. Migrate all women's perfumes from `src/data/products.ts`
2. Migrate all men's perfumes
3. Migrate all winter clothes from `src/data/winter-clothes.ts`
4. Migrate all freelance services from `src/data/freelance-services.ts`
5. Create provider profiles for freelancers

**Expected Output:**
```
🚀 Starting Data Migration to Supabase...
✅ Successfully connected to Supabase

📦 Migrating Products...
✅ Migrated: Parfum Femme Élégance
✅ Migrated: Parfum Femme Prestige
...
📊 Products Migration Complete: 24 succeeded, 0 failed

👨‍💼 Migrating Freelance Services...
✅ Migrated: Je développerai votre site web professionnel
...
📊 Services Migration Complete: 10 succeeded, 0 failed

✨ Migration Complete!
```

### Step 4: Verify Data

Go to Supabase dashboard → **Table Editor** and verify:
- **products** table has all 24 products
- **product_images** table has all product images
- **freelance_services** table has all 10 services
- **freelance_portfolios** table has portfolio items
- **user_profiles** table has provider profiles

---

## Frontend Integration

### Step 1: Update Imports

Your frontend components currently import from static data files. You need to update them to use the Supabase API.

**Example: Update home page**

BEFORE (`src/app/page.tsx`):
```typescript
import { womenPerfumes } from '@/data/products'
```

AFTER:
```typescript
import { getWomenPerfumes } from '@/lib/supabase/products'

// In your component
const products = await getWomenPerfumes()
```

### Step 2: API Service Usage Examples

**Fetch Products:**
```typescript
import { getProducts, getProductById, searchProducts } from '@/lib/supabase/products'

// Get all products
const products = await getProducts()

// Get women's perfumes
const womenPerfumes = await getProducts({ product_type: 'Parfum Femme' })

// Search products
const results = await searchProducts('rose', { in_stock: true })

// Get single product
const product = await getProductById('wf-1')
```

**Fetch Freelance Services:**
```typescript
import { getFreelanceServices, getServiceBySlug } from '@/lib/supabase/services'

// Get all services
const services = await getFreelanceServices()

// Get featured services
const featured = await getFreelanceServices({ featured: true })

// Get service by slug
const service = await getServiceBySlug('developpement-site-web-professionnel')
```

**Create Orders:**
```typescript
import { createOrder } from '@/lib/supabase/orders'

const orderId = await createOrder({
  customer_name: 'Ahmed Benali',
  customer_email: 'ahmed@example.com',
  customer_phone: '+213 555 123 456',
  customer_address: '12 Rue des Martyrs',
  customer_wilaya: 'Alger',
  items: [
    { product_id: 'wf-1', quantity: 2 },
    { product_id: 'wf-2', quantity: 1 },
  ],
})
```

**Authentication:**
```typescript
import { signUp, signIn, signOut, getCurrentUserProfile } from '@/lib/supabase/auth'

// Sign up
await signUp('user@example.com', 'password123', 'Full Name', '+213 555 123 456')

// Sign in
await signIn('user@example.com', 'password123')

// Get current user profile
const profile = await getCurrentUserProfile()

// Sign out
await signOut()
```

### Step 3: Update Page Components

You'll need to update these pages:
- `src/app/page.tsx` - Home page (women's perfumes)
- `src/app/services/page.tsx` - Services page (men's perfumes)
- `src/app/winter/page.tsx` - Winter clothes
- `src/app/products/[id]/page.tsx` - Product details
- `src/app/freelance/page.tsx` - Freelance marketplace
- `src/app/freelance/[slug]/page.tsx` - Service details
- `src/app/sellers/page.tsx` - Seller dashboard

**Migration Strategy:**
1. Keep existing static data files as backup
2. Update components one at a time
3. Test each page thoroughly
4. Once all pages work, you can remove static data files

---

## Testing

### Test Checklist

#### Database & RLS
- [ ] Products are viewable without authentication
- [ ] Only admins can create/update/delete products
- [ ] Freelance services are viewable without authentication
- [ ] Service owners can update their own services
- [ ] Users can view their own orders
- [ ] Only admins can update order status

#### Storage
- [ ] Product images are publicly accessible
- [ ] Admins can upload product images
- [ ] Users can upload their own avatars
- [ ] Service owners can upload portfolio images

#### Edge Functions
- [ ] create-order function works correctly
- [ ] update-order-status function updates status
- [ ] export-data function exports orders and products

#### Frontend
- [ ] Home page displays women's perfumes
- [ ] Services page displays men's perfumes
- [ ] Winter page displays winter clothes
- [ ] Product detail pages work
- [ ] Freelance marketplace displays services
- [ ] Service detail pages work
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Seller dashboard displays correct stats

---

## Security Checklist

### Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is never exposed to browser
- [ ] Environment variables are set in production (Vercel/Netlify)

### Row Level Security
- [ ] All tables have RLS enabled
- [ ] RLS policies are tested and working
- [ ] No unauthorized access to data

### Authentication
- [ ] Email confirmation is enabled
- [ ] Password requirements are enforced (min 6 characters)
- [ ] Rate limiting is configured in Supabase dashboard

### Storage
- [ ] Storage buckets have correct policies
- [ ] File size limits are set (recommended: 5MB)
- [ ] Only allowed file types can be uploaded

---

## Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
**Solution**: Ensure `.env.local` exists and contains correct values

#### "Failed to connect to Supabase"
**Solution**:
1. Check Project URL is correct
2. Verify project is not paused in Supabase dashboard
3. Check internet connection

#### "Permission denied" errors
**Solution**:
1. Verify RLS policies are created
2. Check user authentication
3. Verify user role (admin/seller/customer)

#### "Product images not loading"
**Solution**:
1. Verify images are uploaded to correct bucket
2. Check image URLs in database match storage paths
3. Verify storage bucket is public

#### Migration fails
**Solution**:
1. Check migration order (run in sequence)
2. Verify no syntax errors in SQL files
3. Check Supabase dashboard → Database → Logs for errors

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: File an issue if you encounter bugs

---

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
4. Deploy

### Post-Deployment

1. Test all features in production
2. Monitor Supabase dashboard for errors
3. Set up monitoring and alerts
4. Configure backups in Supabase (Settings → Database → Backups)

---

## Maintenance

### Regular Tasks

- **Weekly**: Check Supabase logs for errors
- **Monthly**: Review RLS policies
- **Quarterly**: Audit user permissions
- **As needed**: Update Supabase client library

### Backup Strategy

Supabase automatically backs up your database daily. Configure additional backups:

1. Go to **Settings** → **Database** → **Backups**
2. Enable Point-in-Time Recovery (PITR) for production
3. Download manual backups regularly

---

## Next Steps

1. ✅ Complete this setup guide
2. 🧪 Test all features thoroughly
3. 🎨 Update frontend components to use Supabase API
4. 🚀 Deploy to production
5. 📊 Set up analytics and monitoring
6. 📧 Integrate email service (Resend, SendGrid, etc.)
7. 💳 Integrate payment gateway (for e-commerce)

---

## Support

For questions or issues with this setup, refer to:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Project CLAUDE.md for codebase-specific guidance

---

**Last Updated**: January 12, 2025
**Version**: 1.0.0
