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
- **Backend**: Convex (reactive database, real-time queries, serverless functions)
- **Auth**: Better Auth via @convex-dev/better-auth (email/password + Google OAuth)
- **Storage**: Cloudflare R2 via @aws-sdk/client-s3 (file uploads via /api/upload route)
- **UI Components**: Radix UI, custom components (no icon library per user preference)

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server on localhost:3000
npm run convex:dev       # Start Convex dev server (run alongside npm run dev)

# Build & Production
npm run build            # Build for production
npm start               # Start production server
npm run lint            # Run ESLint checks
npm run convex:deploy    # Deploy Convex functions to production
```

## Architecture Patterns

### 1. Hybrid Data Strategy
The codebase uses a hybrid approach combining static and dynamic data:
- Static product data in `/src/data/*.ts` files (perfumes, winter clothes, freelance services)
- Dynamic database products from Convex
- Combined rendering in UI components to show both static and database products

When working with products, always consider both data sources.

### 2. Seller Segmentation
Products are filtered by seller category:
- Homepage (`/`): Shows only products from "fournisseur" sellers
- B2B page (`/GROS`): Shows products from "importateur" and "grossiste" sellers
- Filter logic uses `sellerCategory` field in Convex queries

### 3. Authentication Flow
- Better Auth via @convex-dev/better-auth
- Email/password signup with role selection (customer/seller/freelancer)
- `useCurrentUser()` hook for accessing user profile + auth state
- `authClient.signIn.email()`, `authClient.signUp.email()`, `authClient.signOut()` for auth actions
- Profile creation via `api.users.createProfile` mutation after signup

### 4. Image/Video Management
- Cloudflare R2 storage via `/api/upload` Next.js API route
- Device-based file uploads via `ImageUpload`, `MultiImageUpload`, `VideoUpload` components
- Public URL generation from R2_PUBLIC_URL
- Next.js Image component for optimization

### 5. Component Patterns
- Client components (`'use client'`) with Convex reactive queries (`useQuery`)
- `useQuery` for data fetching (auto-reactive, no useEffect needed)
- `useMutation` for data mutations
- Modal-based forms for CRUD operations (AddProductModal, EditProductModal, etc.)
- Reusable filter/sorting controls in ShopFilters component

### 6. Convex Data Fetching Pattern
```tsx
// Reactive query - auto-updates when data changes
const data = useQuery(api.module.queryName, { args })

// Conditional query - skip when args aren't ready
const data = useQuery(api.module.queryName, condition ? { args } : 'skip')

// Mutation
const doSomething = useMutation(api.module.mutationName)
await doSomething({ args })
```

## Key File Locations

### Convex Backend
- `convex/schema.ts` - Database schema (all tables + indexes)
- `convex/auth.ts` - Better Auth instance + `getAuthenticatedAppUser()` helper
- `convex/auth.config.ts` - Auth config provider
- `convex/convex.config.ts` - Register better-auth component
- `convex/http.ts` - HTTP routes (auth endpoints)
- `convex/users.ts` - User queries/mutations
- `convex/products.ts` - Product CRUD operations
- `convex/orders.ts` - Order management + dashboard stats
- `convex/services.ts` - Freelance services operations
- `convex/b2bOffers.ts` - B2B offer management
- `convex/b2bResponses.ts` - B2B bid/negotiation responses
- `convex/b2bNotifications.ts` - B2B notification system
- `convex/crons.ts` - Scheduled tasks (auction expiry, notifications)

### Auth & Providers
- `src/lib/auth-client.ts` - Frontend auth client (no baseURL)
- `src/lib/auth-server.ts` - Server-side auth utilities
- `src/app/api/auth/[...all]/route.ts` - Next.js auth API handler
- `src/components/providers/convex-provider.tsx` - ConvexBetterAuthProvider wrapper
- `src/hooks/useCurrentUser.ts` - `useCurrentUser()` + `useConvexAuth()` hooks

### Core Components
- `src/components/Navbar.tsx` - Main navigation with auth state
- `src/components/seller/` - Seller dashboard components
- `src/components/freelancer/` - Freelancer management components
- `src/components/b2b/` - B2B marketplace components
- `src/components/ImageUpload.tsx` - File upload to R2 Storage
- `src/components/CheckoutModal.tsx` - Order checkout

### Data Files
- `src/data/products.ts` - Static perfume catalog
- `src/data/winter-clothes.ts` - Static winter clothing data
- `src/data/freelance-services.ts` - Static freelance services
- `src/data/orders.ts` - Order type definitions

## Database Schema (Convex)

### Key Tables
- `userProfiles` - User accounts with role and sellerCategory
- `products` - Product catalog with sellerId and category
- `productImages` - Multiple images per product
- `productVideos` - Product video assets
- `orders` - Customer orders with orderNumber (auto-generated via counters table)
- `orderItems` - Order line items
- `freelanceServices` - Freelancer service listings
- `freelancePortfolios` - Portfolio items for services
- `b2bOffers` - B2B marketplace offers (auction/negotiable)
- `b2bOfferResponses` - Bids and negotiations on B2B offers
- `b2bNotifications` - B2B notification system
- `counters` - Atomic counters for order number sequence

### Important Enums (as union types)
- `role`: customer, seller, freelancer, admin
- `sellerCategory`: fournisseur, importateur, grossiste
- `productCategory`: perfume, clothing
- `orderStatus`: pending, processing, shipped, delivered, cancelled
- `paymentStatus`: pending, paid, failed, refunded

### Auth & Permissions
Auth is handled by Better Auth + Convex. Access control is implemented in Convex function handlers:
- Products: Public read, authenticated create, owner-only update/delete
- Orders: Guest create allowed, seller/customer can view own orders
- Services: Public read, freelancer manages own services
- B2B: Hierarchical visibility by seller category

## Development Workflow

### Schema Changes
1. Modify `convex/schema.ts`
2. Run `npx convex dev` to push schema changes
3. Types are auto-generated in `convex/_generated/`

### Adding Features
When adding new features:
1. Check if static data exists in `/src/data/` that needs to be considered
2. Add Convex functions in `convex/` directory (queries, mutations, actions)
3. Implement auth checks using `getAuthenticatedAppUser(ctx)` in mutations
4. Use `useQuery(api.module.queryName)` in frontend components
5. Never include icons in design (per user preference in global CLAUDE.md)

### Working with Orders
- Order numbers are auto-generated via `counters` table in Convex
- Guest checkout is supported (no auth required for creating orders)
- Seller dashboard filters orders by sellerId automatically
- Order status workflow: pending → processing → shipped → delivered

### Image Uploads
- Use `ImageUpload` component for consistent upload handling
- Images are stored in Cloudflare R2 via `/api/upload` API route
- Always generate public URLs from R2_PUBLIC_URL
- Multiple images per product are supported via `productImages` table

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
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
CONVEX_SITE_URL=https://your-deployment.convex.site
```

R2 Storage (for file uploads):
```env
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=zst-media
R2_PUBLIC_URL=https://your-r2-public-url
```

Convex Dashboard env vars (set via `npx convex env set`):
```
BETTER_AUTH_SECRET=<generated>
SITE_URL=https://www.zst.xyz
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
```

## Important Patterns

### Type Safety
- Explicit type annotations required
- Generated types from Convex in `convex/_generated/`
- Type-safe queries/mutations via `api` object
- No implicit any types

### Data Fetching
- Convex reactive queries via `useQuery()` for dynamic data (auto-updates, no useEffect needed)
- Static data imported directly from `/src/data`
- Conditional queries: `useQuery(api.x.y, condition ? args : 'skip')`
- Mutations via `useMutation()` for write operations

### Route Structure
- Dynamic routes: `/products/[id]`, `/freelance/[slug]`
- Protected routes use `useConvexAuth()` + client-side redirect
- No middleware auth checks (Better Auth handles sessions client-side)

## Testing Multi-Role Workflows

When testing features:
1. Test as guest user (no auth)
2. Test as customer (browse, order)
3. Test as seller (product management, orders)
4. Test as freelancer (service management)
5. Verify seller category filtering (fournisseur vs importateur/grossiste)
6. Check RLS policies are working correctly

## Common Issues

### Convex Query Issues
If queries return `undefined`:
1. Ensure `npx convex dev` is running alongside `npm run dev`
2. Check that `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`
3. Verify the `ConvexClientProvider` wraps the app in `layout.tsx`

### Auth Issues
- If "Unauthenticated" errors: wrap `authComponent.getAuthUser(ctx)` in try-catch
- If CORS errors: don't set `baseURL` in auth-client.ts (use same-origin routes)
- If sessions don't persist: disable middleware, use client-side auth checks
- Run `npx convex dev` to regenerate `components.betterAuth` types

### TypeScript Errors
- Run `npx convex dev` to regenerate types after schema changes
- Use generated types from `convex/_generated/`
- Check for null/undefined handling on optional fields

### Image Upload Issues
- Verify R2 credentials in `.env.local`
- Check file size limits in `/api/upload` route
- Ensure R2_PUBLIC_URL is set for serving images

## Deployment

- **Frontend**: Vercel (recommended)
- **Backend**: Convex Cloud (auto-deployed via `npx convex deploy`)
- **Storage**: Cloudflare R2
- **Auth**: Better Auth (sessions managed via Convex)
- Set Vercel env vars: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `CONVEX_SITE_URL`
- Set Convex env vars: `BETTER_AUTH_SECRET`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, R2 vars
