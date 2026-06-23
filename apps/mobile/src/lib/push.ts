import { PermissionsAndroid, Platform } from 'react-native';
import messaging, {
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { api } from './api';

/** Shared navigation ref so notification taps can deep-link from anywhere. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

async function ensurePermission(): Promise<boolean> {
  // Android 13+ needs the runtime POST_NOTIFICATIONS grant.
  if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/** Route a notification's data payload to the right screen. */
function handleTap(data?: Record<string, string | object>): void {
  if (!data || !navigationRef.isReady()) return;
  const conversationId = data.conversationId as string | undefined;
  if (conversationId) {
    navigationRef.navigate('ChatThread', { conversationId, title: 'Chat' });
  } else {
    navigationRef.navigate('Notifications');
  }
}

/**
 * Request permission, register the FCM token with the backend, and wire
 * listeners. Returns a cleanup fn. Safe to call after login; no-op on failure.
 */
export async function registerForPush(onForeground: () => void): Promise<() => void> {
  const cleanups: Array<() => void> = [];
  try {
    if (!(await ensurePermission())) return () => undefined;

    const token = await messaging().getToken();
    if (token) await api.registerFcmToken(token).catch(() => undefined);

    cleanups.push(
      messaging().onTokenRefresh((t) => {
        void api.registerFcmToken(t).catch(() => undefined);
      }),
    );

    // Foreground messages don't auto-display — refresh the in-app badge/list.
    cleanups.push(messaging().onMessage(async () => onForeground()));

    // Tap handling (app already running in background).
    cleanups.push(
      messaging().onNotificationOpenedApp((msg: FirebaseMessagingTypes.RemoteMessage) =>
        handleTap(msg.data),
      ),
    );

    // Tap that cold-started the app.
    const initial = await messaging().getInitialNotification();
    if (initial) setTimeout(() => handleTap(initial.data), 600);
  } catch {
    // Push is best-effort; never block the app.
  }
  return () => cleanups.forEach((c) => c());
}
