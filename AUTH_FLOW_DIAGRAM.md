# 🔐 Authentication Flow Diagram

## Before Fix (❌ Not Working)

```
User visits /signin
      ↓
Fills email/password
      ↓
Clicks "Sign In"
      ↓
console.log('Sign in:', { email, password })  ❌
      ↓
Nothing happens! 😞
```

---

## After Fix (✅ Working)

### Sign Up Flow

```
User visits /signup on Vercel
      ↓
Fills: Name, Email, Password, Account Type
      ↓
Clicks "Sign Up"
      ↓
┌─────────────────────────────────────────┐
│  signUp() function called               │
│  ↓                                       │
│  Supabase Auth API                      │
│  https://enbrhhuubjvapadqyvds           │
│         .supabase.co/auth/v1/signup     │
└─────────────────────────────────────────┘
      ↓
  Success? ──→ YES ──→ Show success message
      ↓                      ↓
      NO                Wait 2 seconds
      ↓                      ↓
Show error            Redirect to /
message                    ↓
                    User is logged in! 🎉
```

### Sign In Flow

```
User visits /signin on Vercel
      ↓
Fills: Email, Password
      ↓
Clicks "Sign In"
      ↓
┌─────────────────────────────────────────┐
│  signIn() function called               │
│  ↓                                       │
│  Supabase Auth API                      │
│  https://enbrhhuubjvapadqyvds           │
│         .supabase.co/auth/v1/token      │
└─────────────────────────────────────────┘
      ↓
  Success? ──→ YES ──→ Get user session
      ↓                      ↓
      NO                Save to browser
      ↓                      ↓
Show error            Redirect to /
message                    ↓
                    User is logged in! 🎉
```

---

## Environment Detection Flow

```
App starts on Vercel
      ↓
Check environment variables
      ↓
┌─────────────────────────────────────────┐
│  Is NEXT_PUBLIC_VERCEL_URL set?         │
└─────────────────────────────────────────┘
      ↓                    ↓
    YES                   NO
      ↓                    ↓
Use Vercel URL      Use localhost:3000
      ↓                    ↓
https://abc-team        http://localhost:3000
  .vercel.app
```

---

## Authentication Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│  ┌──────────────────────────────────────────────┐   │
│  │  Next.js Frontend (Vercel)                   │   │
│  │                                               │   │
│  │  ┌──────────────┐      ┌──────────────┐      │   │
│  │  │ /signin      │      │ /signup      │      │   │
│  │  │ page.tsx     │      │ page.tsx     │      │   │
│  │  └──────┬───────┘      └──────┬───────┘      │   │
│  │         │                     │              │   │
│  │         └──────────┬──────────┘              │   │
│  │                    ↓                         │   │
│  │         ┌──────────────────────┐             │   │
│  │         │ /lib/supabase/       │             │   │
│  │         │   auth.ts            │             │   │
│  │         │   client.ts          │             │   │
│  │         └──────────┬───────────┘             │   │
│  └────────────────────┼─────────────────────────┘   │
└────────────────────────┼─────────────────────────────┘
                         │
                         │ HTTPS Requests
                         │ + JWT Tokens
                         ↓
┌─────────────────────────────────────────────────────┐
│              SUPABASE (Backend)                     │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Auth API (GoTrue)                           │   │
│  │  https://enbrhhuubjvapadqyvds.supabase.co    │   │
│  │                                               │   │
│  │  • Validates credentials                     │   │
│  │  • Creates JWT tokens                        │   │
│  │  • Manages sessions                          │   │
│  │  • Sends emails                              │   │
│  └──────────────────┬───────────────────────────┘   │
│                     ↓                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                         │   │
│  │                                               │   │
│  │  Tables:                                      │   │
│  │  • auth.users                                │   │
│  │  • public.user_profiles                      │   │
│  │  • public.products                           │   │
│  │  • public.orders                             │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Configuration Dependencies

```
┌─────────────────────────────────────────────────┐
│          VERCEL (Deployment Platform)           │
│                                                 │
│  Environment Variables:                         │
│  ✓ NEXT_PUBLIC_SUPABASE_URL                    │
│  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY               │
│  ✓ SUPABASE_SERVICE_ROLE_KEY                   │
│  ✓ NEXT_PUBLIC_VERCEL_URL (auto-set)           │
└─────────────────────────────────────────────────┘
                      ↓
                  Must match
                      ↓
┌─────────────────────────────────────────────────┐
│        SUPABASE (Auth Configuration)            │
│                                                 │
│  Redirect URLs:                                 │
│  ✓ http://localhost:3000/**                    │
│  ✓ https://*-yourteam.vercel.app/**            │
│  ✓ https://yourdomain.com/** (if custom)       │
└─────────────────────────────────────────────────┘
```

---

## Session Management Flow

```
User signs in successfully
      ↓
Supabase returns:
  • access_token (JWT)
  • refresh_token
  • user object
      ↓
Stored in browser:
  • localStorage
  • Cookies (if SSR)
      ↓
User navigates to different pages
      ↓
Session checked automatically
      ↓
┌─────────────────────────────────────┐
│  Is access_token valid?             │
└─────────────────────────────────────┘
      ↓                    ↓
    YES                   NO
      ↓                    ↓
  Continue          Try refresh_token
  normally                 ↓
                    ┌──────────────┐
                    │  Valid?      │
                    └──────────────┘
                      ↓        ↓
                    YES       NO
                      ↓        ↓
                 Get new    Sign out
                 tokens     user
                      ↓
                  Continue
                  normally
```

---

## Error Handling Flow

```
User tries to sign in
      ↓
API call to Supabase
      ↓
Error occurs
      ↓
┌────────────────────────────────────────┐
│  Error Type?                           │
└────────────────────────────────────────┘
      ↓           ↓           ↓
   Network    Invalid     Account
   Error      Creds      Disabled
      ↓           ↓           ↓
   Show       Show        Show
"Connection  "Email or   "Account
 failed"     password    suspended"
             incorrect"
      ↓
Error message displayed to user
      ↓
User can try again
```

---

## Data Flow: Sign Up to Database

```
1. User fills signup form
         ↓
2. signUp() called with:
   • email
   • password
   • fullName
   • userType
         ↓
3. Supabase Auth creates user
         ↓
4. Trigger: handle_new_user()
   (Database function)
         ↓
5. Creates row in user_profiles:
   {
     id: user.id
     email: email
     full_name: fullName
     role: userType
     created_at: now()
   }
         ↓
6. User can now sign in!
```

---

## Vercel → Supabase Communication

```
Browser
   ↓
HTTPS Request
   ↓
https://your-app.vercel.app/signin
   ↓
Next.js processes request
   ↓
Supabase client makes API call
   ↓
HTTPS Request with headers:
   • apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY
   • Content-Type: application/json
   • Authorization: Bearer <token>
   ↓
https://enbrhhuubjvapadqyvds.supabase.co/auth/v1/token
   ↓
Supabase validates credentials
   ↓
Returns response:
   • 200 OK → Success
   • 400 Bad Request → Invalid data
   • 401 Unauthorized → Wrong password
   • 422 Unprocessable → Validation error
   ↓
Next.js receives response
   ↓
Updates UI accordingly
```

---

## Security Flow

```
Password entered by user
      ↓
Sent over HTTPS (encrypted)
      ↓
Supabase receives password
      ↓
Bcrypt hash generated
      ↓
Hash stored in auth.users table
(Original password NEVER stored)
      ↓
On sign in:
  User password → Bcrypt hash → Compare
      ↓
Match? → Generate JWT token
      ↓
JWT token has:
  • User ID
  • Email
  • Role
  • Expiry time (1 hour)
  • Signature (prevents tampering)
      ↓
Token sent back to browser
      ↓
Included in all subsequent requests
      ↓
Supabase validates JWT signature
      ↓
Request authorized!
```

---

## Quick Visual: What Changed

### BEFORE:
```
src/app/signin/page.tsx
  └─ handleSubmit()
      └─ console.log() ❌
```

### AFTER:
```
src/app/signin/page.tsx
  └─ handleSubmit()
      └─ signIn()
          └─ supabase.auth.signInWithPassword()
              └─ HTTPS POST to Supabase ✅
                  └─ Returns user session ✅
                      └─ Redirect to home ✅
```

---

**Understanding these flows will help you:**
- 🐛 Debug authentication issues
- 🔒 Understand security implications
- 🚀 Extend the authentication system
- 📊 Monitor auth in Supabase dashboard

**Next:** Follow `IMMEDIATE_ACTIONS_NEEDED.md` to deploy! 🎉

