import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '@/config';

/**
 * Google sign-in via Firebase.
 * Flow: Google account picker → Google ID token → sign in to Firebase with that
 * credential → return the Firebase ID token, which the backend verifies
 * (firebase-admin) at POST /v1/auth/google.
 */
let configured = false;
function ensureConfigured(): void {
  if (configured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  configured = true;
}

export async function signInWithGoogle(): Promise<string> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();
  // Support both old ({ idToken }) and new ({ data: { idToken } }) shapes.
  const googleIdToken =
    (result as { data?: { idToken?: string | null } }).data?.idToken ??
    (result as { idToken?: string | null }).idToken;
  if (!googleIdToken) throw new Error('Google did not return an ID token. Please try again.');

  const credential = auth.GoogleAuthProvider.credential(googleIdToken);
  const userCredential = await auth().signInWithCredential(credential);
  return userCredential.user.getIdToken();
}

export const isGoogleSignInReady = true;
