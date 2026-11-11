# DSA Journal - Android Native Application

This is the official Android Studio project for DSA Journal.

## Requirements
- Android Studio Ladybug (2024.2+) or Jellyfish (2024.1+)
- JDK 17 or higher
- Android SDK 35 (API 35)

## How to Build the Real .apk:

1. **Open in Android Studio**:
   - Extract this zip.
   - Open Android Studio -> Click **Open** -> Select the extracted folder ().
   - Let Gradle sync complete.

2. **Bundle the latest Web App (Offline Mode)**:
   - In your web app project, run: 
> react-example@0.0.0 build
> vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 1672 modules transformed.
rendering chunks...
computing gzip size...
dist/registerSW.js                0.13 kB
dist/manifest.webmanifest         0.55 kB
dist/index.html                   1.65 kB │ gzip:   0.65 kB
dist/assets/index-kc3NhENN.css   44.69 kB │ gzip:   8.21 kB
dist/assets/index-CcEmQ6Pa.js   546.66 kB │ gzip: 152.22 kB

✓ built in 543ms

PWA v2.0.0
mode      generateSW
precache  15 entries (593.86 KiB)
files generated
  dist/sw.js
  dist/workbox-7e5eb42b.js
   - Copy the files from  into 
   
3. **Build the APK**:
   - In Android Studio menu, click: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Once compilation finishes, click **locate** to find .
   - Transfer and install  directly on any Android phone!

4. **Why direct PWA install is also recommended**:
   - You can also install DSA Journal immediately on your Android phone without Android Studio!
   - Just open the app in Chrome on Android and tap **Install app** or **Add to Home screen**.
   - Android will automatically package it via WebAPK into an installed Android app.
