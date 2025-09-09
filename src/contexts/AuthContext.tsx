// src/contexts/AuthContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';

import { authApi, bindAuthTokenGetter } from '@/src/services/auth';
import { getOrCreateDeviceUuid, buildDevicePayload } from '@/src/utils/device';

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  verified: boolean | null; // <-- new
  setApiToken: (t: string | null) => Promise<void>;
  refreshMe: () => Promise<void>; // <-- new
  setVerified: (v: boolean) => void; // <-- new (used after successful verify)
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const didRegisterDeviceRef = useRef(false);

  // Expose token getter to http layer
  useEffect(() => {
    bindAuthTokenGetter(() => tokenRef.current);
  }, []);

  // Load token on boot
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        tokenRef.current = stored;
        setToken(stored);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setApiToken = useCallback(async (t: string | null) => {
    if (t) {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, t);
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
    tokenRef.current = t;
    setToken(t);
    setVerified(t ? null : null); // reset verified until we fetch /auth/user
    if (!t) didRegisterDeviceRef.current = false;
  }, []);

  const refreshMe = useCallback(async () => {
    if (!tokenRef.current) {
      setVerified(null);
      return;
    }
    try {
      const me = await authApi.getUser();
      // tolerant to either boolean or timestamp
      const v =
        typeof (me as any).email_verified !== 'undefined'
          ? Boolean((me as any).email_verified)
          : Boolean((me as any).email_verified_at);
      setVerified(v);
    } catch (e: any) {
      // If token invalid, reset state
      if (e?.status === 401) {
        await setApiToken(null);
      } else {
        // leave verified as-is; caller decides routing
      }
    }
  }, [setApiToken]);

  // When token appears, fetch /auth/user once to know verified state
  useEffect(() => {
    if (token && verified === null) {
      refreshMe();
    }
  }, [token, verified, refreshMe]);

  // Register device once per session after we have a token
  useEffect(() => {
    if (!token || didRegisterDeviceRef.current) return;
    (async () => {
      try {
        const uuid = await getOrCreateDeviceUuid();
        const payload = await buildDevicePayload();
        await authApi.putUserDevice(uuid, payload);
        didRegisterDeviceRef.current = true;
      } catch (e) {
        console.warn('[auth] device registration failed:', e);
      }
    })();
  }, [token]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}
    await setApiToken(null);
  }, [setApiToken]);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {}
    await setApiToken(null);
  }, [setApiToken]);

  useEffect(() => {
    console.log('🟢 Auth state:', {
      loading,
      token: token ? '[set]' : null,
      verified,
    });
  }, [loading, token, verified]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, loading, verified, setApiToken, refreshMe, setVerified, logout, logoutAll }),
    [token, loading, verified, setApiToken, refreshMe, logout, logoutAll]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
