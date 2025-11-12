// Products API service - matches existing frontend data format exactly
import { supabase } from './client'
import type {
  Product,
  ProductWithImages,
  ProductFilters,
  SortOption,
  CreateProductRequest,
  UpdateProductRequest,
} from './types'

// Adapter to convert database format to frontend format
const adaptProduct = (dbProduct: Product, images: { image_url: string }[]): any => {
  const imageUrls = images.map(img => img.image_url)

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    brand: dbProduct.brand,
    price: Number(dbProduct.price),
    originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
    image: imageUrls[0] || '',
    images: imageUrls,
    category: dbProduct.category,
    productType: dbProduct.product_type,
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
    additionalInfo: {
      shipping: dbProduct.shipping_info,
      returns: dbProduct.returns_info,
      payment: dbProduct.payment_info,
      exclusiveOffers: dbProduct.exclusive_offers,
    },
  }
}

// Get all products with optional filters
export const getProducts = async (filters?: ProductFilters): Promise<any[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
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

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    // Adapt products to frontend format
    return (data || []).map((product: any) =>
      adaptProduct(product, (product as any).product_images || [])
    )
  } catch (error) {
    console.error('Error in getProducts:', error)
    return []
  }
}

// Get women's perfumes
export const getWomenPerfumes = async (): Promise<any[]> => {
  return getProducts({
    product_category: 'perfume',
    product_type: 'Parfum Femme',
  })
}

// Get men's perfumes
export const getMenPerfumes = async (): Promise<any[]> => {
  return getProducts({
    product_category: 'perfume',
    product_type: 'Parfum Homme',
  })
}

// Get winter clothes
export const getWinterClothes = async (): Promise<any[]> => {
  return getProducts({
    product_category: 'clothing',
  })
}

// Get product by ID
export const getProductById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
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

    return adaptProduct(data, (data as any).product_images || [])
  } catch (error) {
    console.error('Error in getProductById:', error)
    return null
  }
}

// Export with different name for use in product page
export const getProductByIdFromDb = getProductById

// Get product by slug
export const getProductBySlug = async (slug: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
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

    return adaptProduct(data, (data as any).product_images || [])
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
export const searchProducts = async (query: string, filters?: ProductFilters): Promise<any[]> => {
  try {
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary,
          display_order
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

    return (data || []).map((product: any) =>
      adaptProduct(product, (product as any).product_images || [])
    )
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return []
  }
}

// Sort products
export const sortProducts = (products: any[], sortBy: SortOption): any[] => {
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

    const uniqueBrands = [...new Set(data?.map((p: any) => p.brand) || [])]
    return uniqueBrands.filter((brand): brand is string => typeof brand === 'string')
  } catch (error) {
    console.error('Error in getBrands:', error)
    return []
  }
}
