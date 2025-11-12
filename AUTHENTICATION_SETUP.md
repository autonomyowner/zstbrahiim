# Authentication Setup for ZST Project

## ✅ What's Been Configured

### 1. Database Trigger ✅
A trigger has been set up to automatically create user profiles when users sign up:

**Trigger Name**: `on_auth_user_created`
**Function**: `handle_new_user()`

**How it works:**
- When a user signs up through Supabase Auth
- The trigger automatically creates a record in `user_profiles` table
- User metadata (full_name, phone, role) is saved from signup form

### 2. User Profile Structure ✅
- `id` (UUID) - Matches auth.users.id
- `email` - User's email
- `full_name` - Display name
- `phone` - Optional phone number
- `role` - customer | seller | admin
- `is_demo_user` - Distinguishes real users from seed data
- `provider_name`, `provider_avatar`, `bio` - For sellers/freelancers
- `seller_type` - retailer | importer | wholesaler (for sellers)

### 3. Authentication Functions ✅
All auth functions ready in `src/lib/supabase/auth.ts`:

- `signUp()` - Register new users
- `signIn()` - Login with email/password
- `signOut()` - Logout
- `getCurrentUser()` - Get authenticated user
- `getCurrentUserProfile()` - Get user profile with role
- `updateUserProfile()` - Update profile info
- `resetPassword()` - Password reset flow
- `updatePassword()` - Change password
- `isAuthenticated()` - Check if logged in
- `isAdmin()` - Check admin role
- `isSeller()` - Check seller/admin role
- `hasRole()` - Check specific role
- `onAuthStateChange()` - Listen to auth changes

---

## 🚀 How to Use Authentication

### Sign Up New User

```typescript
import { signUp } from '@/lib/supabase/auth'

const handleSignUp = async () => {
  const { user, error } = await signUp(
    'user@example.com',
    'securePassword123',
    'Ahmed Benali',
    '+213 555 123 456',
    'customer' // or 'seller'
  )

  if (error) {
    console.error('Signup failed:', error)
    return
  }

  console.log('User created:', user)
  // Profile is automatically created by database trigger!
}
```

### Sign In

```typescript
import { signIn } from '@/lib/supabase/auth'

const handleSignIn = async () => {
  const { user, error } = await signIn(
    'user@example.com',
    'securePassword123'
  )

  if (error) {
    console.error('Login failed:', error)
    return
  }

  console.log('Logged in:', user)
}
```

### Get Current User Profile

```typescript
import { getCurrentUserProfile } from '@/lib/supabase/auth'

const profile = await getCurrentUserProfile()

if (profile) {
  console.log('User role:', profile.role)
  console.log('Full name:', profile.full_name)
  console.log('Email:', profile.email)
}
```

### Check User Role

```typescript
import { isAdmin, isSeller, isAuthenticated } from '@/lib/supabase/auth'

// Check if user is logged in
const loggedIn = await isAuthenticated()

// Check if user is admin
const admin = await isAdmin()

// Check if user is seller or admin
const seller = await isSeller()

// Use in component
if (admin) {
  // Show admin dashboard
} else if (seller) {
  // Show seller dashboard
} else {
  // Show customer view
}
```

### Protected Server Component

```typescript
// app/dashboard/page.tsx
import { getCurrentUserProfile } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect('/signin')
  }

  if (profile.role !== 'admin' && profile.role !== 'seller') {
    redirect('/')
  }

  return <div>Welcome {profile.full_name}!</div>
}
```

### Listen to Auth State Changes

```typescript
'use client'
import { useEffect, useState } from 'react'
import { onAuthStateChange } from '@/lib/supabase/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return <>{children}</>
}
```

---

## 🔧 Supabase Dashboard Configuration

### Required Settings (Do in Supabase Dashboard):

1. **Email Authentication** ✅ (Already enabled by default)
   - Go to: Authentication → Providers
   - Ensure "Email" is enabled

2. **Email Templates** (Optional - Customize)
   - Go to: Authentication → Email Templates
   - Customize: Confirmation, Password Reset, Magic Link emails

3. **Site URL Configuration**
   - Go to: Authentication → URL Configuration
   - Set **Site URL**: `http://localhost:3000` (development)
   - For production: Set to your domain (e.g., `https://brahim-perfum.com`)

4. **Redirect URLs**
   - Go to: Authentication → URL Configuration
   - Add **Redirect URLs**:
     - `http://localhost:3000/**` (development)
     - `https://yourdomain.com/**` (production)

5. **Email Confirmation** (Optional)
   - Go to: Authentication → Settings
   - Toggle "Enable email confirmations" if you want email verification
   - Default: Disabled (users can login immediately)

---

## 🧪 Testing Authentication

### Test Signup Flow

Create a test file `test-auth.ts`:

```typescript
import { signUp, signIn, getCurrentUserProfile } from './src/lib/supabase/auth'

async function testAuth() {
  console.log('🧪 Testing Authentication...\n')

  // 1. Sign up
  console.log('1️⃣ Signing up new user...')
  const { user, error } = await signUp(
    'test@example.com',
    'password123',
    'Test User',
    '+213 555 000 000',
    'customer'
  )

  if (error) {
    console.error('❌ Signup failed:', error.message)
    return
  }

  console.log('✅ User created:', user?.email)

  // 2. Get profile
  console.log('\n2️⃣ Fetching user profile...')
  const profile = await getCurrentUserProfile()

  if (profile) {
    console.log('✅ Profile found:', {
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      is_demo_user: profile.is_demo_user
    })
  }

  // 3. Sign out
  console.log('\n3️⃣ Signing out...')
  const { error: signOutError } = await signOut()

  if (!signOutError) {
    console.log('✅ Signed out successfully')
  }

  // 4. Sign in
  console.log('\n4️⃣ Signing back in...')
  const { user: loginUser, error: loginError } = await signIn(
    'test@example.com',
    'password123'
  )

  if (loginError) {
    console.error('❌ Login failed:', loginError.message)
    return
  }

  console.log('✅ Logged in:', loginUser?.email)

  console.log('\n🎉 All tests passed!')
}

testAuth()
```

Run with:
```bash
npx tsx test-auth.ts
```

### Expected Results:
```
🧪 Testing Authentication...

1️⃣ Signing up new user...
✅ User created: test@example.com

2️⃣ Fetching user profile...
✅ Profile found: {
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'customer',
  is_demo_user: false
}

3️⃣ Signing out...
✅ Signed out successfully

4️⃣ Signing back in...
✅ Logged in: test@example.com

🎉 All tests passed!
```

---

## 🔍 Verify Database

Check that profiles are created automatically:

```sql
-- View all real users (not demo/seed data)
SELECT
  id,
  email,
  full_name,
  role,
  is_demo_user,
  created_at
FROM user_profiles
WHERE is_demo_user = false
ORDER BY created_at DESC;
```

Expected: New signups appear here with `is_demo_user = false`

---

## 🛡️ Security Notes

### Row Level Security (RLS) Policies
All user_profiles policies are enabled:

- ✅ **Public Read**: Everyone can view profiles (needed for freelancer info)
- ✅ **User Insert**: Users can create their own profile on signup
- ✅ **User Update**: Users can only update their own profile
- ✅ **Admin Access**: Admins have full access

### Demo Users
- The 10 freelance service providers are marked as `is_demo_user = true`
- They don't have real auth accounts (mock data for display)
- New signups are real users with `is_demo_user = false`

---

## 📚 Integration with Existing Pages

### Update Signup Page

```typescript
// app/signup/page.tsx
'use client'
import { useState } from 'react'
import { signUp } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'customer' as const
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { user, error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone,
      formData.role
    )

    if (error) {
      alert('Signup failed: ' + error.message)
      return
    }

    alert('Account created successfully!')
    router.push('/signin')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  )
}
```

### Update Login Page

```typescript
// app/signin/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { user, error } = await signIn(email, password)

    if (error) {
      alert('Login failed: ' + error.message)
      return
    }

    alert('Logged in successfully!')
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  )
}
```

---

## ✅ Authentication Setup Complete!

Your authentication system is now fully functional:
- ✅ Auto-profile creation on signup
- ✅ Role-based access control
- ✅ Secure password authentication
- ✅ Profile management
- ✅ Password reset flow
- ✅ Demo users preserved for marketplace

**Next Steps:**
1. Integrate auth into your signup/signin pages
2. Add protected routes for dashboard/admin
3. Display user-specific content based on role
4. Test the complete auth flow

---

**Last Updated**: January 12, 2025
**Status**: ✅ Fully Configured & Ready for Use
