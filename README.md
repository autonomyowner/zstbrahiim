# ZST - Multi-Platform Marketplace

A complete luxury marketplace platform with web and mobile applications, featuring multi-vendor support, B2B marketplace, and freelance services.

## Project Overview

ZST is a comprehensive e-commerce platform based in Bouzareah, Algeria, supporting:
- Luxury perfumes and fragrances marketplace
- Winter clothing/fashion (B2B section)
- General marketplace products
- Freelance services platform

### Technology Stack

- **Website**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Mobile App**: React Native, Expo Router, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (website), EAS Build (mobile app)

## Project Structure

```
ZST/
├── zstbrahiim/           # Website (Next.js)
├── zstmapp 1/            # Mobile App (React Native/Expo)
└── README.md             # This file
```

## Multi-Role System

The platform supports multiple user roles:

- **Customers**: Browse and purchase products
- **Sellers**: Manage products and orders
  - Fournisseur (retailer): Visible on main marketplace
  - Importateur: B2B section only
  - Grossiste: B2B section only
- **Freelancers**: Post services and manage portfolios
- **Admins**: Full platform access

## Backend (Supabase)

### Configuration
- **Project ID**: enbrhhuubjvapadqyvds
- **Region**: eu-west-3
- **URL**: https://enbrhhuubjvapadqyvds.supabase.co

### Database
- 17 migrations applied (schema, RLS policies, storage, triggers)
- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions support
- Storage buckets for product images/videos

### Key Tables
- `user_profiles` - User accounts with roles
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `freelance_services` - Freelancer services
- `b2b_offers` - B2B marketplace offers
- `b2b_offer_responses` - Responses to B2B offers

---

## Website Setup (zstbrahiim)

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

1. Navigate to website directory:
```bash
cd zstbrahiim
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

The `.env.local.example` already contains the correct Supabase credentials. No changes needed unless deploying to production.

4. Start development server:
```bash
npm run dev
```

Website will be available at: http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run migrate` - Migrate static data to Supabase
- `npm run create-admin` - Create admin user account

### Deployment (Vercel)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Deploy

### Website Features

- Homepage with product showcase
- Multi-vendor marketplace
- B2B marketplace (winter clothes)
- Freelance services platform
- User authentication (signup/signin)
- Seller dashboard (product management)
- Freelancer dashboard (service management)
- Order management
- Real-time notifications
- Responsive design (mobile-first)

---

## Mobile App Setup (zstmapp 1)

### Prerequisites
- Node.js 20+
- npm (with --legacy-peer-deps support)
- Expo CLI
- EAS CLI (for builds)

### Installation Steps

1. Navigate to app directory:
```bash
cd "zstmapp 1"
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

IMPORTANT: Always use `--legacy-peer-deps` flag when installing packages.

3. Environment configuration:

The `.env` file already contains the correct Supabase credentials:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. Start development server:
```bash
npm run start
```

### Running on Devices/Simulators

Before running on physical devices or simulators, you need to create EAS builds:

#### iOS Builds
```bash
npm run build:ios:sim          # Build for iOS simulator
npm run build:ios:device       # Build for iOS device
npm run build:ios:preview      # Preview build
npm run build:ios:prod         # Production build
```

#### Android Builds
```bash
npm run build:android:sim      # Build for Android simulator
npm run build:android:device   # Build for Android device
npm run build:android:preview  # Preview build (APK)
npm run build:android:prod     # Production build
```

### Available Scripts

- `npm run start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run compile` - TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests

### App Configuration

- **Package**: com.zst
- **App Name**: ZST
- **EAS Project ID**: 97c7d6f2-200d-4534-87ff-eacd62e6ce75
- **Expo Router**: File-based routing enabled

### App Features

- Multi-role authentication
- Product browsing and search
- Shopping cart
- Order management
- Seller dashboard
- Freelancer dashboard
- Real-time order updates
- Push notifications (configured)
- Dark mode support

### Documentation

The app includes comprehensive documentation:
- `README.md` - Getting started guide
- `CLAUDE.md` - Development guidelines
- `HOW_TO_INSTALL_APK.md` - APK installation guide
- `CACHE_QUICK_START.md` - Caching implementation
- `BRANDING_UPDATE_SUMMARY.md` - Branding guidelines
- `tunnel-setup.md` - Development tunnel setup

---

## Environment Variables

### Website (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://enbrhhuubjvapadqyvds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Mobile App (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://enbrhhuubjvapadqyvds.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

All credentials are already configured in the example files.

---

## Important Notes

### Before First Use

#### Website
1. Install dependencies: `cd zstbrahiim && npm install`
2. Create environment file: `cp .env.local.example .env.local`
3. Test locally: `npm run dev`

#### Mobile App
1. Dependencies are already installed
2. Environment file is already configured
3. Run EAS build before testing on devices

### Security Considerations

- The Supabase service role key is sensitive - keep it private
- Ensure `.env` files are in `.gitignore` (already configured)
- RLS policies are enabled on all database tables
- User authentication required for sensitive operations

### Database Migrations

All 17 migrations are already applied to the Supabase project:
- Initial schema
- RLS policies
- Storage setup
- Seed data
- Order management
- B2B marketplace
- Notifications system

No additional database setup required.

---

## Testing

### Website Testing
```bash
cd zstbrahiim
npm run dev
```
Visit http://localhost:3000 and test:
- User signup/signin
- Product browsing
- Seller dashboard
- Order creation

### Mobile App Testing

1. Start development server:
```bash
cd "zstmapp 1"
npm run start
```

2. Scan QR code with Expo Go app, or build for device using EAS

---

## Troubleshooting

### Website Issues

**Build fails with "next not found"**
- Solution: Run `npm install` in the `zstbrahiim` directory

**Supabase connection error**
- Solution: Ensure `.env.local` file exists with correct credentials

### Mobile App Issues

**npm install fails**
- Solution: Use `npm install --legacy-peer-deps`

**Build fails**
- Solution: Check EAS CLI is installed: `npm install -g eas-cli`

**Cannot connect to Supabase**
- Solution: Verify `.env` file contains correct credentials

---

## Support & Contact

For technical questions or issues:
- Review the individual README files in each project folder
- Check CLAUDE.md files for detailed architecture information
- Review documentation files in the mobile app folder

---

## Project Delivery Checklist

- [x] Website codebase complete
- [x] Mobile app codebase complete
- [x] Supabase backend configured
- [x] Database migrations applied
- [x] Environment files configured
- [x] Documentation provided
- [ ] Website dependencies installed (`npm install` required)
- [ ] Website .env.local created (copy from example)
- [ ] Website tested locally
- [ ] Mobile app EAS build tested

---

## License

Private project. All rights reserved.

---

**Built with care for ZST**
Bouzareah, Algeria
