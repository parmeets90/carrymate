import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthTokens } from '@carrymate/shared';

const ACCESS = 'cm_access';
const REFRESH = 'cm_refresh';

export const tokenStorage = {
  async get(): Promise<{ access: string | null; refresh: string | null }> {
    const [access, refresh] = await Promise.all([
      AsyncStorage.getItem(ACCESS),
      AsyncStorage.getItem(REFRESH),
    ]);
    return { access, refresh };
  },
  async set(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.multiSet([
      [ACCESS, tokens.accessToken],
      [REFRESH, tokens.refreshToken],
    ]);
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS, REFRESH]);
  },
};
