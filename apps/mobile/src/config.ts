import { Platform } from 'react-native';

/**
 * API base URL for local dev. Android emulators reach the host machine via
 * 10.0.2.2; iOS simulators can use localhost. Override for devices/staging.
 */
export const API_BASE_URL =
  Platform.select({
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
  }) ?? 'http://localhost:3000';
