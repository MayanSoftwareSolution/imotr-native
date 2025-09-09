// src/services/auth.ts
import { createHttp } from '@/src/lib/http';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://mayan.live';

// Let AuthContext inject the current token getter so requests include Authorization
let _getToken: (() => Promise<string | null> | string | null) | undefined;
export function bindAuthTokenGetter(fn: () => Promise<string | null> | string | null) {
  _getToken = fn;
}

const http = createHttp({
  baseUrl: API_BASE,
  getToken: async () => (_getToken ? await _getToken() : null),
});

// ---- Types aligned with Swagger
export type RegisterUserBody = {
  name: string;
  email: string;
  language?: string;
  password: string;
};

export type RegisterUserResponse = {
  user_id: string;
  name: string;
  email: string;
  language?: string;
  email_verified?: boolean;
};

export type MagicLinkRequestResponse = {
  message: string;
  token?: string;
  expires_at?: string;
};

export type VerifyMagicLinkResponse = {
  token: string; // Sanctum token
  expires_at?: string; // token expiry if provided by backend
};

export type DevicePutBody = {
  name?: string | null;
  platform: string;
  operating_system: string;
  os_version: string;
  manufacturer: string;
  model: string;
  web_view_version?: string | null;
  app_version?: string | null;
  is_virtual: boolean;
  push_token?: string | null;
};

export type MeResponse = {
  user_id: string;
  name: string;
  email: string;
  language?: string;
  email_verified?: boolean;
};

// ---- API surface
export const authApi = {
  // Registration
  register(body: RegisterUserBody) {
    return http.request<RegisterUserResponse>('/auth/register', { method: 'POST', body });
  },

  // Magic link
  requestMagicLink(email: string) {
    return http.request<MagicLinkRequestResponse>('/auth/magic-link', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
    });
  },
  verifyMagicLink(plainToken: string) {
    return http.request<VerifyMagicLinkResponse>('/auth/magic-link/verify', {
      method: 'POST',
      body: { token: plainToken },
    });
  },

  // Email verification (requires Sanctum auth)
  requestEmailVerification() {
    return http.request<{ message?: string }>('/auth/email/verification', { method: 'GET' });
  },
  submitEmailVerification(code: string | number) {
    return http.request<{ message?: string }>('/auth/email/verification', {
      method: 'POST',
      body: { email_verification_code: Number(code) },
    });
  },

  // User
  getUser() {
    return http.request<MeResponse>('/auth/user', { method: 'GET' });
  },

  // Device
  putUserDevice(uuid: string, body: DevicePutBody) {
    return http.request<any>(`/auth/user/devices/${uuid}`, { method: 'PUT', body });
  },

  // Logout
  logout() {
    return http.request<void>('/auth/logout', { method: 'POST' });
  },
  logoutAll() {
    return http.request<void>('/auth/logout/all', { method: 'POST' });
  },
};
