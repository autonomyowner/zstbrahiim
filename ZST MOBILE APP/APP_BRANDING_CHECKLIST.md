# App Branding Update Checklist

## ✅ Completed Tasks

### 1. App Name Changed ✅
- ✅ App name: "MyApp" → "ZST"
- ✅ Slug: "MyApp" → "zst"
- ✅ Scheme: "myapp" → "zst"
- ✅ Android package: "com.myapp" → "com.zst"
- ✅ iOS bundle ID: "com.myapp" → "com.zst"

**File modified:** `app.json`

---

## 📋 Pending Tasks

### 2. App Icons (Requires You to Act) 🎨

**Current status:** Still using default Ignite logos

**What you need:**
Your ZST logo already exists at:
- `assets/images/logo.png`
- `assets/images/logo@2x.png`
- `assets/images/logo@3x.png`

**What to do:**

#### Option A: Use Online Generator (5 minutes) ⭐ RECOMMENDED
1. Go to https://icon.kitchen
2. Upload `assets/images/logo@3x.png`
3. Set background color: `#191015`
4. Click "Generate"
5. Download icon pack
6. Replace files in `assets/images/`:
   - `app-icon-all.png`
   - `app-icon-android-legacy.png`
   - `app-icon-android-adaptive-foreground.png`
   - `app-icon-android-adaptive-background.png`
   - `app-icon-ios.png`
   - `app-icon-web-favicon.png`

#### Option B: Manual Creation
See `HOW_TO_UPDATE_APP_ICONS.md` for detailed instructions.

---

### 3. Rebuild Required ⚠️

After replacing icons, you MUST rebuild:

```bash
# Clear cache
npx expo start --clear

# Rebuild for testing
npm run build:android:device  # For Android
npm run build:ios:device      # For iOS
```

**Why?** Icon and package name changes require native rebuild.

---

## 🎯 Quick Summary

| Task | Status | File/Action |
|------|--------|-------------|
| Change app name | ✅ Done | `app.json` updated |
| Change package name | ✅ Done | `app.json` updated |
| Replace app icons | ⏳ Pending | Use icon.kitchen + rebuild |
| Update splash screen | ✅ Already uses adaptive icon | No action needed |
| Rebuild app | ⏳ Pending | After icons replaced |

---

## 📱 Current App Configuration

```json
{
  "name": "ZST",
  "slug": "zst",
  "scheme": "zst",
  "android": {
    "package": "com.zst"
  },
  "ios": {
    "bundleIdentifier": "com.zst"
  }
}
```

---

## 🚀 Next Steps

1. **Create ZST icons** (use icon.kitchen - 5 min)
2. **Replace icon files** in `assets/images/`
3. **Rebuild app:**
   ```bash
   npm run build:android:device
   ```
4. **Test on device** - Check home screen icon

---

## ⚠️ Important Notes

### Package Name Change Impact

Since I changed `com.myapp` to `com.zst`, this affects:

- ✅ **Good news:** This is the right time to change it (before production)
- ⚠️ **Important:** Any existing test builds with `com.myapp` will be separate apps
- ⚠️ **Important:** You'll need to uninstall old `com.myapp` version before installing new `com.zst` version

### What Doesn't Require Changes

- ✅ Splash screen (already uses adaptive icon automatically)
- ✅ App colors/theme (already customized)
- ✅ Logo in-app (already using ZST logo)

### What DOES Require Rebuild

Because you changed:
- ❌ App name in app.json
- ❌ Package name (com.myapp → com.zst)
- ❌ App icons (when you replace them)

**You MUST rebuild** - Dev server updates won't work for these changes.

---

## 🎨 Icon Specifications Reminder

All icons should be:
- **Size:** 1024×1024 pixels (except favicon: 48×48)
- **Format:** PNG
- **Quality:** Maximum (no compression artifacts)
- **Padding:** ~100px margin from edges
- **Background:** `#191015` (your app's dark color)

---

## 🆘 Need Help?

1. **For icon generation:** Read `HOW_TO_UPDATE_APP_ICONS.md`
2. **For testing:** Check console logs after rebuild
3. **If icons don't show:** Clear cache and rebuild again

---

## ✨ Final Checklist Before Release

Before submitting to stores:

- [ ] App name shows "ZST" (not "MyApp")
- [ ] App icon shows ZST logo (not Ignite)
- [ ] Splash screen looks good
- [ ] Package name is `com.zst`
- [ ] App works with all features
- [ ] Tested on multiple devices
- [ ] Caching works (check console logs)

---

**Ready to create your icons?** Use icon.kitchen - it's the fastest way! 🚀
