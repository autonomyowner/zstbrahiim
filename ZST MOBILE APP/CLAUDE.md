# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo Router for an e-commerce/marketplace platform. The app supports multiple user roles (customer, seller, admin, freelancer) and integrates with Supabase for backend services. Based on the Infinite Red Ignite boilerplate.

## Development Setup

### Installation
```bash
npm install --legacy-peer-deps
```

**Important**: Always use `--legacy-peer-deps` flag when installing packages.

### Running the App
```bash
npm run start                 # Start Metro bundler
npm run start:dev-client     # Start with dev client
npm run android              # Run on Android
npm run ios                  # Run on iOS
npm run web                  # Run on web
```

### Building
The project requires EAS builds before running on simulators or devices:

```bash
# iOS builds
npm run build:ios:sim        # Build for iOS simulator
npm run build:ios:device     # Build for iOS device
npm run build:ios:preview    # Preview build for iOS
npm run build:ios:prod       # Production build for iOS

# Android builds
npm run build:android:sim    # Build for Android simulator
npm run build:android:device # Build for Android device
npm run build:android:preview # Preview build for Android
npm run build:android:prod   # Production build for Android
```

### Development Tools
```bash
npm run compile              # TypeScript type checking (no emit)
npm run lint                 # Run ESLint with auto-fix
npm run lint:check          # Run ESLint without auto-fix
npm test                    # Run Jest tests
npm run test:watch          # Run Jest in watch mode
npm run test:maestro        # Run Maestro E2E tests
npm run adb                 # Setup ADB port forwarding for Android
```

## Architecture

### Navigation Structure
- **Expo Router**: File-based routing using `src/app/` directory
- **Custom Tab Navigation**: PagerView-based swipeable tabs in `MainTabsScreen.tsx`
- Main screens: Marketplace (Home), Shop, Cart, Dashboard (for sellers), Profile

### State Management
- **AuthContext** (`src/context/AuthContext.tsx`): Global authentication state
  - Manages user authentication, profile, and role-based access
  - Wraps entire app in `_layout.tsx`
- **Real-time subscriptions**: Custom hooks for Supabase real-time updates (e.g., `useRealtimeOrders`)

### Backend Integration (Supabase)
- **Client setup**: `src/services/supabase/client.ts`
- **Service layer pattern**: Separate service files for each domain
  - `authService.ts`: Authentication and user profile management
  - `productService.ts`: Product CRUD operations
  - `orderService.ts`: Order management
  - `sellerService.ts`: Seller-specific operations
  - `freelanceService.ts`: Freelance services
- **Type definitions**: `src/services/supabase/types.ts` contains database schema types
- **Environment variables**: Supabase URL and anon key in `.env` (prefixed with `EXPO_PUBLIC_`)

### Path Aliases
TypeScript path aliases configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@assets/*` → `./assets/*`

Always use these aliases for imports instead of relative paths.

### Theme System
- `src/theme/` contains theming system with context-based theme provider
- Dark mode support with separate color schemes
- Typography system uses Space Grotesk font family
- Custom spacing, colors, and timing configurations

### Component Architecture
- **Reusable components** in `src/components/`:
  - Custom wrappers for native components (Text, Button, TextField)
  - Specialized components (Screen, Header, Icon, TabIcon, etc.)
  - ESLint enforces using custom components instead of RN primitives
- **Screen components** in `src/screens/`:
  - Feature-specific screens (e.g., `MarketplaceScreen`, `ProductDetailScreen`)
  - Screens handle their own state and business logic

## Code Style & Conventions

### Import Organization (enforced by ESLint)
Imports must be ordered in specific groups with alphabetical sorting:
1. React imports (builtin/external)
2. React Native imports
3. Expo imports
4. Other external dependencies
5. Internal imports using `@/` alias
6. Relative imports

Example:
```typescript
import { useState, useEffect } from "react"
import { View, StyleSheet } from "react-native"
import { useFonts } from "@expo-google-fonts/space-grotesk"

import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/services/supabase/client"
```

### ESLint Rules
- **Restricted imports**:
  - Use named exports from 'react' (no default import)
  - Use SafeAreaView from 'react-native-safe-area-context' only
  - Use custom Text, Button, TextInput from `@/components` (not from react-native)
- Unused vars with `_` prefix are allowed
- No Reactotron in production builds
- Prettier integration for formatting

### TypeScript Configuration
- Strict mode enabled (`noImplicitAny`, `noImplicitReturns`, `noImplicitThis`)
- ES modules with bundler resolution
- React Native JSX mode
- Skip lib check for faster builds

## Environment & Configuration

### Configuration Files
- `src/config/config.base.ts`: Base configuration
- `src/config/config.dev.ts`: Development overrides
- `src/config/config.prod.ts`: Production overrides
- `src/config/index.ts`: Auto-selects based on `__DEV__` flag

### Environment Variables
Supabase credentials are stored in `.env` and must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## Testing

- **Jest**: Unit and integration tests
- **Maestro**: E2E tests in `.maestro/flows/` directory
- Test setup: `test/setup.ts`
- Run single test: `npm test -- <test-name>`

## Debugging

- **Reactotron**: Configured in `src/devtools/ReactotronConfig.ts`
  - Only loads in development (`__DEV__`)
  - Separate web configuration available
- **Console logs**: Check Metro bundler output or device logs

## User Roles & Permissions

The app supports multiple user roles with different capabilities:
- **customer**: Default role, can browse and purchase
- **seller**: Can manage products and orders (retailers, importers, wholesalers)
- **admin**: Full access to platform management
- **freelancer**: Access to freelance marketplace features

Role-based UI components and navigation are managed through AuthContext.

## Database Schema Notes

Key tables (see `src/services/supabase/types.ts` for full schema):
- `profiles`: User profiles with role and seller information
- `products`: Product catalog with pricing, categories, seller info
- `cart_items`: Shopping cart items per user
- `orders`: Customer orders with status tracking
- `order_items`: Individual items within orders

## Important Development Notes

- Always use path aliases (`@/`) for internal imports
- Follow the service layer pattern for all Supabase operations
- Keep business logic in services, not in components
- Use TypeScript strict mode - no implicit any
- Maintain alphabetical import ordering
- Test on both iOS and Android before committing
- Use EAS builds for testing on physical devices or simulators
