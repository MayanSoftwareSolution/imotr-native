// src/lib/http.ts

// A typed error that carries HTTP status + parsed response
export class ApiError<T = unknown> extends Error {
  status: number;
  data?: T;

  constructor(status: number, data?: T, message?: string) {
    const fallback = `HTTP ${status}`;
    const inferred =
      data && typeof (data as any)?.message === 'string'
        ? ((data as any).message as string)
        : undefined;
    super(message ?? inferred ?? fallback);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type GetToken = () => string | null | Promise<string | null>;

type HttpOptions = {
  baseUrl: string; // e.g. https://api.example.com or https://api.example.com/api
  getToken?: GetToken; // inject bearer token lazily
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number; // default 15s
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any; // objects auto-JSON unless Content-Type overridden or FormData
  timeoutMs?: number;
  raw?: boolean; // return Response instead of parsed JSON
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']) {
  const base = baseUrl.replace(/\/$/, '');
  const rel = path.replace(/^\//, '');
  let url = `${base}/${rel}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      qs.append(k, String(v));
    }
    url += `?${qs.toString()}`;
  }
  return url;
}

export function createHttp({ baseUrl, getToken, defaultHeaders, timeoutMs = 15000 }: HttpOptions) {
  const request = async <T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? timeoutMs);

    try {
      const url = buildUrl(baseUrl, path, opts.query);

      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(defaultHeaders ?? {}),
        ...(opts.headers ?? {}),
      };

      // Attach Bearer token if available
      const token = getToken ? await getToken() : null;
      if (token) headers.Authorization = `Bearer ${token}`;

      let body = opts.body;
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

      if (body && typeof body === 'object' && !isFormData) {
        // Default to JSON if caller didn't specify Content-Type
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
        if (headers['Content-Type']?.includes('application/json')) {
          body = JSON.stringify(body);
        }
      }

      const res = await fetch(url, {
        method: opts.method ?? (body ? 'POST' : 'GET'),
        headers,
        body,
        signal: controller.signal,
      });

      if (opts.raw) {
        // Caller handles Response directly
        return res as unknown as T;
      }

      const text = await res.text();
      let data: unknown = undefined;
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch {
        // Not JSON; return as text if successful, else include raw in error
        data = text;
      }

      if (!res.ok) {
        throw new ApiError(res.status, data);
      }

      return data as T;
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        throw new ApiError(408, undefined, 'Request timeout');
      }
      if (e instanceof ApiError) throw e;
      // Network / unknown
      throw new ApiError(0, undefined, e?.message ?? 'Network error');
    } finally {
      clearTimeout(timeout);
    }
  };

  // Optional sugar methods
  const get = <T = unknown>(path: string, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...(opts ?? {}), method: 'GET' });
  const post = <T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...(opts ?? {}), method: 'POST', body });
  const put = <T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...(opts ?? {}), method: 'PUT', body });
  const patch = <T = unknown>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...(opts ?? {}), method: 'PATCH', body });
  const del = <T = unknown>(path: string, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...(opts ?? {}), method: 'DELETE' });

  return { request, get, post, put, patch, del };
}

export type HttpClient = ReturnType<typeof createHttp>;
