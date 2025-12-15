// Server-side Supabase client for Next.js Server Components and API Routes
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a supabase client with the service role key (admin access) or fall back to anon key
// IMPORTANT: Service role key should only be used on the server-side
let supabaseAdmin: SupabaseClient<Database>

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} else if (supabaseUrl && supabaseAnonKey) {
  // Fallback to anon key for development without service role key
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key for server client')
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} else {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

export { supabaseAdmin }

// Helper to create a server-side client for a specific user (respects RLS)
export const createServerClient = (accessToken: string) => {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
    },
  })
}

export default supabaseAdmin
