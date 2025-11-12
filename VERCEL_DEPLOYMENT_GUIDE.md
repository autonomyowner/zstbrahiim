# Vercel Deployment Guide for Supabase Authentication

## 🎯 Quick Fix for Authentication Issues

Your authentication wasn't working on Vercel because:
1. ❌ Sign-in/Sign-up pages weren't connected to Supabase (they were just logging to console)
2. ❌ Environment variables weren't set in Vercel
3. ❌ Redirect URLs weren't configured in Supabase

## ✅ What Has Been Fixed

### 1. Authentication Pages Updated
- ✅ `src/app/signin/page.tsx` - Now uses Supabase `signIn()` function
- ✅ `src/app/signup/page.tsx` - Now uses Supabase `signUp()` function
- ✅ Added error handling and loading states
- ✅ Added success messages and redirects

### 2. Dynamic URL Support
- ✅ `src/lib/supabase/client.ts` - Now detects Vercel environment automatically
- ✅ `src/lib/supabase/auth.ts` - Uses dynamic site URLs for password resets
- ✅ Supports both `localhost:3000` and Vercel preview/production URLs

## 🚀 Deployment Steps

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add these variables for **Production**, **Preview**, and **Development**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://enbrhhuubjvapadqyvds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnJoaHV1Ymp2YXBhZHF5dmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDc2NjEsImV4cCI6MjA3ODQ4MzY2MX0.fAfcPDZjuODgcUKDChzx5DVqVmHCmN6ypf0kETwk5qI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnJoaHV1Ymp2YXBhZHF5dmRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNzY2MSwiZXhwIjoyMDc4NDgzNjYxfQ.pY-A4wkHQsdDHuNqGR_ZFVO0PJN8Y9cWMtWz7WEipDc
```

**Note:** `NEXT_PUBLIC_VERCEL_URL` is automatically set by Vercel - you don't need to add it manually.

### Step 2: Configure Supabase Redirect URLs

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/enbrhhuubjvapadqyvds)
2. Navigate to **Authentication** → **URL Configuration**
3. Add the following URLs to **Additional Redirect URLs**:

```
http://localhost:3000/**
https://your-production-domain.com/**
https://*-your-team-name.vercel.app/**
```

**Replace:**
- `your-production-domain.com` with your actual custom domain (if you have one)
- `your-team-name` with your Vercel team/account name

**Example for Vercel URLs:**
```
https://*-zstbrahiim.vercel.app/**
```

This wildcard pattern will match:
- `https://zstbrahiim-git-main-yourteam.vercel.app/**`
- `https://zstbrahiim-abc123-yourteam.vercel.app/**`
- etc.

### Step 3: Update Site URL (Optional)

In your Supabase dashboard under **Authentication** → **URL Configuration**:

- Set **Site URL** to your production domain:
  - For custom domain: `https://your-domain.com`
  - For Vercel domain: `https://your-app.vercel.app`

### Step 4: Redeploy on Vercel

After setting the environment variables:

1. Go to your Vercel dashboard
2. Click on **Deployments**
3. Click the three dots (⋮) next to the latest deployment
4. Click **Redeploy**

OR simply push a new commit to your Git repository.

## 🧪 Testing Authentication

### Local Testing
1. Run `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Create an account with your email
4. Check your email for confirmation link (if email confirmation is enabled)
5. Try signing in at `http://localhost:3000/signin`

### Production Testing
1. Go to your Vercel deployment URL
2. Navigate to `/signup`
3. Create a test account
4. Verify email (if enabled)
5. Sign in at `/signin`

## 🔍 Troubleshooting

### Issue: Still can't sign in on Vercel

**Check:**
1. ✅ Environment variables are set correctly in Vercel
2. ✅ Redirect URLs include your Vercel domain with wildcards
3. ✅ You've redeployed after making changes
4. ✅ Check browser console for specific error messages
5. ✅ Verify Supabase project is not paused (free tier)

### Issue: "Invalid redirect URL" error

**Solution:**
- Make sure the redirect URL pattern in Supabase matches your Vercel URLs exactly
- Use wildcards: `https://*-yourteam.vercel.app/**`

### Issue: Email confirmation not working

**Check:**
1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Make sure email templates are configured correctly
3. For production, consider setting up a custom SMTP server

### Issue: Getting CORS errors

**Solution:**
- This is usually because environment variables aren't loaded
- Make sure you've set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after setting environment variables

## 📊 Check Supabase Logs

To see authentication errors in real-time:

1. Go to Supabase Dashboard
2. Click **Logs** → **Auth**
3. Look for failed authentication attempts
4. Error messages will help debug issues

## 🔐 Security Notes

1. **Never commit** your `.env.local` file to Git
2. The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
3. Only `NEXT_PUBLIC_*` variables are safe to expose to the browser
4. Consider enabling Row Level Security (RLS) on all your tables

## 📝 Additional Configuration

### Enable Email Confirmations (Recommended for Production)

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Under **Email**, enable **Confirm email**
3. Users will need to verify their email before signing in

### Disable Email Confirmations (For Development/Testing)

1. Same as above, but disable **Confirm email**
2. Users can sign in immediately after signup

## 🎉 Success Indicators

You'll know authentication is working when:
- ✅ Sign up creates a new user in Supabase Auth
- ✅ You receive confirmation emails (if enabled)
- ✅ Sign in redirects you to the home page
- ✅ User session persists across page reloads
- ✅ No console errors in browser dev tools

## 📞 Need More Help?

Check:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

**Last Updated:** November 12, 2025
**Project:** ZST (zstbrahiim)
**Supabase Project ID:** enbrhhuubjvapadqyvds

