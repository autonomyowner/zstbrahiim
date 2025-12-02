import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductById, type Product } from '@/data/products'
import { type AdaptedProduct } from '@/lib/supabase/products'
import { supabaseAdmin } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductDetails } from '@/components/ProductDetails'
import type { SellerCategory, ProductCategoryType } from '@/lib/supabase/types'

type ProductPageProps = {
  params: Promise<{
    id: string
  }>
}

// Server-side function to get product by ID (bypasses RLS for viewing)
async function getProductByIdServer(id: string): Promise<AdaptedProduct | null> {
  try {
    // Fetch product
    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (productError || !productData) {
      return null
    }

    // Fetch images separately
    const { data: imagesData } = await supabaseAdmin
      .from('product_images')
      .select('image_url, is_primary, display_order')
      .eq('product_id', id)
      .order('display_order', { ascending: true })

    // Fetch video separately
    const { data: videosData } = await supabaseAdmin
      .from('product_videos')
      .select('video_url, thumbnail_url, duration_seconds, file_size_bytes')
      .eq('product_id', id)
      .limit(1)

    // Increment viewers count
    await supabaseAdmin
      .from('products')
      .update({ viewers_count: (productData.viewers_count || 0) + 1 })
      .eq('id', id)

    const images = imagesData || []
    const video = videosData?.[0]
    const imageUrls = images.map((img) => img.image_url)
    const primaryImage = imageUrls[0] || video?.thumbnail_url || ''

    return {
      id: productData.id,
      slug: productData.slug,
      name: productData.name,
      brand: productData.brand,
      price: Number(productData.price),
      originalPrice: productData.original_price ? Number(productData.original_price) : undefined,
      image: primaryImage,
      images: imageUrls,
      category: productData.category,
      productType: productData.product_type,
      product_category: productData.product_category as ProductCategoryType | undefined,
      need: productData.need,
      inStock: productData.in_stock,
      isPromo: productData.is_promo,
      rating: productData.rating ? Number(productData.rating) : undefined,
      isNew: productData.is_new,
      description: productData.description,
      benefits: productData.benefits,
      ingredients: productData.ingredients,
      usageInstructions: productData.usage_instructions,
      deliveryEstimate: productData.delivery_estimate,
      viewersCount: productData.viewers_count,
      countdownEndDate: productData.countdown_end_date,
      createdAt: productData.created_at,
      seller_id: productData.seller_id || null,
      sellerCategory: (productData.seller_category as SellerCategory) ?? null,
      minQuantity: productData.min_quantity ?? 1,
      additionalInfo: {
        shipping: productData.shipping_info,
        returns: productData.returns_info,
        payment: productData.payment_info,
        exclusiveOffers: productData.exclusive_offers,
      },
      video: video ? {
        url: video.video_url ?? undefined,
        thumbnailUrl: video.thumbnail_url ?? undefined,
        durationSeconds: video.duration_seconds ?? undefined,
        fileSizeBytes: video.file_size_bytes ?? undefined,
      } : undefined,
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps): Promise<JSX.Element> {
  const resolvedParams = await params

  // Try to get product from static data first, then from database
  let product: Product | AdaptedProduct | undefined = getProductById(resolvedParams.id)

  if (!product) {
    // Try to get from database using server-side admin client
    const dbProduct = await getProductByIdServer(resolvedParams.id)
    if (dbProduct) product = dbProduct
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-cardMuted">
      {/* Subtle decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/[0.03] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/[0.02] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative px-4 py-20 sm:py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8 animate-fade-in">
            <ol className="flex items-center gap-2 text-sm text-text-muted">
              <li>
                <Link href="/" className="hover:text-brand-primaryDark transition-colors">Accueil</Link>
              </li>
              <li className="text-brand-border">/</li>
              <li>
                <Link href="/" className="hover:text-brand-primaryDark transition-colors">Produits</Link>
              </li>
              <li className="text-brand-border">/</li>
              <li className="text-text-secondary font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Left Column - Product Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start animate-slide-up">
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

