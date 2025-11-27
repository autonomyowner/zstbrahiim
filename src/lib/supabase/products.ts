// Products API service - matches existing frontend data format exactly
import { supabase } from './client'
import type {
  Product,
  ProductWithImages,
  ProductFilters,
  SortOption,
  CreateProductRequest,
  UpdateProductRequest,
  ProductVideo,
  SellerCategory,
  ProductCategoryType,
} from './types'
import { deleteProductVideo } from './productVideos'

type ProductQueryOptions = {
  sellerCategories?: SellerCategory[]
  limit?: number
  offset?: number
}

export type PaginatedProducts = {
  products: AdaptedProduct[]
  total: number
  hasMore: boolean
}

// Simple in-memory cache for products (5 minute TTL)
const CACHE_TTL = 5 * 60 * 1000
const productCache = new Map<string, { data: AdaptedProduct[]; timestamp: number }>()

const getCacheKey = (filters?: ProductFilters, options?: ProductQueryOptions): string => {
  return JSON.stringify({ filters, options })
}

const getFromCache = (key: string): AdaptedProduct[] | null => {
  const cached = productCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  productCache.delete(key)
  return null
}

const setCache = (key: string, data: AdaptedProduct[]): void => {
  productCache.set(key, { data, timestamp: Date.now() })
}

// Adapted product type for frontend display (camelCase)
export type AdaptedProduct = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  productType: string
  product_category?: ProductCategoryType
  need: string | null
  inStock: boolean
  isPromo: boolean
  rating?: number
  isNew?: boolean | null
  description: string
  benefits: string[]
  ingredients: string
  usageInstructions: string
  deliveryEstimate: string
  viewersCount: number
  countdownEndDate: string | null
  createdAt: string
  seller_id: string | null
  sellerCategory: SellerCategory | null
  minQuantity: number
  additionalInfo: {
    shipping: string
    returns: string
    payment: string
    exclusiveOffers: string | null
  }
  video?: {
    url: string | undefined
    thumbnailUrl: string | undefined
    durationSeconds: number | undefined
    fileSizeBytes: number | undefined
  }
}

// Adapter to convert database format to frontend format
const adaptProduct = (
  dbProduct: Product,
  images: { image_url: string }[],
  video?: Partial<ProductVideo> | null
): AdaptedProduct => {
  const imageUrls = images.map((img) => img.image_url)
  const enhancedVideo = video
    ? {
        url: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        durationSeconds: video.duration_seconds,
        fileSizeBytes: video.file_size_bytes,
      }
    : undefined
  const primaryImage = imageUrls[0] || enhancedVideo?.thumbnailUrl || ''

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    brand: dbProduct.brand,
    price: Number(dbProduct.price),
    originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
    image: primaryImage,
    images: imageUrls,
    category: dbProduct.category,
    productType: dbProduct.product_type,
    product_category: dbProduct.product_category, // Add for filtering
    need: dbProduct.need,
    inStock: dbProduct.in_stock,
    isPromo: dbProduct.is_promo,
    rating: dbProduct.rating ? Number(dbProduct.rating) : undefined,
    isNew: dbProduct.is_new,
    description: dbProduct.description,
    benefits: dbProduct.benefits,
    ingredients: dbProduct.ingredients,
    usageInstructions: dbProduct.usage_instructions,
    deliveryEstimate: dbProduct.delivery_estimate,
    viewersCount: dbProduct.viewers_count,
    countdownEndDate: dbProduct.countdown_end_date,
    createdAt: dbProduct.created_at,
    seller_id: dbProduct.seller_id || null, // Add for checkout
    sellerCategory: dbProduct.seller_category ?? null,
    minQuantity: dbProduct.min_quantity ?? 1,
    additionalInfo: {
      shipping: dbProduct.shipping_info,
      returns: dbProduct.returns_info,
      payment: dbProduct.payment_info,
      exclusiveOffers: dbProduct.exclusive_offers,
    },
    video: enhancedVideo,
  }
}

// Get all products with optional filters
export const getProducts = async (
  filters?: ProductFilters,
  options?: ProductQueryOptions
): Promise<AdaptedProduct[]> => {
  // Check cache first
  const cacheKey = getCacheKey(filters, options)
  const cached = getFromCache(cacheKey)
  if (cached) {
    return cached
  }

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
        ),
        product_videos (
          video_url,
          video_storage_path,
          thumbnail_url,
          thumbnail_storage_path,
          duration_seconds,
          file_size_bytes
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.product_type) {
      if (Array.isArray(filters.product_type)) {
        query = query.in('product_type', filters.product_type)
      } else {
        query = query.eq('product_type', filters.product_type)
      }
    }

    if (filters?.product_category) {
      query = query.eq('product_category', filters.product_category)
    }

    if (filters?.need) {
      if (Array.isArray(filters.need)) {
        query = query.in('need', filters.need)
      } else {
        query = query.eq('need', filters.need)
      }
    }

    if (filters?.in_stock !== undefined) {
      query = query.eq('in_stock', filters.in_stock)
    }

    if (filters?.is_promo !== undefined) {
      query = query.eq('is_promo', filters.is_promo)
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price', filters.min_price)
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price', filters.max_price)
    }

    if (filters?.brand) {
      if (Array.isArray(filters.brand)) {
        query = query.in('brand', filters.brand)
      } else {
        query = query.eq('brand', filters.brand)
      }
    }

    if (options?.sellerCategories?.length) {
      query = query.in('seller_category', options.sellerCategories)
    }

    // Apply pagination
    const limit = options?.limit || 50
    const offset = options?.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    // Adapt products to frontend format
    const adaptedProducts = (data || []).map((product) => {
      const typedProduct = product as unknown as Product & {
        product_images?: { image_url: string; is_primary: boolean; display_order: number }[]
        product_videos?: Partial<ProductVideo>[]
      }
      return adaptProduct(
        typedProduct,
        typedProduct.product_images || [],
        typedProduct.product_videos?.[0] || null
      )
    })

    // Cache the results
    setCache(cacheKey, adaptedProducts)

    return adaptedProducts
  } catch (error) {
    console.error('Error in getProducts:', error)
    return []
  }
}

// Get only the authenticated seller's products (for seller dashboard)
export const getSellerProducts = async (filters?: ProductFilters): Promise<AdaptedProduct[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user found')
      return []
    }

    // Query from seller_products_view which automatically filters by seller_id
    let query = supabase
      .from('seller_products_view')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters (same as getProducts)
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.product_type) {
      if (Array.isArray(filters.product_type)) {
        query = query.in('product_type', filters.product_type)
      } else {
        query = query.eq('product_type', filters.product_type)
      }
    }

    if (filters?.product_category) {
      query = query.eq('product_category', filters.product_category)
    }

    if (filters?.need) {
      if (Array.isArray(filters.need)) {
        query = query.in('need', filters.need)
      } else {
        query = query.eq('need', filters.need)
      }
    }

    if (filters?.in_stock !== undefined) {
      query = query.eq('in_stock', filters.in_stock)
    }

    if (filters?.is_promo !== undefined) {
      query = query.eq('is_promo', filters.is_promo)
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price', filters.min_price)
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price', filters.max_price)
    }

    if (filters?.brand) {
      if (Array.isArray(filters.brand)) {
        query = query.in('brand', filters.brand)
      } else {
        query = query.eq('brand', filters.brand)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching seller products:', error)
      throw error
    }

    // Get product images/videos separately from dedicated views/tables
    const productIds = (data || []).map((p) => (p as { id: string }).id)

    const productImagesMap: Record<string, { image_url: string }[]> = {}
    const productVideosMap: Record<string, Partial<ProductVideo> | null> = {}
    
    if (productIds.length > 0) {
      const [{ data: images, error: imagesError }, { data: videos, error: videosError }] =
        await Promise.all([
          supabase
            .from('seller_product_images_view')
            .select('*')
            .in('product_id', productIds)
            .order('display_order', { ascending: true }),
          supabase.from('product_videos').select('*').in('product_id', productIds),
        ])

      if (!imagesError && images) {
        images.forEach((img) => {
          const typedImg = img as { product_id: string; image_url: string }
          if (!productImagesMap[typedImg.product_id]) {
            productImagesMap[typedImg.product_id] = []
          }
          productImagesMap[typedImg.product_id].push(typedImg)
        })
      }

      if (!videosError && videos) {
        videos.forEach((video) => {
          productVideosMap[video.product_id] = video
        })
      }
    }
    
    // Adapt products to frontend format with their images & video
    return (data || []).map((product) => {
      const typedProduct = product as Product
      return adaptProduct(typedProduct, productImagesMap[typedProduct.id] || [], productVideosMap[typedProduct.id])
    })
  } catch (error) {
    console.error('Error in getSellerProducts:', error)
    return []
  }
}

// Get women's perfumes
export const getWomenPerfumes = async (): Promise<AdaptedProduct[]> => {
  return getProducts({
    product_category: 'perfume',
    product_type: 'Parfum Femme',
  })
}

// Get men's perfumes
export const getMenPerfumes = async (): Promise<AdaptedProduct[]> => {
  return getProducts({
    product_category: 'perfume',
    product_type: 'Parfum Homme',
  })
}

// Get winter clothes
export const getWinterClothes = async (): Promise<AdaptedProduct[]> => {
  return getProducts({
    product_category: 'clothing',
  })
}

// Get product by ID
export const getProductById = async (id: string): Promise<AdaptedProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
        ),
        product_videos (
          video_url,
          video_storage_path,
          thumbnail_url,
          thumbnail_storage_path,
          duration_seconds,
          file_size_bytes
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product by ID:', error)
      return null
    }

    if (!data) return null

    // Increment viewers count
    await incrementViewersCount(id)

    const typedData = data as unknown as Product & {
      product_images?: { image_url: string }[]
      product_videos?: Partial<ProductVideo>[]
    }

    return adaptProduct(
      typedData,
      typedData.product_images || [],
      typedData.product_videos?.[0] || null
    )
  } catch (error) {
    console.error('Error in getProductById:', error)
    return null
  }
}

// Export with different name for use in product page
export const getProductByIdFromDb = getProductById

// Get product by slug
export const getProductBySlug = async (slug: string): Promise<AdaptedProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
        ),
        product_videos (
          video_url,
          video_storage_path,
          thumbnail_url,
          thumbnail_storage_path,
          duration_seconds,
          file_size_bytes
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }

    if (!data) return null

    // Increment viewers count
    await incrementViewersCount(data.id)

    const typedData = data as unknown as Product & {
      product_images?: { image_url: string }[]
      product_videos?: Partial<ProductVideo>[]
    }

    return adaptProduct(
      typedData,
      typedData.product_images || [],
      typedData.product_videos?.[0] || null
    )
  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return null
  }
}

// Increment viewers count
export const incrementViewersCount = async (productId: string): Promise<void> => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('viewers_count')
      .eq('id', productId)
      .single()

    if (product) {
      await supabase
        .from('products')
        .update({ viewers_count: product.viewers_count + 1 })
        .eq('id', productId)
    }
  } catch (error) {
    // Silent fail - not critical
    console.error('Error incrementing viewers count:', error)
  }
}

// Search products
export const searchProducts = async (query: string, filters?: ProductFilters): Promise<AdaptedProduct[]> => {
  try {
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
        ),
        product_videos (
          video_url,
          video_storage_path,
          thumbnail_url,
          thumbnail_storage_path,
          duration_seconds,
          file_size_bytes
        )
      `)

    // Text search in name, brand, description
    if (query) {
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Apply additional filters
    if (filters?.product_category) {
      dbQuery = dbQuery.eq('product_category', filters.product_category)
    }

    if (filters?.in_stock !== undefined) {
      dbQuery = dbQuery.eq('in_stock', filters.in_stock)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Error searching products:', error)
      throw error
    }

    return (data || []).map((product) => {
      const typedProduct = product as unknown as Product & {
        product_images?: { image_url: string }[]
        product_videos?: Partial<ProductVideo>[]
      }
      return adaptProduct(
        typedProduct,
        typedProduct.product_images || [],
        typedProduct.product_videos?.[0] || null
      )
    })
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return []
  }
}

// Sort products
export const sortProducts = (products: AdaptedProduct[], sortBy: SortOption): AdaptedProduct[] => {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
    case 'highest-rated':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'best-sellers':
      return sorted.sort((a, b) => (b.viewersCount || 0) - (a.viewersCount || 0))
    default:
      return sorted
  }
}

// Admin functions - Create product
export const createProduct = async (productData: CreateProductRequest): Promise<string | null> => {
  try {
    const { images, ...productFields } = productData

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...productFields,
        viewers_count: 0,
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating product:', productError)
      throw productError
    }

    // Insert images
    if (images && images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRecords)

      if (imagesError) {
        console.error('Error creating product images:', imagesError)
        // Rollback product creation
        await supabase.from('products').delete().eq('id', product.id)
        throw imagesError
      }
    }

    return product.id
  } catch (error) {
    console.error('Error in createProduct:', error)
    return null
  }
}

// Admin functions - Update product
export const updateProduct = async (updateData: UpdateProductRequest): Promise<boolean> => {
  try {
    const { id, images, ...productFields } = updateData

    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update(productFields)
      .eq('id', id)

    if (productError) {
      console.error('Error updating product:', productError)
      throw productError
    }

    // Update images if provided
    if (images && images.length > 0) {
      // Delete old images
      await supabase.from('product_images').delete().eq('product_id', id)

      // Insert new images
      const imageRecords = images.map((url, index) => ({
        product_id: id,
        image_url: url,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRecords)

      if (imagesError) {
        console.error('Error updating product images:', imagesError)
        throw imagesError
      }
    }

    return true
  } catch (error) {
    console.error('Error in updateProduct:', error)
    return false
  }
}

// Admin functions - Delete product
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    await deleteProductVideo(productId)

    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteProduct:', error)
    return false
  }
}

// Get unique brands
export const getBrands = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .order('brand')

    if (error) {
      console.error('Error fetching brands:', error)
      return []
    }

    const uniqueBrands = [...new Set(data?.map((p) => (p as { brand: string }).brand) || [])]
    return uniqueBrands.filter((brand): brand is string => typeof brand === 'string')
  } catch (error) {
    console.error('Error in getBrands:', error)
    return []
  }
}
