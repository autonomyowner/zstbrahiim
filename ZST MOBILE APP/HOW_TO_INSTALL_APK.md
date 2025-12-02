# How to Install ZST APK on Your Android Phone

## 🎯 What's Building Now

**Preview Build (APK)** - This is what you need for testing on your phone!
- File type: `.apk` (can install directly)
- Size: ~30-50 MB
- Doesn't need dev server
- Works standalone
- Ready for testing

---

## 📱 How to Install APK on Your Phone

### Method 1: Direct Download on Phone (Easiest!)

1. **Open this link on your phone's browser** (when build finishes):
   - The link will be shown in your terminal
   - Or check: https://expo.dev/accounts/autonomy.owner/projects/zst/builds

2. **Click "Download APK"**

3. **Open the downloaded file**
   - You'll see "Install blocked" warning
   - Click "Settings"
   - Enable "Install from unknown sources" for your browser
   - Go back and click "Install"

4. **Open ZST app** from your home screen! ✅

---

### Method 2: Download on PC, Transfer to Phone

1. **Download APK from EAS link** (on your computer)

2. **Transfer to phone:**
   - **Email:** Email the APK to yourself, open on phone
   - **USB:** Connect phone via USB, copy APK to phone
   - **Cloud:** Upload to Google Drive/Dropbox, download on phone
   - **WhatsApp:** Send to yourself

3. **On your phone:**
   - Find the APK file (usually in Downloads folder)
   - Tap to open
   - Allow installation from unknown sources
   - Install

4. **Open ZST app**! ✅

---

## 🔧 Enable "Install from Unknown Sources"

Different Android versions have different steps:

### Android 8.0+ (Most Common)
1. Go to **Settings** → **Apps & notifications**
2. Tap **Advanced** → **Special app access**
3. Tap **Install unknown apps**
4. Choose your browser (Chrome, Firefox, etc.)
5. Enable **Allow from this source**

### Android 7.0 and Below
1. Go to **Settings** → **Security**
2. Enable **Unknown sources**
3. Confirm the warning

---

## ✅ After Installation

You'll see:
- ✅ **App name:** ZST
- ✅ **App icon:** Your dark ZST logo with gold accent
- ✅ **Splash screen:** ZST branding
- ✅ **All features work:** Marketplace, Auth, Products, Caching

---

## 🔄 Difference Between Build Types

| Build Type | File | Size | Use Case |
|------------|------|------|----------|
| **Development** | .apk | 188 MB | Needs dev server, for active development |
| **Preview** | .apk | ~40 MB | Standalone, perfect for testing ⭐ |
| **Production** | .aab | ~30 MB | For Google Play Store only |

**For testing on phone: Use Preview build!** ⭐

---

## 📊 Current Builds

### Build 1: Development (188 MB) - Done ✅
- Link: https://expo.dev/accounts/autonomy.owner/projects/zst/builds/6505c9db-6c7f-4924-87cd-b67adeac8de9
- Status: Installed on your phone, but stuck on splash screen
- Issue: Needs dev server connection

### Build 2: Production (.aab) - Done ✅
- Link: https://expo.dev/artifacts/eas/dTPaeGL8K7RZc3zWCZrcdT.aab
- Status: Can't install directly (it's for Play Store)
- Issue: Need APK, not AAB

### Build 3: Preview (APK) - Building... ⏳
- Status: Currently building
- ETA: 10-15 minutes
- This is what you need! ⭐

---

## 🎉 When Preview Build Finishes

You'll see in terminal:
```
✔ Build finished

🤖 Android app:
https://expo.dev/artifacts/eas/XXXXXXX.apk
```

**That's your link!** Open it on your phone and install.

---

## 🆘 Troubleshooting

### "App not installed"
**Fix:** Uninstall the old version first (if you have one installed)

### "Install blocked"
**Fix:** Enable "Install from unknown sources" (see above)

### "Parse error"
**Fix:** Download failed - try downloading again

### App crashes on open
**Fix:**
1. Uninstall app
2. Restart phone
3. Reinstall APK
4. If still crashes, check your phone's Android version (need 7.0+)

---

## 📱 Share with Your Client

Once you test and it works:

1. **Get the preview build link** (the .apk link)
2. **Send to your client** via WhatsApp/Email
3. **Tell them:**
   - Open link on Android phone
   - Download APK
   - Enable unknown sources
   - Install
   - Test the app!

---

## ⏳ While You Wait for Build

- Check your email (EAS sends notifications)
- Check builds page: https://expo.dev/accounts/autonomy.owner/projects/zst/builds
- Or just wait - terminal will show when done!

---

**Build should be ready in ~10-15 minutes!** I'll let you know when it's done. 🚀
