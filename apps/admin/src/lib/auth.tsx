import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicUser, AuthTokens } from '@carrymate/shared';
import { api, tokenStore } from './api';

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  signIn: (user: PublicUser, tokens: AuthTokens) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.access) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = (u: PublicUser, tokens: AuthTokens) => {
    tokenStore.set(tokens);
    setUser(u);
  };

  const signOut = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
