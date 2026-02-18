import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '@/constants/keys';
import { API_URL } from './config';

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let isHandling401 = false;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

const getHeaderValue = (headers: unknown, key: string): string | undefined => {
  if (!headers) return undefined;

  const normalizedKey = key.toLowerCase();
  const maybeAxiosHeaders = headers as { get?: (headerName: string) => unknown };
  if (typeof maybeAxiosHeaders.get === 'function') {
    const value = maybeAxiosHeaders.get(key) ?? maybeAxiosHeaders.get(normalizedKey);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  const plainHeaders = headers as Record<string, unknown>;
  const directValue = plainHeaders[key] ?? plainHeaders[normalizedKey];
  if (typeof directValue === 'string' && directValue.trim().length > 0) {
    return directValue;
  }

  const matchedKey = Object.keys(plainHeaders).find(
    (headerKey) => headerKey.toLowerCase() === normalizedKey
  );
  if (!matchedKey) return undefined;

  const matchedValue = plainHeaders[matchedKey];
  return typeof matchedValue === 'string' && matchedValue.trim().length > 0
    ? matchedValue
    : undefined;
};

const setAuthHeader = (headers: unknown, token: string): void => {
  if (!headers) return;

  const maybeAxiosHeaders = headers as { set?: (headerName: string, value: string) => void };
  if (typeof maybeAxiosHeaders.set === 'function') {
    maybeAxiosHeaders.set('Authorization', `Bearer ${token}`);
    return;
  }

  (headers as Record<string, string>).Authorization = `Bearer ${token}`;
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for better mobile network support
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const existingAuthorization = getHeaderValue(config.headers, 'Authorization');
      if (existingAuthorization) {
        return config;
      }

      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) {
        config.headers = config.headers ?? {};
        setAuthHeader(config.headers, token);
      }
    } catch (error) {
      if (__DEV__) console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log error for debugging
    if (__DEV__) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;
      const requestUrl = String(error.config?.url || '');
      const isPublicAuthRequest = /\/(login|register)(\?.*)?$/.test(requestUrl);
      const skipUnauthorizedHandler = getHeaderValue(error.config?.headers, 'X-Auth-Bootstrap') === '1';

      // Handle session expiration
      if (status === 401 && !isHandling401 && !isPublicAuthRequest && !skipUnauthorizedHandler) {
        isHandling401 = true;
        try {
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          unauthorizedHandler?.();
        } catch (e) {
          if (__DEV__) console.error('Error removing token:', e);
        } finally {
          isHandling401 = false;
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      if (__DEV__) console.error('No response received from server');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
