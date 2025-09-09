// src/services/resources.ts
import { createHttp } from '@/src/lib/http';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://mayan.live';
const http = createHttp({ baseUrl: API_BASE });

export type Language = { value: string; label: string };

export const resourcesApi = {
  getLanguages() {
    // Swagger: GET /resources/languages -> Language[]
    return http.request<Language[]>('/resources/languages', { method: 'GET' });
  },
};
