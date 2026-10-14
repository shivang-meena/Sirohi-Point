iQOO Z5 AAB download-size estimate

1. Put exactly one .aab file in this folder.
2. Download the official bundletool JAR from:
   https://developer.android.com/tools/bundletool
   Save it here as bundletool-all.jar.
3. Make sure Java is installed.
4. Open PowerShell in this folder and run:
   .\Check-AabSize.ps1

The supplied device.json estimates an arm64-v8a phone on Android 11 (SDK 30),
English, and 440 dpi. If your iQOO Z5 runs a newer Android version or uses a
different display density, update device.json for a closer estimate. The
estimate is local and free; it does not upload the AAB to Google Play.
