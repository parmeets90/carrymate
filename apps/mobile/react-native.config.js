/**
 * React Native CLI config. Bundles custom fonts (Plus Jakarta Sans + Inter).
 * Android also loads these directly from android/app/src/main/assets/fonts;
 * `npx react-native-asset` uses this to (re)link for iOS.
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts'],
};
