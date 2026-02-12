import axios from 'axios';

// Replace with your actual API URL or an environment variable
// You can set this in your .env file: EXPO_PUBLIC_API_URL=https://your-api-url.com
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.baitulmaal.com/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Retrieve token from SecureStore or AsyncStorage
    // const token = await SecureStore.getItemAsync('userToken');
    const token = null; 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    // You can handle global errors here, like 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Handle session expiration
    }
    return Promise.reject(error);
  }
);

export default apiClient;
