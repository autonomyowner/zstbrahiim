# How to Update App Icons to ZST Logo

## ✅ App Name Already Updated!

I've changed the app name from "MyApp" to "ZST" in `app.json`. Now we need to replace the Ignite logo with your ZST logo.

---

## 📱 Icon Requirements

Your app needs these icon files:

| File | Size | Purpose |
|------|------|---------|
| `app-icon-all.png` | 1024×1024 | Universal icon (iOS, Android, etc.) |
| `app-icon-android-legacy.png` | 1024×1024 | Android legacy devices |
| `app-icon-android-adaptive-foreground.png` | 1024×1024 | Android adaptive icon foreground |
| `app-icon-android-adaptive-background.png` | 1024×1024 | Android adaptive icon background |
| `app-icon-ios.png` | 1024×1024 | iOS icon |
| `app-icon-web-favicon.png` | 48×48 | Web favicon |

---

## 🎨 Option 1: Use Online Icon Generator (Easiest!) ⭐

### Step 1: Go to an Icon Generator

**Recommended sites:**
- https://icon.kitchen (best for Expo/React Native)
- https://www.appicon.co
- https://easyappicon.com

### Step 2: Upload Your Logo

Upload: `assets/images/logo@3x.png` (your highest quality logo)

### Step 3: Configure Settings

**For icon.kitchen:**
1. Upload your ZST logo
2. Choose "Adaptive" for Android
3. Background color: `#191015` (matches your splash screen)
4. Download the icon set

### Step 4: Replace Files

Download will give you a zip with all sizes. Replace these files in `assets/images/`:
- Copy new icons over old ones (keep the same filenames)

---

## 🖼️ Option 2: Manual Creation with Image Editor

If you want more control, use Photoshop, GIMP, or Figma:

### Requirements:

**Main Icon (1024×1024):**
- Canvas: 1024×1024 px
- Background: Your brand color or transparent
- Logo: Centered, with padding (about 20% margin)
- Format: PNG, RGB mode
- Export quality: Maximum

**Adaptive Icon Foreground (1024×1024):**
- Canvas: 1024×1024 px
- Background: Transparent
- Logo: Centered in safe area (660×660 px center)
- Important: Keep logo within center 66% (Android crops edges!)

**Adaptive Icon Background (1024×1024):**
- Canvas: 1024×1024 px
- Solid color: `#191015` (or your brand color)
- No transparency

**Favicon (48×48):**
- Canvas: 48×48 px
- Logo: Simplified/scaled down version
- Format: PNG

---

## 🚀 Quick Steps (Using Your Logo)

### If you have design tools installed:

```bash
# 1. Open your logo (logo@3x.png) in an image editor

# 2. Create a 1024×1024 canvas with your brand color background

# 3. Center your logo with padding (leave ~100px margin on all sides)

# 4. Export as PNG:
#    - app-icon-all.png
#    - app-icon-android-legacy.png
#    - app-icon-ios.png

# 5. For adaptive icon:
#    - Foreground: Logo on transparent background (1024×1024)
#    - Background: Solid color #191015 (1024×1024)

# 6. For favicon: Scale down to 48×48
```

---

## 📋 File Checklist

After creating your icons, replace these files in `assets/images/`:

- [ ] `app-icon-all.png` (1024×1024, with background)
- [ ] `app-icon-android-legacy.png` (1024×1024, with background)
- [ ] `app-icon-android-adaptive-foreground.png` (1024×1024, transparent bg)
- [ ] `app-icon-android-adaptive-background.png` (1024×1024, solid color)
- [ ] `app-icon-ios.png` (1024×1024, with background)
- [ ] `app-icon-web-favicon.png` (48×48)

---

## 🎨 Design Tips for App Icons

### ✅ DO:
- ✅ Use simple, recognizable logo
- ✅ Keep padding (about 100px margin on 1024px icon)
- ✅ Use high contrast colors
- ✅ Make sure logo is centered
- ✅ Test on both dark and light backgrounds
- ✅ Use solid background color for main icon

### ❌ DON'T:
- ❌ Use text that's too small (won't be readable)
- ❌ Put logo too close to edges (will be cropped)
- ❌ Use gradients that don't scale well
- ❌ Make icon too complex (keep it simple)
- ❌ Forget to test on actual devices

---

## 🔧 After Replacing Icons

### Step 1: Clear Cache
```bash
# Clear Expo cache
npx expo start --clear
```

### Step 2: Rebuild App
Since you changed app.json (icons and package name), you need to rebuild:

```bash
# For Android
npm run build:android:device

# For iOS
npm run build:ios:device
```

**Important:** Icon changes require a new build! Dev server won't show new icons.

### Step 3: Test
- Install new build on device
- Check home screen icon looks good
- Check icon in app switcher
- Test on both light and dark mode

---

## 🎯 Quick Test Without Full Rebuild

To preview your icon in Expo Go:

```bash
npx expo start
# Scan QR code
# Icon won't update in home screen, but you'll see it in Expo Go app list
```

**Note:** For production builds and real testing, you need a full rebuild.

---

## 📱 Example: ZST Icon Layout

```
┌─────────────────────────┐
│                         │
│     100px margin        │
│   ┌─────────────────┐   │
│   │                 │   │
│   │   ZST  LOGO    │   │ 1024×1024
│   │                 │   │
│   └─────────────────┘   │
│     100px margin        │
│                         │
└─────────────────────────┘
```

---

## 🆘 Troubleshooting

### Problem: Icons not updating after replacing files
**Solution:**
1. Clear cache: `npx expo start --clear`
2. Rebuild app: `npm run build:android:device`
3. Reinstall on device

### Problem: Icon looks pixelated
**Solution:** Make sure you're using 1024×1024 size and PNG format with high quality.

### Problem: Logo too close to edges on Android
**Solution:** Adaptive icon safe area is only center 66% (660×660 on 1024×1024). Keep logo within that area.

### Problem: Icon background wrong color
**Solution:** Check splash screen background color in app.json (line 41): `"backgroundColor": "#191015"`. Use same color for icon background.

---

## ✨ Recommended Approach

**Easiest and fastest:**

1. **Go to https://icon.kitchen**
2. **Upload** `assets/images/logo@3x.png`
3. **Set background color** to `#191015` (matches your app)
4. **Download** icon set
5. **Replace** files in `assets/images/`
6. **Rebuild** app: `npm run build:android:device`

**Done in 5 minutes!** ✅

---

## 📝 Summary

**Already done:**
- ✅ App name changed to "ZST"
- ✅ Package name changed to "com.zst"
- ✅ Scheme changed to "zst"

**You need to do:**
- [ ] Create/replace app icon files (use icon.kitchen)
- [ ] Rebuild app with new icons
- [ ] Test on device

---

## 💡 Pro Tip

After you replace the icons, I recommend:

1. **Test on multiple devices** (different Android versions)
2. **Check both light and dark mode**
3. **View in app drawer and home screen**
4. **Make sure icon is recognizable at small sizes**

Good luck! Let me know when you have the new icon files ready and I can help you test them. 🚀
