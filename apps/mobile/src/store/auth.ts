import { create } from 'zustand';
import type { PublicUser, AuthResult } from '@carrymate/shared';
import { tokenStorage } from '../lib/storage';
import { api, setAccessToken, setOnAuthExpired } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

interface AuthState {
  hydrated: boolean;
  user: PublicUser | null;
  bootstrap: () => Promise<void>;
  completeLogin: (result: AuthResult) => Promise<void>;
  setUser: (user: PublicUser) => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  hydrated: false,
  user: null,

  bootstrap: async () => {
    // When a session can no longer be refreshed, drop the user back to sign-in.
    setOnAuthExpired(() => set({ user: null }));
    const { access } = await tokenStorage.get();
    if (!access) {
      set({ hydrated: true });
      return;
    }
    setAccessToken(access);
    try {
      const user = await api.me();
      set({ user, hydrated: true });
    } catch {
      await tokenStorage.clear();
      setAccessToken(null);
      set({ user: null, hydrated: true });
    }
  },

  completeLogin: async (result) => {
    await tokenStorage.set(result.tokens);
    setAccessToken(result.tokens.accessToken);
    set({ user: result.user });
  },

  setUser: (user) => set({ user }),

  signOut: async () => {
    disconnectSocket();
    await tokenStorage.clear();
    setAccessToken(null);
    set({ user: null });
  },
}));
