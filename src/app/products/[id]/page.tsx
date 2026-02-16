'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { getProductById, type Product } from '@/data/products'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductDetails } from '@/components/ProductDetails'

function isValidConvexId(id: string): boolean {
  // Convex IDs are typically base64-like strings; static IDs are slugs with dashes
  // We try Convex query and rely on it returning null for invalid IDs
  // But we skip obviously non-Convex IDs (e.g., purely numeric or slug-like)
  return !id.includes('-') && id.length > 10
}

export default function ProductPage() {
  const params = useParams()
  const id = params?.id as string

  // Try static data first
  const staticProduct = useMemo(() => (id ? getProductById(id) : undefined), [id])

  // Only query Convex if no static product found and the ID looks like a Convex ID
  const shouldQueryConvex = !staticProduct && id && isValidConvexId(id)
  const convexProduct = useQuery(
    api.products.getProductById,
    shouldQueryConvex ? { productId: id as Id<"products"> } : 'skip'
  )

  const incrementViewers = useMutation(api.products.incrementViewersCount)

  // Increment viewers count on mount for Convex products
  useEffect(() => {
    if (shouldQueryConvex && id) {
      incrementViewers({ productId: id as Id<"products"> }).catch(() => {})
    }
  }, [id, shouldQueryConvex, incrementViewers])

  // Determine final product
  const product: Product | null | undefined = useMemo(() => {
    if (staticProduct) return staticProduct

    if (!shouldQueryConvex) return null // Not a valid Convex ID and no static product

    if (convexProduct === undefined) return undefined // Still loading

    if (convexProduct === null) return null // Not found

    // Map Convex product to Product type for compatibility with ProductDetails/ProductGallery
    return {
      id: convexProduct._id,
      slug: convexProduct.slug,
      name: convexProduct.name,
      brand: convexProduct.brand,
      price: convexProduct.price,
      originalPrice: convexProduct.originalPrice,
      image: convexProduct.image,
      images: convexProduct.images,
      category: convexProduct.category,
      productType: convexProduct.productType,
      need: convexProduct.need,
      inStock: convexProduct.inStock,
      isPromo: convexProduct.isPromo,
      rating: convexProduct.rating,
      isNew: convexProduct.isNew,
      description: convexProduct.description,
      benefits: convexProduct.benefits,
      ingredients: convexProduct.ingredients,
      usageInstructions: convexProduct.usageInstructions,
      deliveryEstimate: convexProduct.deliveryEstimate,
      viewersCount: convexProduct.viewersCount,
      countdownEndDate: convexProduct.countdownEndDate,
      sellerCategory: convexProduct.sellerCategory,
      additionalInfo: {
        shipping: convexProduct.shippingInfo,
        returns: convexProduct.returnsInfo,
        payment: convexProduct.paymentInfo,
        exclusiveOffers: convexProduct.exclusiveOffers,
      },
      video: convexProduct.video ? {
        url: convexProduct.video.url,
        thumbnailUrl: convexProduct.video.thumbnailUrl,
        durationSeconds: convexProduct.video.durationSeconds,
        fileSizeBytes: convexProduct.video.fileSizeBytes,
      } : undefined,
    } as Product
  }, [staticProduct, shouldQueryConvex, convexProduct])

  // Loading state
  if (product === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-cardMuted">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/[0.03] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/[0.02] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative px-4 py-20 sm:py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 sm:mb-8">
              <div className="h-4 w-48 bg-brand-border/30 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
              <div className="aspect-square bg-brand-border/20 rounded-2xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-brand-border/30 rounded animate-pulse" />
                <div className="h-6 w-1/2 bg-brand-border/20 rounded animate-pulse" />
                <div className="h-10 w-1/3 bg-brand-border/30 rounded animate-pulse" />
                <div className="h-4 w-full bg-brand-border/20 rounded animate-pulse" />
                <div className="h-4 w-full bg-brand-border/20 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-brand-border/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not found
  if (product === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-cardMuted flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/[0.03] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/[0.02] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative text-center px-4">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Produit introuvable</h1>
          <p className="text-text-muted mb-8">Le produit que vous recherchez n&apos;existe pas ou a ete supprime.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-brand-primary text-brand-dark font-semibold rounded-xl hover:bg-brand-primaryDark transition-colors"
          >
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-cardMuted">
      {/* Subtle decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/[0.03] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/[0.02] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative px-0 sm:px-4 py-4 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-3 sm:mb-6 animate-fade-in px-4 sm:px-0">
            <Link href="/" className="sm:hidden text-[13px] text-text-muted hover:text-text-primary transition-colors min-h-[44px] inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Retour
            </Link>
            <ol className="hidden sm:flex items-center gap-1.5 text-[13px] text-text-muted">
              <li>
                <Link href="/" className="hover:text-text-primary transition-colors">Accueil</Link>
              </li>
              <li className="text-brand-border/60">/</li>
              <li>
                <Link href="/" className="hover:text-text-primary transition-colors">Produits</Link>
              </li>
              <li className="text-brand-border/60">/</li>
              <li className="text-text-secondary font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-16">
            {/* Left Column - Product Gallery - edge-to-edge on mobile */}
            <div className="lg:sticky lg:top-24 lg:self-start animate-slide-up sm:px-4 lg:px-0">
              <ProductGallery
                images={product.images}
                productName={product.name}
                video={product.video?.url && product.video?.thumbnailUrl && product.video?.durationSeconds && product.video?.fileSizeBytes ? {
                  url: product.video.url,
                  thumbnailUrl: product.video.thumbnailUrl,
                  durationSeconds: product.video.durationSeconds,
                  fileSizeBytes: product.video.fileSizeBytes,
                } : undefined}
              />
            </div>

            {/* Right Column - Product Details */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="lg:pl-4 xl:pl-8">
                <ProductDetails product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
