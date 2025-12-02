# Install ZST Icons - Step by Step

## 📥 What You Downloaded

From the `create-zst-icons.html` page, you should have downloaded these 4 files:
1. `zst-icon-main.png` (1024×1024)
2. `zst-icon-foreground.png` (1024×1024, transparent)
3. `zst-icon-background.png` (1024×1024, dark gradient)
4. `zst-icon-favicon.png` (48×48)

---

## 📂 Step 1: Find Your Downloaded Icons

Check your browser's Downloads folder:
- **Chrome/Edge:** Usually `C:\Users\Palace tech\Downloads\`
- **Firefox:** Check Settings → Downloads → Show folder

Look for files named `zst-icon-*.png`

---

## ✏️ Step 2: Rename the Files

You need to create 6 files from the 4 you downloaded:

### Main Icon (use 3 times):
1. Copy `zst-icon-main.png` → Rename to `app-icon-all.png`
2. Copy `zst-icon-main.png` → Rename to `app-icon-android-legacy.png`
3. Copy `zst-icon-main.png` → Rename to `app-icon-ios.png`

### Adaptive Icons (Android):
4. Rename `zst-icon-foreground.png` → `app-icon-android-adaptive-foreground.png`
5. Rename `zst-icon-background.png` → `app-icon-android-adaptive-background.png`

### Favicon:
6. Rename `zst-icon-favicon.png` → `app-icon-web-favicon.png`

---

## 📁 Step 3: Copy to Project

Copy all 6 renamed files to:
```
D:\APP ZST\zstmapp 1\assets\images\
```

**Replace the existing files when prompted** (backup old ones if you want).

---

## 🔧 Step 4: Apply Changes

### Option A: Just Testing in Dev Mode
```bash
# Stop current dev server (Ctrl+C)

# Clear cache and restart
npx expo start --clear
```

Then scan QR code - you should see ZST with your logo!

### Option B: Full Production Build (Recommended)
```bash
# Clear cache
npx expo start --clear

# Rebuild app
npm run build:android:device
```

This creates a new build with your icons that you can install on your phone.

---

## ✅ Verification Checklist

After copying files, verify you have these in `assets/images/`:

- [ ] `app-icon-all.png` (1024×1024, dark background with ZST logo)
- [ ] `app-icon-android-legacy.png` (same as above)
- [ ] `app-icon-android-adaptive-foreground.png` (transparent with ZST logo)
- [ ] `app-icon-android-adaptive-background.png` (dark gradient, no logo)
- [ ] `app-icon-ios.png` (same as app-icon-all.png)
- [ ] `app-icon-web-favicon.png` (48×48, simplified ZST)

---

## 🚀 Quick Copy-Paste Commands

If icons are in your Downloads folder:

```bash
# Windows Command Prompt or PowerShell:
cd "C:\Users\Palace tech\Downloads"

# Copy main icon (3 times with different names)
copy "zst-icon-main.png" "D:\APP ZST\zstmapp 1\assets\images\app-icon-all.png"
copy "zst-icon-main.png" "D:\APP ZST\zstmapp 1\assets\images\app-icon-android-legacy.png"
copy "zst-icon-main.png" "D:\APP ZST\zstmapp 1\assets\images\app-icon-ios.png"

# Copy adaptive icons
copy "zst-icon-foreground.png" "D:\APP ZST\zstmapp 1\assets\images\app-icon-android-adaptive-foreground.png"
copy "zst-icon-background.png" "D:\APP ZST\zstmapp 1\assets\images\app-icon-android-adaptive-background.png"

# Copy favicon
copy "zst-icon-favicon.png" "D:\APP ZST\zstmapp 1\assets\images\app-icon-web-favicon.png"
```

Or using Git Bash:
```bash
cd ~/Downloads

# Copy files
cp zst-icon-main.png "/d/APP ZST/zstmapp 1/assets/images/app-icon-all.png"
cp zst-icon-main.png "/d/APP ZST/zstmapp 1/assets/images/app-icon-android-legacy.png"
cp zst-icon-main.png "/d/APP ZST/zstmapp 1/assets/images/app-icon-ios.png"
cp zst-icon-foreground.png "/d/APP ZST/zstmapp 1/assets/images/app-icon-android-adaptive-foreground.png"
cp zst-icon-background.png "/d/APP ZST/zstmapp 1/assets/images/app-icon-android-adaptive-background.png"
cp zst-icon-favicon.png "/d/APP ZST/zstmapp 1/assets/images/app-icon-web-favicon.png"
```

---

## 🎯 What You'll See

**Before (Ignite logo):**
- Red/orange flame icon
- "MyApp" or generic name

**After (ZST logo):**
- Dark elegant icon with "Z.ST" text
- Gold swoosh accent
- Professional luxury look
- "ZST" app name

---

## ⚠️ Common Issues

### "File not found" when copying
**Solution:** Make sure you're in the right directory. Check where your browser downloaded the files.

### Icons still showing old logo after restart
**Solution:**
1. Stop dev server (Ctrl+C)
2. Run: `npx expo start --clear`
3. For production: `npm run build:android:device`

### Downloaded files have weird names
**Solution:** Your browser might have added numbers (e.g., `zst-icon-main (1).png`). Just rename them to remove the numbers.

---

## 🆘 Need Help?

**Can't find downloaded files?**
- Check browser Downloads: Menu → Downloads → Show in folder

**Don't want to use command line?**
- Just use File Explorer to copy/paste and rename manually

**Still seeing Ignite logo?**
- Make sure you replaced ALL 6 icon files
- Clear cache: `npx expo start --clear`
- For full testing: Rebuild with `npm run build:android:device`

---

Ready? Find those downloaded icons and let's install them! 🚀
