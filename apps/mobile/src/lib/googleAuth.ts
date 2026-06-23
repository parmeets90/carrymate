/**
 * Google sign-in via Firebase.
 *
 * STUB: the native integration (@react-native-firebase/auth +
 * @react-native-google-signin/google-signin + google-services.json) is wired
 * once the founder provides the Firebase files. Until then this throws a clear,
 * caught message so the button is visible but safe (no broken build).
 *
 * When implemented it returns the Firebase ID token to POST to /v1/auth/google.
 */
export async function signInWithGoogle(): Promise<string> {
  throw new Error('Google sign-in will be enabled once setup is complete.');
}

/** True once the native Google/Firebase modules are wired in. */
export const isGoogleSignInReady = false;
