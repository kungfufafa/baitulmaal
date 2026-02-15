const raw = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

if (!raw || raw.trim().length === 0) {
  if (!__DEV__) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured. Set it in your .env file.');
  }
  console.warn('API URL is not configured. Please set EXPO_PUBLIC_API_URL in your .env file');
}

export const API_URL = raw;
export const API_HOST = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
