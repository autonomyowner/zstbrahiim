# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZST is a luxury perfume e-commerce website with an integrated freelance marketplace, built for a boutique in Bouzareah, Algeria. The site features:
1. **E-commerce**: Women's perfumes (home page) and men's perfumes (services page)
2. **Marketplace**: Fiverr/Upwork-style platform for freelancers to offer services (web development, design, video editing, marketing, etc.)

**Tech Stack:**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- React 18
- Radix UI (for components like sliders)

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture & Key Concepts

### Product Data Structure

Products are centrally managed in `src/data/products.ts`:
- **womenPerfumes**: Array of women's perfumes (displayed on home page - purple boutique theme)
- **menPerfumes**: Array of men's perfumes (displayed on services page)
- **products**: Combined array of both for backward compatibility

Each product has:
- Basic info: id, slug, name, brand, price, images
- Classification: productType (Parfum Femme/Homme/Eau de Parfum/Toilette), need (Journée/Soirée/Quotidien/Spécial)
- E-commerce fields: inStock, isPromo, isNew, rating, viewersCount, countdownEndDate
- Content: description, benefits, ingredients, usageInstructions
- Business: deliveryEstimate, additionalInfo (shipping, returns, payment, exclusiveOffers)

### Layout & Styling

**Global Layout** (`src/app/layout.tsx`):
- Uses three Google Fonts: Inter (body), Playfair Display (headings), Great Vibes (artistic elements)
- Global gradient background: `bg-gradient-elegant` (slate-900 → red-900 → slate-900)
- Fixed structure: Navbar (fixed top) → main content (with padding) → footer → WhatsApp button

**Design Theme**:
- Premium/luxury aesthetic with gradient backgrounds
- Custom Tailwind color palette includes kitchen colors and luxury dark green tones
- **Important**: User has specified NEVER to use icons in design
- Font classes: `font-elegant` (Playfair), `font-modern` (Inter), `font-artistic` (Great Vibes)

### Page Structure

**E-commerce Pages:**
- `/` (page.tsx): Home page showing women's perfumes
- `/services` (services/page.tsx): Services page showing men's perfumes
- `/products/[id]` (products/[id]/page.tsx): Dynamic product detail pages
- `/signin`, `/signup`: Authentication pages with logo.png as background
- Custom 404 (not-found.tsx) and 500 (pages/500.tsx) error pages

**Marketplace Pages:**
- `/marketplace` (marketplace/page.tsx): Main marketplace with search, filters, and service listings
- `/marketplace/[slug]` (marketplace/[slug]/page.tsx): Individual service detail pages with provider info and portfolio

### Component Organization

Components in `src/components/`:
- **Navigation**: Navbar.tsx (sticky header with marketplace link), WhatsAppButton.tsx (floating button)
- **Product Display**: ProductGrid.tsx, ProductDetails.tsx, ProductGallery.tsx, ProductControls.tsx, ProductFocus.tsx
- **Marketplace**: ServiceCard.tsx (freelance service card), MarketplaceFilters.tsx (category/experience/availability filters)
- **UI Elements**: BudgetSlider.tsx, DualRangeSlider.tsx, ShopFilters.tsx, QuantitySelector.tsx
- **Sections**: HeroSection.tsx, ServicesPreview.tsx, ServicesList.tsx, TestimonialsSection.tsx, etc.
- **Interactive**: CheckoutModal.tsx, CountdownTimer.tsx, ImageCarousel.tsx, Accordion.tsx

### SEO & Metadata

The site targets: "Parfums de luxe et fragrances authentiques à Bouzareah"
- Full OpenGraph and Twitter card metadata in layout.tsx
- Keywords: parfum, parfums de luxe, fragrances authentiques, Bouzareah, parfumerie
- Domain: https://brahim-perfum.com
- Locale: fr_DZ (French - Algeria)

### Contact & Business Info

- WhatsApp: +213 79 733 94 51
- Email: contact@brahim-perfum.com
- Location: Bouzareah, Algérie
- Delivery: All 58 wilayas of Algeria
- Free shipping threshold: 20,000 DA
- Shipping time: 24-48h, delivery 2-3 days

## Code Patterns

**TypeScript**: All components use TypeScript with proper type definitions
**Component Style**: Functional components with const declarations
**Naming**: Event handlers prefixed with "handle" (e.g., handleAddToCart)
**Styling**: Tailwind CSS utility classes, custom gradients via bg-gradient-elegant
**Images**: Use Next.js Image component for optimization (configured for via.placeholder.com domain)

## Data Management

### Freelance Marketplace Data Structure

Freelance services are managed in `src/data/freelance-services.ts`:
- **freelanceServices**: Array of all service offerings
- **ServiceCategory**: 8 categories (Développement Web, Design Graphique, Montage Vidéo, Marketing Digital, Rédaction, Photographie, Traduction, Consultation)
- **ExperienceLevel**: Débutant | Intermédiaire | Expert

Each service has:
- Provider info: providerName, providerAvatar, experienceLevel, verified, topRated
- Service details: serviceTitle, shortDescription, description, category, skills[]
- Pricing: price, priceType (starting-at | hourly | fixed)
- Portfolio: array of portfolio items with title, image, description
- Business: deliveryTime, revisions, languages[], availability, responseTime
- Stats: rating, reviewsCount, completedProjects
- Featured flag for highlighting on marketplace homepage

**Key Features:**
- Search functionality across title, provider, category, and skills
- Multi-filter system (category, experience level, availability)
- WhatsApp integration for direct contact with providers
- Responsive card layout with hover effects

### Adding New Products (Perfumes)

1. Open `src/data/products.ts`
2. Add to `womenPerfumes` or `menPerfumes` array following the Product type structure
3. Ensure all required fields are filled (id, slug, name, brand, price, image, images[], category, productType, inStock, isPromo, description, benefits[], ingredients, usageInstructions, deliveryEstimate, viewersCount, additionalInfo)
4. Images should be in `/perfums/` directory
5. Use consistent pricing (DA - Algerian Dinar)

### Adding New Freelance Services

1. Open `src/data/freelance-services.ts`
2. Add to `freelanceServices` array following the FreelanceService type structure
3. Ensure all required fields are populated, especially:
   - Unique id and slug (slug is used in URL: `/marketplace/[slug]`)
   - Category must match one of the 8 defined ServiceCategory types
   - Skills array for filtering/search
   - Portfolio items (at least 2-3 for credibility)
4. Set `featured: true` to display on marketplace homepage featured section
5. Provider avatars should be in `/avatars/` directory
6. Portfolio images should be in `/portfolio/` directory

## Design Guidelines

- **No icons** - User preference to avoid icons in the design
- Maintain luxury/premium aesthetic with gradients and elegant fonts
- Responsive design - mobile-first approach
- **Color Schemes**:
  - **E-commerce**: dark green (#2E8B57), lime green (#9AFE2E), slate tones
  - **Marketplace**: kitchen-lux-dark-green palette (50-950 shades) for consistency
- Footer uses green gradient: `linear-gradient(to right, #2E8B57 0%, #9AFE2E 50%, #2E8B57 100%)`
- Footer credit: "Made by www.sitedz.store"

## Navigation Structure

The Navbar has a two-tier system:
- **Top bar**: Links to Services (left), Marketplace (center), Sellers (right)
- **Main nav**: Sign In/Up buttons (with logo.png), Boutique links, ZST brand (center with fade animation)

Marketplace is accessible from top navigation and integrated seamlessly with the e-commerce site.
