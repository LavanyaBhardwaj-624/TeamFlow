import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/modules/auth/useAuthStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

/**
 * 1. authClient:
 * Used for Login and Signup (and Logout).
 * Sends and receives cookies (withCredentials: true), no access token required upfront.
 */
export const authClient = axios.create({
  baseURL: AUTH_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 2. refreshClient:
 * Dedicated instance exclusively for /refreshPoint.
 * Authenticates by sending credentials (refreshToken cookie) to validate session
 * and fetch a rotated access token.
 */
export const refreshClient = axios.create({
  baseURL: AUTH_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 3. apiClient:
 * General Axios instance for protected application resources (workspaces, tasks, etc.).
 * Includes request interceptor for attaching the in-memory access token from Zustand,
 * and response interceptor for tracking rotated tokens and retrying on 401 via refreshClient.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue state for handling concurrent 401 refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach in-memory access token from Zustand store
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Read x-access-token header & handle 401 refresh queue
apiClient.interceptors.response.use(
  (response) => {
    // If server rotated token and sent in exposed header
    const newAccessToken = response.headers['x-access-token'];
    if (newAccessToken && typeof newAccessToken === 'string') {
      useAuthStore.getState().setToken(newAccessToken);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refreshPoint directly with refreshClient
      const refreshResponse = await refreshClient.post('/refreshPoint');
      const responseData = refreshResponse.data?.data;
      // console.log(refreshResponse)
      const newToken: string | undefined = responseData?.accesstoken || responseData?.accessToken;

      if (!newToken) {
        throw new Error('No access token in refresh response');
      }

      // Update Zustand in-memory store
      useAuthStore.getState().setToken(newToken);
      if (responseData.user) {
        useAuthStore.getState().setUser(responseData.user);
      }

      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      // Session has expired or is invalid: clear Zustand state
      useAuthStore.getState().setAuth(null, null);
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Helper to extract human-readable error messages from Axios or backend responses
 */
export function getErrorMessage(err: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (data?.message) {
      return data.message;
    }
    if (typeof data === 'string' && data.length < 200) {
      return data;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallbackMessage;
}

