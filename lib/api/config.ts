const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
const fallbackApiUrl = 'http://localhost:8000/api';

if (!configuredApiUrl) {
  if (!__DEV__) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured. Set it in your environment.');
  }

  console.warn(`EXPO_PUBLIC_API_URL is not configured. Falling back to ${fallbackApiUrl}.`);
}

const raw = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, '');

export const API_URL = raw;
export const API_HOST = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
