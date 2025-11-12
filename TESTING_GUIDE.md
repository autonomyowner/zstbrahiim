# Testing Guide - Authentication & Product Management

## Overview
This guide outlines the testing procedures for the newly implemented authentication and product management features on www.zsst.xyz.

## Prerequisites
- The site is deployed on Vercel at www.zsst.xyz
- Supabase is configured with email confirmation disabled
- Database has proper RLS policies

## Test Cases

### 1. User Signup Flow ✅

**Test Steps:**
1. Visit www.zsst.xyz
2. Click on "Sign Up" button in the navigation
3. Fill in the signup form:
   - Full Name: Test User
   - Account Type: Customer or Seller
   - Email: test@example.com
   - Password: testpassword123 (minimum 8 characters)
   - Confirm Password: testpassword123
   - Check the terms checkbox
4. Click "Sign Up"

**Expected Results:**
- Success message appears: "Account created successfully! Redirecting to homepage..."
- User is automatically logged in
- Redirected to homepage after 2 seconds
- Navbar shows user's name in "Account" button (left side desktop, mobile left)
- "Logout" button appears (right side desktop, mobile right)
- "Sign In" and "Sign Up" buttons are replaced

### 2. User Sign In Flow ✅

**Test Steps:**
1. Visit www.zsst.xyz (when logged out)
2. Click "Sign In" button
3. Enter email and password
4. Click "Sign In"

**Expected Results:**
- If credentials are correct: User is logged in and redirected to homepage
- If credentials are wrong: Clear error message: "Invalid email or password. Please check your credentials and try again."
- Navbar updates to show logged-in state
- User sees their name in the Account button

### 3. Navbar Authentication State ✅

**Test: Logged Out State**
- Desktop: Left side shows "Sign In" button, Right side shows "Sign Up" button
- Mobile: Left side shows "Sign Up" button, Right side shows "Sign In" button

**Test: Logged In State**
- Desktop: Left side shows "Account [User Name]" button, Right side shows "Logout" button
- Mobile: Left side shows "Account [First Name]" button, Right side shows "Logout" button
- Clicking Account button navigates to /account page
- Clicking Logout button signs user out and redirects to homepage

### 4. Account Page ✅

**Test Steps:**
1. Log in to your account
2. Click "Account" button in navbar
3. Navigate to /account

**Expected Results:**
- Page displays user information: Email, Full Name, Phone, Account Created date
- Account Type badge shows user role (customer/seller/admin)
- Sidebar navigation shows:
  - Marketplace link
  - Seller Dashboard link (only for sellers/admins)
  - Sign Out button
- "Edit Profile" button is visible
- Can update Full Name and Phone Number
- Email field is disabled (cannot be changed)
- Success message appears after updating profile

### 5. Seller Dashboard Access Control ✅

**Test: Non-Seller User**
1. Sign up as a customer
2. Try to access /services directly

**Expected Result:**
- Redirected to /signin page
- Cannot access seller dashboard

**Test: Seller User**
1. Sign up as a seller
2. Navigate to /services

**Expected Result:**
- Access granted
- Dashboard loads with products, orders, analytics tabs
- Loading spinner appears while checking authentication

### 6. Product Management (Sellers Only) ✅

**Test: Add Product**
1. Log in as a seller
2. Navigate to /services (Seller Dashboard)
3. Click "Products" tab
4. Click "Add Product" button
5. Fill in product details:
   - Name: Test Product
   - Brand: Test Brand
   - Price: 5000
   - Category: Fragrance
   - Description: Test description
   - Stock status: In Stock
6. Click "Add Product"

**Expected Results:**
- Product is created in Supabase database
- Success message appears: "Produit [name] ajouté avec succès!"
- Products list refreshes automatically
- New product appears in the products list
- Product is visible in the marketplace

**Test: Edit Product**
1. In Products tab, click "Edit" on a product
2. Modify product details
3. Click "Save Changes"

**Expected Results:**
- Product is updated in database
- Success message appears
- Products list refreshes with updated data

**Test: Delete Product**
1. In Products tab, click "Delete" on a product
2. Confirm deletion in the dialog

**Expected Results:**
- Product is removed from database
- Success message appears
- Products list refreshes
- Product no longer appears in marketplace

### 7. Session Persistence ✅

**Test Steps:**
1. Sign in to your account
2. Close the browser tab
3. Reopen www.zsst.xyz
4. Refresh the page

**Expected Results:**
- User remains logged in
- Navbar shows logged-in state immediately
- No need to sign in again

### 8. Error Handling ✅

**Test: Signup with Existing Email**
1. Try to sign up with an email that's already registered

**Expected Result:**
- Error message: "This email is already registered. Please sign in instead."

**Test: Sign In with Wrong Password**
1. Enter correct email but wrong password

**Expected Result:**
- Error message: "Invalid email or password. Please check your credentials and try again."

**Test: Network Errors**
1. Simulate network disconnection (if possible)
2. Try to sign in or add product

**Expected Result:**
- Appropriate error message
- User can try again when connection is restored

## Key Features Implemented

### ✅ Authentication
- [x] Sign up with email/password
- [x] Email confirmation disabled (users can login immediately)
- [x] Sign in with email/password
- [x] Sign out functionality
- [x] Session persistence across page refreshes
- [x] Auth state synchronization with Supabase
- [x] Proper error handling with user-friendly messages

### ✅ Dynamic Navbar
- [x] Shows Sign In/Sign Up when logged out
- [x] Shows Account/Logout when logged in
- [x] Displays user's name
- [x] Real-time auth state updates
- [x] Works on both desktop and mobile

### ✅ Account Management
- [x] View profile information
- [x] Edit profile (name, phone)
- [x] Role-based navigation (sellers see dashboard link)
- [x] Sign out from account page

### ✅ Seller Dashboard Protection
- [x] Authentication check on page load
- [x] Role verification (seller/admin only)
- [x] Redirect unauthorized users to /signin
- [x] Loading state during auth check

### ✅ Product Management (Supabase Integration)
- [x] Fetch products from Supabase on load
- [x] Create products (saves to database)
- [x] Update products (database updates)
- [x] Delete products (database deletion)
- [x] Auto-refresh product list after CRUD operations
- [x] Success/error notifications
- [x] Loading states

## Production Checklist

Before testing on production (www.zsst.xyz), ensure:

1. ✅ Environment variables are set in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

2. ✅ Supabase configuration:
   - Email confirmation is disabled in Auth settings
   - Site URL is set to https://www.zsst.xyz
   - Redirect URLs include https://www.zsst.xyz/**
   - RLS policies are enabled
   - Database trigger `handle_new_user()` is active

3. ✅ Code deployment:
   - Latest code is pushed to Vercel
   - Build completed successfully
   - No TypeScript or linting errors

## Known Limitations

1. **Social Login**: Google and Facebook buttons are present but not yet functional (placeholder)
2. **Password Reset**: Forgot password link is present but not yet implemented
3. **Image Upload**: Product images use URL paths, not file upload yet
4. **Email Templates**: Using default Supabase email templates

## Next Steps (Optional Enhancements)

1. Implement password reset flow
2. Add Google/Facebook OAuth
3. Add image upload for products
4. Add order management for customers
5. Add email notifications
6. Implement forgot password functionality
7. Add two-factor authentication
8. Add user avatar upload

## Support

If any issues are encountered during testing:
1. Check browser console for errors
2. Verify Supabase dashboard for database entries
3. Check Vercel logs for server-side errors
4. Ensure proper network connectivity

---

**Last Updated**: November 12, 2025
**Site**: www.zsst.xyz
**Version**: 1.0.0

