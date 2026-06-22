import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * Best-effort current location for open-box geotagging. Never throws — returns
 * null if permission is denied, the fix times out, or the native module is
 * unavailable, so photo capture still works (timestamp only).
 */
export async function getCurrentCoords(): Promise<Coords | null> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
    }
    return await new Promise<Coords | null>((resolve) => {
      Geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
      );
    });
  } catch {
    return null;
  }
}
