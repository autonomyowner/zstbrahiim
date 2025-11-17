// Authentication helpers for Supabase
import { supabase } from './client'
import type { UserRole, UserProfile, Database, SellerType, SellerCategory } from './types'

type UserProfileUpdatePayload = {
  email?: string
  full_name?: string | null
  phone?: string | null
  provider_name?: string | null
  provider_avatar?: string | null
  bio?: string | null
  seller_type?: SellerType | null
  seller_category?: SellerCategory | null
}

// Helper to detect network errors
const isNetworkError = (error: any): boolean => {
  if (!error) return false
  const errorMessage = error.message?.toLowerCase() || ''
  return (
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('network request failed') ||
    errorMessage.includes('networkerror') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError'
  )
}

// Helper to format user-friendly error messages
const formatAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred'

  // Network errors
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  const errorMessage = error.message?.toLowerCase() || ''

  // Specific auth errors
  if (errorMessage.includes('already registered')) {
    return 'This email is already registered. Please sign in instead.'
  }
  if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  if (errorMessage.includes('email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for the verification link.'
  }
  if (errorMessage.includes('user not found')) {
    return 'No account found with this email address. Please sign up first.'
  }
  if (errorMessage.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  if (errorMessage.includes('password')) {
    return 'Password is too weak. Please use a stronger password with at least 8 characters.'
  }

  // Generic fallback
  return error.message || 'An unexpected error occurred. Please try again.'
}

// Retry helper with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Only retry on network errors
      if (!isNetworkError(error) || attempt === maxRetries - 1) {
        throw error
      }

      // Wait before retrying with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  role: UserRole = 'customer',
  sellerCategory?: SellerCategory
): Promise<{ user: any; error: any; userFriendlyError?: string }> => {
  try {
    const metadata: Record<string, any> = {
      full_name: fullName,
      phone: phone || '',
      role: role,
    }

    if (role === 'seller') {
      metadata.seller_category = sellerCategory || 'fournisseur'
    }

    // Retry signup with exponential backoff on network errors
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
    })

    if (error) {
      console.error('Error signing up:', error)
      const userFriendlyError = formatAuthError(error)
      return { user: null, error, userFriendlyError }
    }

    if (data.user && role === 'seller') {
      const userId = data.user.id
      try {
        await retryWithBackoff(async () => {
          return await supabase
            .from('user_profiles')
            .update({ seller_category: sellerCategory || 'fournisseur' })
            .eq('id', userId)
        })
      } catch (profileError) {
        console.error('Error assigning seller category:', profileError)
      }
    }

    // Profile is automatically created by the database trigger (handle_new_user)
    // No need to manually insert into user_profiles

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Error in signUp:', error)
    const userFriendlyError = formatAuthError(error)
    return { user: null, error, userFriendlyError }
  }
}

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: any; error: any; userFriendlyError?: string }> => {
  try {
    // Retry signin with exponential backoff on network errors
    const { data, error } = await retryWithBackoff(async () => {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      })
    })

    if (error) {
      console.error('Error signing in:', error)
      const userFriendlyError = formatAuthError(error)
      return { user: null, error, userFriendlyError }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Error in signIn:', error)
    const userFriendlyError = formatAuthError(error)
    return { user: null, error, userFriendlyError }
  }
}

// Sign out
export const signOut = async (): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in signOut:', error)
    return { error }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (
  updates: UserProfileUpdatePayload
): Promise<boolean> => {
  try {
    const user = await getCurrentUser()

    if (!user) {
      console.error('No user logged in')
      return false
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return false
  }
}

// Helper to get site URL dynamically
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

// Reset password
export const resetPassword = async (email: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/reset-password`,
    })

    if (error) {
      console.error('Error resetting password:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in resetPassword:', error)
    return { error }
  }
}

// Update password
export const updatePassword = async (newPassword: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Error updating password:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in updatePassword:', error)
    return { error }
  }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user !== null
}

// Check if user has specific role
export const hasRole = async (role: UserRole): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile()
    return profile?.role === role
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

// Check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  return hasRole('admin')
}

// Check if user is seller
export const isSeller = async (): Promise<boolean> => {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'seller' || profile?.role === 'admin'
}

// Check if user is freelancer
export const isFreelancer = async (): Promise<boolean> => {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'freelancer' || profile?.role === 'admin'
}

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event: any, session: any) => {
    callback(session?.user || null)
  })
}

// Get user by ID (admin only)
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error getting user by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserById:', error)
    return null
  }
}

// Get all users (admin only)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting all users:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    return []
  }
}

// Delete user account (admin only or own account)
export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  try {
    // This will cascade delete the profile due to foreign key constraint
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user account:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteUserAccount:', error)
    return false
  }
}
