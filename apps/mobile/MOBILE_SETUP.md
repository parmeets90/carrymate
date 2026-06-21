# Mobile setup (one-time, on your dev machine)

This app is **bare React Native (CLI)**. The TypeScript/app code lives here, but the
native `android/` and `ios/` projects are generated locally (they're toolchain- and
version-specific, so they are not hand-authored or committed wholesale).

## Prerequisites
- Node ≥ 20
- **Android:** JDK 17 + Android Studio (Android SDK, platform-tools, an emulator or device)
- **iOS (macOS only):** Xcode + CocoaPods

## Generate the native projects

From the repo root, generate a throwaway RN app of the **same version** as `apps/mobile`
(`react-native@0.76.5`) and copy its `android/` and `ios/` folders in:

```bash
# 1. Create a temp RN app with the matching version
npx @react-native-community/cli init CarryMateNative --version 0.76.5 --skip-install --directory /tmp/cm-native

# 2. Copy native folders into apps/mobile
cp -r /tmp/cm-native/android apps/mobile/android
cp -r /tmp/cm-native/ios     apps/mobile/ios

# 3. Set the app id / bundle id
#    Android: apps/mobile/android/app/build.gradle  -> applicationId "in.carrymate.app"
#    iOS:     open apps/mobile/ios in Xcode -> set bundle identifier in.carrymate.app
```

> Tip: align the temp app's `app.json` name with ours (`CarryMate`) so `AppRegistry`
> registration matches, or update the generated `MainActivity`/`AppDelegate` component name.

## Install & run

```bash
# Install JS deps (from repo root)
npm install

# Start Metro
npm run mobile:start

# In another terminal
npm run mobile:android      # or: npm run mobile:ios
```

## Monorepo notes
- `metro.config.js` already watches the workspace root so `@carrymate/shared` resolves.
- If you hit hoisting issues with native autolinking, run the Android/iOS commands from
  `apps/mobile` directly, or add `patch-package` as needed (same approach as the reference stack).
