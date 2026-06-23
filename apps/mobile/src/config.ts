import { Platform } from 'react-native';

/**
 * API base URL.
 * - Release builds (the standalone APK) target the deployed API.
 * - Dev builds target the local backend: Android emulator reaches the host via
 *   10.0.2.2; iOS simulator uses localhost.
 *
 * To build an APK that talks to your machine on the same Wi-Fi instead, set
 * PROD_API_URL to http://<your-LAN-IP>:3000 (and cleartext is already allowed).
 */
const PROD_API_URL = 'https://carrymate-api-nw17.onrender.com';

export const API_BASE_URL = __DEV__
  ? Platform.select({ android: 'http://10.0.2.2:3000', ios: 'http://localhost:3000' }) ??
    'http://localhost:3000'
  : PROD_API_URL;

/**
 * Google OAuth Web Client ID (Firebase project carrymate-76583, oauth_client
 * client_type 3). Used by GoogleSignin.configure to mint an ID token that
 * Firebase + our backend can verify. Not a secret.
 */
export const GOOGLE_WEB_CLIENT_ID =
  '640582170119-gqur7mtvvovugjccl6ufll095bjn6pso.apps.googleusercontent.com';
