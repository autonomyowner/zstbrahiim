# How to Use Cache Safely (Without Breaking Auth or Product Loading)

## The Problem You Had Before

When you tried caching before, you probably experienced:
1. **Auth not loading** - User couldn't log in or session disappeared
2. **Products not loading** - Cached data was stale or corrupted
3. **App breaking** - Cache errors crashed the app

## Why This Solution Won't Break Your App

### Key Safety Features:

1. **NEVER caches auth data** - Auth always fetches fresh from Supabase
2. **Automatic fallback** - If cache fails, fetches fresh data
3. **Offline support** - If network fails, uses stale cache
4. **Auto-expiry** - Cache expires after set time
5. **Manual invalidation** - Clear cache when data changes

---

## Step-by-Step: How to Use It

### Step 1: Import the Cached Version (NOT the Original)

**BEFORE (Original - No Cache):**
```typescript
import {
  fetchNewProducts,
  fetchFournisseurProducts,
  fetchProductCategories,
} from "@/services/supabase"
```

**AFTER (With Safe Cache):**
```typescript
// Change this one line - add .cached
import {
  fetchNewProducts,
  fetchFournisseurProducts,
  fetchProductCategories,
  invalidateProductCaches, // Add this for refreshing
} from "@/services/supabase/productService.cached"
```

### Step 2: Use It Exactly the Same Way

**Your existing code WORKS AS-IS!** No changes needed:

```typescript
const loadData = useCallback(async () => {
  try {
    // These now use cache automatically
    const [newProds, fournisseurProds, cats] = await Promise.all([
      fetchNewProducts(10),        // Cached for 10 minutes
      fetchFournisseurProducts(20), // Cached for 5 minutes
      fetchProductCategories(),     // Cached for 30 minutes
    ])

    setNewProducts(newProds)
    setSaleProducts(fournisseurProds)
    setCategories(cats)
  } catch (error) {
    console.error('Error loading marketplace data:', error)
    // App won't break - cache returns [] on error
  } finally {
    setIsLoading(false)
  }
}, [])
```

### Step 3: Invalidate Cache on Refresh (Optional but Recommended)

When user pulls to refresh, clear cache to get fresh data:

```typescript
const onRefresh = useCallback(async () => {
  setRefreshing(true)

  // Clear cache before fetching
  await invalidateProductCaches()

  // Now fetch fresh data
  await loadData()

  setRefreshing(false)
}, [loadData])
```

---

## Complete Example: MarketplaceScreen with Safe Caching

Here's how to update your MarketplaceScreen.tsx:

```typescript
// 1. Change import to use cached version
import {
  fetchNewProducts,
  fetchFournisseurProducts,
  fetchProductCategories,
  fetchAllProducts,
  subscribeToProducts,
  invalidateProductCaches, // Add this
  ProductWithImage,
} from "@/services/supabase/productService.cached" // <- Add .cached here

export const MarketplaceScreen: FC<MarketplaceScreenProps> = function MarketplaceScreen({
  onNavigateToCart,
  onProductPress
}) {
  // ... your existing state ...

  // 2. Your loadData function stays THE SAME
  const loadData = useCallback(async () => {
    try {
      const [newProds, fournisseurProds, cats] = await Promise.all([
        fetchNewProducts(10),
        fetchFournisseurProducts(20),
        fetchProductCategories(),
      ])

      if (newProds.length === 0) {
        const allProducts = await fetchAllProducts()
        setNewProducts(allProducts.slice(0, 10))
      } else {
        setNewProducts(newProds)
      }

      setSaleProducts(fournisseurProds)
      setCategories(cats)
    } catch (error) {
      console.error('Error loading marketplace data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 3. Your useEffect stays THE SAME
  useEffect(() => {
    loadData()
  }, [loadData])

  // 4. Your real-time subscription stays THE SAME
  useEffect(() => {
    const subscription = subscribeToProducts(() => {
      loadData()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadData])

  // 5. ONLY update onRefresh to clear cache
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await invalidateProductCaches() // <- Add this line
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // ... rest of your component stays the same ...
}
```

---

## What About Auth? (NEVER Cache Auth!)

**DO NOT** cache auth-related functions. Auth should always be fresh:

```typescript
// ✅ CORRECT - Auth is NOT cached
import {
  signIn,
  signUp,
  signOut,
  getCurrentProfile,
} from "@/services/supabase/authService" // NO .cached here!

// ❌ WRONG - Do NOT do this
import { signIn } from "@/services/supabase/authService.cached" // DON'T CREATE THIS!
```

Your AuthContext already handles auth correctly - **don't change it!**

---

## Cache Durations Explained

Different data has different cache times:

| Data Type | Cache Duration | Why |
|-----------|---------------|-----|
| All Products | 5 minutes | Changes moderately |
| New Products | 10 minutes | Tagged products change less |
| Sale/Promo Products | 3 minutes | Promos change frequently |
| Categories | 30 minutes | Rarely changes |
| **Auth Data** | **NEVER CACHED** | Must always be fresh |

---

## Testing: Make Sure It Works

### Test 1: Cold Start (First Time)
1. Close app completely
2. Open app
3. ✅ Products load (from network)
4. Check console: Should see `[Cache] Fetching fresh data for: products:all`

### Test 2: Hot Start (Second Time Within 5 Minutes)
1. Close app
2. Open app again (within 5 minutes)
3. ✅ Products load instantly (from cache)
4. Check console: Should see `[Cache] Using cached data for: products:all`

### Test 3: Pull to Refresh
1. Pull down on screen
2. ✅ Products reload (cache cleared)
3. Check console: Should see `[Cache] Invalidating cache` then `[Cache] Fetching fresh data`

### Test 4: Offline Mode
1. Turn on Airplane mode
2. Close and reopen app
3. ✅ Products still show (using stale cache)
4. Check console: Should see `[Cache] Using stale cache as fallback`

### Test 5: Auth Still Works
1. Log in
2. ✅ Login works immediately
3. Close app, reopen
4. ✅ Still logged in (auth not cached, session from Supabase)

---

## Troubleshooting

### Problem: "Products not loading"
**Solution:** Cache might be corrupted. Clear it:
```typescript
import { invalidateProductCaches } from "@/services/supabase/productService.cached"

// Call this once to clear all caches
await invalidateProductCaches()
```

### Problem: "Cache never expires"
**Solution:** Check if you incremented the `CACHE_VERSION` in `safeCache.ts`. When you update the app, increment it:
```typescript
// In src/utils/safeCache.ts
const CACHE_VERSION = "1.0.1" // <- Change this to clear all caches
```

### Problem: "Auth broken after adding cache"
**Solution:** Make sure you're NOT importing from `.cached` for auth:
```typescript
// ✅ Correct
import { signIn } from "@/services/supabase/authService"

// ❌ Wrong
import { signIn } from "@/services/supabase/authService.cached" // Don't create this!
```

---

## Advanced: Clear Cache on User Logout

In your AuthContext, clear all caches when user logs out:

```typescript
// In src/context/AuthContext.tsx
import { invalidateProductCaches } from "@/services/supabase/productService.cached"

const signOut = async (): Promise<AuthResponse> => {
  setIsLoading(true)
  try {
    const response = await authSignOut()
    if (response.success) {
      setUser(null)
      // Clear product caches on logout
      await invalidateProductCaches()
    }
    return response
  } finally {
    setIsLoading(false)
  }
}
```

---

## Summary: What Makes This Safe

1. ✅ **Auth is never cached** - Always fresh from Supabase
2. ✅ **Fallback on error** - Returns `[]` instead of crashing
3. ✅ **Stale cache on offline** - App works offline
4. ✅ **Auto-expiry** - Cache clears automatically
5. ✅ **Manual invalidation** - You control when to refresh
6. ✅ **Zero breaking changes** - Your code stays the same

---

## Next Steps

1. Update `MarketplaceScreen.tsx` to use cached imports
2. Test in dev mode (check console logs)
3. If it works, update other screens:
   - `ShopScreen.tsx`
   - `DashboardScreen.tsx`
   - Any screen that fetches products

**DO NOT** cache:
- Auth functions
- User-specific data (cart, orders)
- Real-time critical data
