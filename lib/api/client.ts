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
        const headers = config.headers as Record<string, unknown> | undefined;
        const existingAuthorization = headers?.Authorization ?? headers?.authorization;
        if (existingAuthorization) {
          return config;
        }

        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
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

      // Handle session expiration
      if (status === 401 && !isHandling401) {
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
