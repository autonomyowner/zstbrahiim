# Supabase Configuration Checklist for www.zsst.xyz

## ⚠️ IMPORTANT: Complete These Steps in Supabase Dashboard

Before the authentication and product features work correctly on your live site, you need to configure these settings in your Supabase dashboard.

## 🔗 Access Your Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **zst** (enbrhhuubjvapadqyvds)
3. Region: eu-west-3

---

## ✅ Required Configuration Steps

### 1. Disable Email Confirmation

**Why**: So users can sign up and log in immediately without waiting for email verification.

**Steps**:
1. Go to: **Authentication** → **Providers**
2. Click on **Email** provider
3. Find setting: **Confirm email**
4. **TOGGLE OFF** (disable) the email confirmation
5. Click **Save**

**Verification**: After this, new signups should be automatically confirmed.

---

### 2. Configure Site URL

**Why**: For proper authentication redirects on your production site.

**Steps**:
1. Go to: **Authentication** → **URL Configuration**
2. Find: **Site URL**
3. Set to: `https://www.zsst.xyz`
4. Click **Save**

**Current**: May be set to `http://localhost:3000`
**Should be**: `https://www.zsst.xyz`

---

### 3. Add Redirect URLs

**Why**: Allow authentication callbacks to your production domain.

**Steps**:
1. Go to: **Authentication** → **URL Configuration**
2. Find: **Redirect URLs**
3. Add these URLs:
   ```
   https://www.zsst.xyz/**
   https://zsst.xyz/**
   http://localhost:3000/**
   ```
4. Click **Save**

**Note**: The `/**` wildcard allows redirects to any path on your domain.

---

### 4. Verify Database Trigger (Should Already Exist)

**Why**: Automatically creates user profiles when users sign up.

**Steps**:
1. Go to: **Database** → **Functions**
2. Look for function: `handle_new_user`
3. Verify it exists and is enabled
4. Go to: **Database** → **Triggers**
5. Look for trigger: `on_auth_user_created`
6. Verify it's connected to `auth.users` table

**If missing**: Run the migration file `supabase/migrations/20250112000001_initial_schema.sql`

---

### 5. Check RLS Policies

**Why**: Control who can access what data.

**Steps**:
1. Go to: **Authentication** → **Policies**
2. Verify policies exist for:
   - `user_profiles` table
   - `products` table
   - `product_images` table
   - `orders` table
   - `order_items` table
3. Ensure RLS is **ENABLED** on all tables

**If missing**: Run the migration file `supabase/migrations/20250112000002_rls_policies.sql`

---

### 6. Verify API Keys (Should Already Be Set)

**Why**: Your app needs these to connect to Supabase.

**Steps**:
1. Go to: **Settings** → **API**
2. Copy these values (they should match your `.env.local`):
   - **Project URL**: `https://enbrhhuubjvapadqyvds.supabase.co`
   - **anon public**: Your public API key
   - **service_role**: Your service role key (keep secret!)

**Verify in Vercel**:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Confirm these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Testing After Configuration

### Test 1: Email Confirmation Disabled
1. Sign up with a new email
2. You should be logged in immediately (no email verification step)
3. Navbar should show your name

**✅ Pass**: User is logged in immediately
**❌ Fail**: User sees "Check your email" message

### Test 2: Redirect URLs
1. Sign in on www.zsst.xyz
2. You should be redirected to the homepage
3. No CORS or redirect errors

**✅ Pass**: Smooth redirect to homepage
**❌ Fail**: Error about unauthorized redirect URL

### Test 3: User Profile Creation
1. Sign up with a new email
2. Go to www.zsst.xyz/account
3. Your profile should show your name and email

**✅ Pass**: Profile data is displayed
**❌ Fail**: No profile found or error loading profile

---

## 📊 Quick Verification Checklist

Open Supabase Dashboard and check:

- [ ] Email confirmation is **DISABLED**
- [ ] Site URL is `https://www.zsst.xyz`
- [ ] Redirect URLs include `https://www.zsst.xyz/**`
- [ ] Database trigger `handle_new_user` exists
- [ ] RLS policies are enabled on all tables
- [ ] API keys match Vercel environment variables

---

## 🚨 Common Issues & Solutions

### Issue: "Email not confirmed" error
**Solution**: Disable email confirmation in Auth settings

### Issue: "Invalid redirect URL" error
**Solution**: Add your domain to Redirect URLs in URL Configuration

### Issue: User can sign up but profile doesn't load
**Solution**: Check if `handle_new_user` trigger exists and is active

### Issue: Products don't save to database
**Solution**: Verify RLS policies allow authenticated users to insert

### Issue: Navbar doesn't update after login
**Solution**: Clear browser cache, check console for errors

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Auth Configuration**: https://supabase.com/docs/guides/auth
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security
- **Your Project Dashboard**: https://supabase.com/dashboard/project/enbrhhuubjvapadqyvds

---

## ✅ Final Checklist Before Going Live

1. [ ] Complete all configuration steps above
2. [ ] Test signup flow on www.zsst.xyz
3. [ ] Test login flow
4. [ ] Test product creation (as seller)
5. [ ] Verify navbar updates properly
6. [ ] Check account page works
7. [ ] Test logout functionality
8. [ ] Verify session persists on page refresh

---

**Last Updated**: November 12, 2025
**Project**: ZST (enbrhhuubjvapadqyvds)
**Region**: eu-west-3
**Live Site**: www.zsst.xyz

