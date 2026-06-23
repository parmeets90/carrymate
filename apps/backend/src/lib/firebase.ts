import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env, isFirebaseConfigured } from '../config/env';
import { AppError } from '../utils/errors';

/**
 * Firebase Admin — verifies Google/Firebase ID tokens from the app.
 * Lazily initialized and config-gated; if Firebase isn't configured, Google
 * sign-in is simply unavailable (phone-OTP login still works).
 */
let app: App | null = null;

function firebaseApp(): App {
  if (!isFirebaseConfigured) {
    throw new AppError(503, 'GOOGLE_AUTH_DISABLED', 'Google sign-in is not available right now.');
  }
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          // Render stores the key with literal \n — normalize to real newlines.
          privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
  }
  return app;
}

export interface FirebaseIdentity {
  uid: string;
  email: string | null;
  name: string | null;
}

/** Verify a Firebase ID token and return the identity, or throw 401. */
export async function verifyFirebaseToken(idToken: string): Promise<FirebaseIdentity> {
  try {
    const decoded = await getAuth(firebaseApp()).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? null,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('GOOGLE_TOKEN_INVALID', 'Could not verify your Google sign-in.');
  }
}
