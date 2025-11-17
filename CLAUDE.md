# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ZST** is a luxury multi-vendor marketplace platform based in Bouzareah, Algeria. The platform supports:
- Perfumes and fragrances (luxury marketplace)
- Winter clothing/fashion (B2B section)
- General marketplace products
- Freelance services platform

### Multi-Role System
- **Customers**: Browse and order products
- **Sellers**: Manage products and view orders (segmented by category)
  - Fournisseur (retailer): Visible on main marketplace
  - Importateur: B2B section only
  - Grossiste: B2B section only
- **Freelancers**: Post services and manage portfolios
- **Admins**: Full platform access

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 18.3.1, TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
  - Project ID: enbrhhuubjvapadqyvds
  - Region: eu-west-3
- **UI Components**: Radix UI, custom components (no icon library per user preference)

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server on localhost:3000

# Build & Production
npm run build            # Build for production
npm start               # Start production server
npm run lint            # Run ESLint checks

# Database Scripts
npm run migrate         # Migrate static data to Supabase
npm run create-admin    # Create admin user account
```

## Architecture Patterns

### 1. Hybrid Data Strategy
The codebase uses a hybrid approach combining static and dynamic data:
- Static product data in `/src/data/*.ts` files (perfumes, winter clothes, freelance services)
- Dynamic database products from Supabase
- Combined rendering in UI components to show both static and database products

When working with products, always consider both data sources.

### 2. Seller Segmentation
Products are filtered by seller category:
- Homepage (`/`): Shows only products from "fournisseur" sellers
- B2B page (`/winter`): Shows products from "importateur" and "grossiste" sellers
- Filter logic is implemented in components using `seller_category` field

### 3. Authentication Flow
- Supabase Auth with PKCE flow
- Email/password signup with role selection (customer/seller/freelancer)
- Protected routes check auth in `useEffect` hooks
- Database trigger automatically creates user profile on signup

### 4. Image/Video Management
- Supabase Storage buckets: `product-images`, `product-videos`
- Device-based file uploads via `ImageUpload` component in `src/components/ImageUpload.tsx`
- Public URL generation for serving media
- Next.js Image component for optimization

### 5. Component Patterns
- Client components (`'use client'`) for interactive features
- Server components for static content
- Modal-based forms for CRUD operations (AddProductModal, EditProductModal, etc.)
- Reusable filter/sorting controls in ShopFilters component

## Key File Locations

### Supabase Integration
- `src/lib/supabase/client.ts` - Supabase client configuration
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/auth.ts` - Authentication helpers
- `src/lib/supabase/products.ts` - Product CRUD operations
- `src/lib/supabase/orders.ts` - Order management functions
- `src/lib/supabase/services.ts` - Freelance services operations
- `src/lib/supabase/types.ts` - TypeScript type definitions
- `src/lib/supabase/database.types.ts` - Generated Supabase types

### Core Components
- `src/components/Navbar.tsx` - Main navigation with auth state
- `src/components/seller/` - Seller dashboard components
- `src/components/freelancer/` - Freelancer management components
- `src/components/ImageUpload.tsx` - File upload to Supabase Storage

### Data Files
- `src/data/products.ts` - Static perfume catalog
- `src/data/winter-clothes.ts` - Static winter clothing data
- `src/data/freelance-services.ts` - Static freelance services
- `src/data/orders.ts` - Order templates

### Database Migrations
- `supabase/migrations/` - SQL migration files (11 migrations)
- Migrations include schema, RLS policies, storage setup, and triggers

## Database Schema

### Key Tables
- `user_profiles` - User accounts with role and seller_category
- `products` - Product catalog with seller_id and category
- `product_images` - Multiple images per product
- `product_videos` - Product video assets
- `orders` - Customer orders with order_number (auto-generated via sequence)
- `order_items` - Order line items
- `freelance_services` - Freelancer service listings
- `service_portfolio` - Portfolio items for services
- `service_reviews` - Service reviews and ratings

### Important Enums
- `user_role`: customer, seller, freelancer, admin
- `seller_category`: fournisseur, importateur, grossiste
- `product_category_type`: perfume, clothing
- `order_status`: pending, processing, shipped, delivered, cancelled
- `payment_status`: pending, paid, failed, refunded

### Row Level Security (RLS)
All tables have RLS policies applied. Key patterns:
- Products: Public read, authenticated insert, owner-only update/delete
- Orders: Guest create allowed, seller/customer can view own orders
- Services: Public read, freelancer manages own services
- Storage: Public read, authenticated upload

## Development Workflow

### Database Changes
1. Create new migration file in `supabase/migrations/`
2. Apply via Supabase dashboard or CLI
3. Regenerate types: `npx supabase gen types typescript`
4. Update `src/lib/supabase/database.types.ts`

### Adding Features
When adding new features:
1. Check if static data exists in `/src/data/` that needs to be considered
2. Ensure RLS policies are properly configured for new tables
3. Use TypeScript types from `src/lib/supabase/types.ts`
4. Follow existing patterns for client/server components
5. Never include icons in design (per user preference in global CLAUDE.md)

### Working with Orders
- Order numbers are auto-generated via Supabase sequence (not client-side)
- Guest checkout is supported (no auth required for creating orders)
- Seller dashboard filters orders by seller_id automatically
- Order status workflow: pending → processing → shipped → delivered

### Image Uploads
- Use `ImageUpload` component for consistent upload handling
- Images are stored in Supabase Storage, not local filesystem
- Always generate public URLs for displaying uploaded images
- Multiple images per product are supported via `product_images` table

## Styling Conventions

### Design System
- Brand colors: golden yellow (#FACC15), dark (#181711)
- Fonts: Playfair Display (elegant), Inter (modern), Great Vibes (artistic)
- Custom tokens: `brand-primary`, `text-primary`, `shadow-card-md`
- Responsive design: mobile-first approach

### Tailwind Usage
- Utility-first approach
- Component-scoped classes
- No icon library (per user preference)
- Material Symbols used sparingly for UI controls only

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://enbrhhuubjvapadqyvds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Important Patterns

### Type Safety
- Explicit type annotations required
- Generated database types from Supabase
- Type-safe Supabase client with `Database` generic
- No implicit any types

### Data Fetching
- Client-side fetching with `useEffect` for dynamic data
- Static data imported directly from `/src/data`
- Error handling with try/catch and console logging
- No server actions currently in use

### Route Structure
- Dynamic routes: `/products/[id]`, `/freelance/[slug]`
- Protected routes check auth in `useEffect`
- No-cache headers on auth-dependent pages

## Testing Multi-Role Workflows

When testing features:
1. Test as guest user (no auth)
2. Test as customer (browse, order)
3. Test as seller (product management, orders)
4. Test as freelancer (service management)
5. Verify seller category filtering (fournisseur vs importateur/grossiste)
6. Check RLS policies are working correctly

## Common Issues

### RLS Policy Violations
If you encounter RLS policy errors:
1. Check the relevant policy in `supabase/migrations/`
2. Verify user_id is correctly set in authenticated context
3. For guest operations, ensure policy allows anon access
4. Check seller_id matches authenticated user for seller operations

### TypeScript Errors
- Always regenerate types after schema changes
- Use generated types from `database.types.ts`
- Check for null/undefined handling on optional fields

### Image Upload Issues
- Verify storage bucket permissions in Supabase dashboard
- Check file size limits (Supabase has default limits)
- Ensure public bucket settings for product images

## Deployment

- **Platform**: Vercel (recommended)
- **Environment**: Set all environment variables in Vercel dashboard
- **Build**: Automatic builds on push to main branch
- **Database**: Supabase project in eu-west-3 region
