// Data Migration Script: Migrate existing static data to Supabase
// Run with: npx tsx scripts/migrate-data.ts

import { createClient } from '@supabase/supabase-js'
import { womenPerfumes, menPerfumes } from '../src/data/products'
import { winterClothes } from '../src/data/winter-clothes'
import { freelanceServices } from '../src/data/freelance-services'

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Migrate products (perfumes and winter clothes)
async function migrateProducts() {
  console.log('\n📦 Migrating Products...')

  const allProducts = [
    ...womenPerfumes.map(p => ({ ...p, product_category: 'perfume' as const })),
    ...menPerfumes.map(p => ({ ...p, product_category: 'perfume' as const })),
    ...winterClothes.map(p => ({ ...p, product_category: 'clothing' as const })),
  ]

  let successCount = 0
  let errorCount = 0

  for (const product of allProducts) {
    try {
      // Insert product
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert({
          id: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: product.price,
          original_price: product.originalPrice || product.price,
          category: product.category,
          product_type: product.productType,
          product_category: product.product_category,
          need: product.need || null,
          in_stock: product.inStock,
          is_promo: product.isPromo,
          is_new: product.isNew || false,
          rating: product.rating || null,
          viewers_count: product.viewersCount || 0,
          countdown_end_date: product.countdownEndDate || null,
          description: product.description,
          benefits: product.benefits,
          ingredients: product.ingredients,
          usage_instructions: product.usageInstructions,
          delivery_estimate: product.deliveryEstimate,
          shipping_info: product.additionalInfo.shipping,
          returns_info: product.additionalInfo.returns,
          payment_info: product.additionalInfo.payment,
          exclusive_offers: product.additionalInfo.exclusiveOffers || null,
        })
        .select()
        .single()

      if (productError) {
        console.error(`❌ Error inserting product ${product.name}:`, productError.message)
        errorCount++
        continue
      }

      // Insert product images
      const images = product.images.map((imageUrl: string, index: number) => ({
        product_id: insertedProduct.id,
        image_url: imageUrl,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(images)

      if (imagesError) {
        console.error(`❌ Error inserting images for ${product.name}:`, imagesError.message)
        errorCount++
      } else {
        console.log(`✅ Migrated: ${product.name}`)
        successCount++
      }

      await sleep(100) // Rate limiting
    } catch (error) {
      console.error(`❌ Unexpected error for ${product.name}:`, error)
      errorCount++
    }
  }

  console.log(`\n📊 Products Migration Complete: ${successCount} succeeded, ${errorCount} failed`)
}

// Migrate freelance services
async function migrateFreelanceServices() {
  console.log('\n👨‍💼 Migrating Freelance Services...')

  let successCount = 0
  let errorCount = 0

  for (const service of freelanceServices) {
    try {
      // First, create a user profile for the provider if it doesn't exist
      const providerId = `provider-${service.id}`

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: providerId,
          email: `${service.slug}@zst-providers.local`,
          full_name: service.providerName,
          provider_name: service.providerName,
          provider_avatar: service.providerAvatar,
          role: 'seller',
        })

      if (profileError) {
        console.error(`❌ Error creating provider profile for ${service.providerName}:`, profileError.message)
        errorCount++
        continue
      }

      // Insert service
      const { data: insertedService, error: serviceError } = await supabase
        .from('freelance_services')
        .insert({
          id: service.id,
          slug: service.slug,
          provider_id: providerId,
          service_title: service.serviceTitle,
          category: service.category,
          experience_level: service.experienceLevel,
          rating: service.rating,
          reviews_count: service.reviewsCount,
          completed_projects: service.completedProjects,
          response_time: service.responseTime,
          price: service.price,
          price_type: service.priceType,
          description: service.description,
          short_description: service.shortDescription,
          skills: service.skills,
          delivery_time: service.deliveryTime,
          revisions: typeof service.revisions === 'number' ? String(service.revisions) : service.revisions,
          languages: service.languages,
          availability: service.availability,
          featured: service.featured || false,
          verified: service.verified || false,
          top_rated: service.topRated || false,
        })
        .select()
        .single()

      if (serviceError) {
        console.error(`❌ Error inserting service ${service.serviceTitle}:`, serviceError.message)
        errorCount++
        continue
      }

      // Insert portfolio items
      const portfolioItems = service.portfolio.map((item, index) => ({
        service_id: insertedService.id,
        title: item.title,
        description: item.description,
        image_url: item.image,
        display_order: index,
      }))

      const { error: portfolioError } = await supabase
        .from('freelance_portfolios')
        .insert(portfolioItems)

      if (portfolioError) {
        console.error(`❌ Error inserting portfolio for ${service.serviceTitle}:`, portfolioError.message)
        errorCount++
      } else {
        console.log(`✅ Migrated: ${service.serviceTitle}`)
        successCount++
      }

      await sleep(100) // Rate limiting
    } catch (error) {
      console.error(`❌ Unexpected error for ${service.serviceTitle}:`, error)
      errorCount++
    }
  }

  console.log(`\n📊 Services Migration Complete: ${successCount} succeeded, ${errorCount} failed`)
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting Data Migration to Supabase...')
  console.log(`📡 Supabase URL: ${supabaseUrl}`)

  try {
    // Test connection
    const { error } = await supabase.from('products').select('count').limit(1)
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message)
      process.exit(1)
    }
    console.log('✅ Successfully connected to Supabase')

    // Run migrations
    await migrateProducts()
    await migrateFreelanceServices()

    console.log('\n✨ Migration Complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate()
