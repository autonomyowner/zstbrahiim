// Authentication helpers for Supabase
import { supabase } from './client'
import type { UserRole, UserProfile } from './types'

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  role: UserRole = 'customer'
): Promise<{ user: any; error: any }> => {
  try {
    // Create auth user with metadata
    // The database trigger will automatically create the user profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          role: role,
        },
      },
    })

    if (error) {
      console.error('Error signing up:', error)
      return { user: null, error }
    }

    // Profile is automatically created by the database trigger (handle_new_user)
    // No need to manually insert into user_profiles

    return { user: data.user, error: null }
  } catch (error) {
    console.error('Error in signUp:', error)
    return { user: null, error }
  }
}

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: any; error: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error signing in:', error)
      return { user: null, error }
    }

    return { user: data.user, error: null }
  } catch (error) {
    console.error('Error in signIn:', error)
    return { user: null, error }
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
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
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

// Reset password
export const resetPassword = async (email: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
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

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
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
