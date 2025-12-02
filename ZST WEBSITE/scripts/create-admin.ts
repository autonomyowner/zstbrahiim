// Create Admin User Script
// Run with: npx tsx scripts/create-admin.ts

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  console.log('🔐 Create Admin User\n')

  try {
    const email = await question('Email: ')
    const password = await question('Password: ')
    const fullName = await question('Full Name: ')
    const phone = await question('Phone (optional): ')

    console.log('\n⏳ Creating admin user...')

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || '',
        role: 'admin',
      },
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      rl.close()
      process.exit(1)
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role: 'admin',
      })

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError.message)
      // Try to cleanup auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      rl.close()
      process.exit(1)
    }

    console.log('\n✅ Admin user created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Name: ${fullName}`)
    console.log(`🆔 User ID: ${authData.user.id}`)

    rl.close()
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    rl.close()
    process.exit(1)
  }
}

createAdmin()
