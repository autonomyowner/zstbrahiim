// Freelance Services API - matches existing frontend data format exactly
import { supabase } from './client'
import type {
  FreelanceService,
  FreelanceServiceWithDetails,
  ServiceFilters,
  ServiceCategory,
  CreateServiceRequest,
  UpdateServiceRequest,
} from './types'

// Adapter to convert database format to frontend format
const adaptService = (dbService: any): any => {
  return {
    id: dbService.id,
    slug: dbService.slug,
    providerId: dbService.provider_id, // Add provider_id for filtering
    providerName: dbService.user_profiles?.provider_name || dbService.provider_name || 'Unknown',
    providerAvatar: dbService.user_profiles?.provider_avatar || dbService.provider_avatar || '',
    serviceTitle: dbService.service_title,
    category: dbService.category,
    experienceLevel: dbService.experience_level,
    rating: Number(dbService.rating),
    reviewsCount: dbService.reviews_count,
    completedProjects: dbService.completed_projects,
    responseTime: dbService.response_time,
    price: Number(dbService.price),
    priceType: dbService.price_type,
    description: dbService.description,
    shortDescription: dbService.short_description,
    skills: dbService.skills,
    portfolio: (dbService.freelance_portfolios || []).map((p: any) => ({
      title: p.title,
      image: p.image_url,
      description: p.description,
    })),
    deliveryTime: dbService.delivery_time,
    revisions: dbService.revisions,
    languages: dbService.languages,
    availability: dbService.availability,
    featured: dbService.featured,
    verified: dbService.verified,
    topRated: dbService.top_rated,
  }
}

// Get all freelance services with optional filters
export const getFreelanceServices = async (filters?: ServiceFilters): Promise<any[]> => {
  try {
    let query = supabase
      .from('freelance_services')
      .select(`
        *,
        user_profiles!provider_id (
          provider_name,
          provider_avatar,
          bio
        ),
        freelance_portfolios (
          title,
          description,
          image_url,
          display_order
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      if (Array.isArray(filters.category)) {
        query = query.in('category', filters.category)
      } else {
        query = query.eq('category', filters.category)
      }
    }

    if (filters?.experience_level) {
      if (Array.isArray(filters.experience_level)) {
        query = query.in('experience_level', filters.experience_level)
      } else {
        query = query.eq('experience_level', filters.experience_level)
      }
    }

    if (filters?.availability) {
      query = query.eq('availability', filters.availability)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.verified !== undefined) {
      query = query.eq('verified', filters.verified)
    }

    if (filters?.top_rated !== undefined) {
      query = query.eq('top_rated', filters.top_rated)
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price', filters.min_price)
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price', filters.max_price)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching freelance services:', error)
      throw error
    }

    return (data || []).map(adaptService)
  } catch (error) {
    console.error('Error in getFreelanceServices:', error)
    return []
  }
}

// Get featured services
export const getFeaturedServices = async (): Promise<any[]> => {
  return getFreelanceServices({ featured: true })
}

// Get services by category
export const getServicesByCategory = async (category: ServiceCategory): Promise<any[]> => {
  return getFreelanceServices({ category })
}

// Get service by ID
export const getServiceById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('freelance_services')
      .select(`
        *,
        user_profiles!provider_id (
          provider_name,
          provider_avatar,
          bio
        ),
        freelance_portfolios (
          title,
          description,
          image_url,
          display_order
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching service by ID:', error)
      return null
    }

    if (!data) return null

    return adaptService(data)
  } catch (error) {
    console.error('Error in getServiceById:', error)
    return null
  }
}

// Get service by slug
export const getServiceBySlug = async (slug: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('freelance_services')
      .select(`
        *,
        user_profiles!provider_id (
          provider_name,
          provider_avatar,
          bio
        ),
        freelance_portfolios (
          title,
          description,
          image_url,
          display_order
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching service by slug:', error)
      return null
    }

    if (!data) return null

    return adaptService(data)
  } catch (error) {
    console.error('Error in getServiceBySlug:', error)
    return null
  }
}

// Search services
export const searchServices = async (query: string, filters?: ServiceFilters): Promise<any[]> => {
  try {
    let dbQuery = supabase
      .from('freelance_services')
      .select(`
        *,
        user_profiles!provider_id (
          provider_name,
          provider_avatar,
          bio
        ),
        freelance_portfolios (
          title,
          description,
          image_url,
          display_order
        )
      `)

    // Text search in service title, description, skills, and provider name
    if (query) {
      dbQuery = dbQuery.or(
        `service_title.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`
      )
    }

    // Apply additional filters
    if (filters?.category) {
      if (Array.isArray(filters.category)) {
        dbQuery = dbQuery.in('category', filters.category)
      } else {
        dbQuery = dbQuery.eq('category', filters.category)
      }
    }

    if (filters?.availability) {
      dbQuery = dbQuery.eq('availability', filters.availability)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Error searching services:', error)
      throw error
    }

    // Filter by skills if needed
    let results = (data || []).map(adaptService)

    if (query) {
      results = results.filter((service: any) => {
        const matchesTitle = service.serviceTitle.toLowerCase().includes(query.toLowerCase())
        const matchesDescription = service.description.toLowerCase().includes(query.toLowerCase())
        const matchesProvider = service.providerName.toLowerCase().includes(query.toLowerCase())
        const matchesSkills = service.skills.some((skill: string) =>
          skill.toLowerCase().includes(query.toLowerCase())
        )
        const matchesCategory = service.category.toLowerCase().includes(query.toLowerCase())

        return matchesTitle || matchesDescription || matchesProvider || matchesSkills || matchesCategory
      })
    }

    return results
  } catch (error) {
    console.error('Error in searchServices:', error)
    return []
  }
}

// Create freelance service (seller only)
export const createService = async (serviceData: CreateServiceRequest): Promise<string | null> => {
  try {
    const { portfolio, ...serviceFields } = serviceData

    // Insert service
    const { data: service, error: serviceError } = await supabase
      .from('freelance_services')
      .insert({
        ...serviceFields,
        rating: 0,
        reviews_count: 0,
        completed_projects: 0,
      })
      .select()
      .single()

    if (serviceError) {
      console.error('Error creating service:', serviceError)
      throw serviceError
    }

    // Insert portfolio items
    if (portfolio && portfolio.length > 0) {
      const portfolioRecords = portfolio.map((item, index) => ({
        service_id: service.id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        display_order: item.display_order || index,
      }))

      const { error: portfolioError } = await supabase
        .from('freelance_portfolios')
        .insert(portfolioRecords)

      if (portfolioError) {
        console.error('Error creating portfolio items:', portfolioError)
        // Rollback service creation
        await supabase.from('freelance_services').delete().eq('id', service.id)
        throw portfolioError
      }
    }

    return service.id
  } catch (error) {
    console.error('Error in createService:', error)
    return null
  }
}

// Update freelance service
export const updateService = async (updateData: UpdateServiceRequest): Promise<boolean> => {
  try {
    const { id, portfolio, ...serviceFields } = updateData

    // Update service
    const { error: serviceError } = await supabase
      .from('freelance_services')
      .update(serviceFields)
      .eq('id', id)

    if (serviceError) {
      console.error('Error updating service:', serviceError)
      throw serviceError
    }

    // Update portfolio if provided
    if (portfolio && portfolio.length > 0) {
      // Delete old portfolio items
      await supabase.from('freelance_portfolios').delete().eq('service_id', id)

      // Insert new portfolio items
      const portfolioRecords = portfolio.map((item, index) => ({
        service_id: id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        display_order: item.display_order || index,
      }))

      const { error: portfolioError } = await supabase
        .from('freelance_portfolios')
        .insert(portfolioRecords)

      if (portfolioError) {
        console.error('Error updating portfolio items:', portfolioError)
        throw portfolioError
      }
    }

    return true
  } catch (error) {
    console.error('Error in updateService:', error)
    return false
  }
}

// Delete freelance service
export const deleteService = async (serviceId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('freelance_services').delete().eq('id', serviceId)

    if (error) {
      console.error('Error deleting service:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteService:', error)
    return false
  }
}

// Get service categories (static list)
export const getServiceCategories = (): ServiceCategory[] => {
  return [
    'Développement Web',
    'Design Graphique',
    'Montage Vidéo',
    'Marketing Digital',
    'Rédaction',
    'Photographie',
    'Traduction',
    'Consultation',
  ]
}
