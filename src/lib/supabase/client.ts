// Supabase client configuration
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Ensure environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Get the site URL (supports both localhost and production)
const getSiteUrl = () => {
  // Check if we're on Vercel
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  // Fallback to NEXT_PUBLIC_SITE_URL or localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) return null

  return user
}

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user !== null
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Helper function to get storage public URL
export const getStoragePublicUrl = (bucket: string, path: string): string => {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

// Helper function to upload file to storage
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  return getStoragePublicUrl(bucket, data.path)
}

// Helper function to delete file from storage
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}

// Export the client as default
export default supabase
