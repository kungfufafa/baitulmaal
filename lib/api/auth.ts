import apiClient from './client';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../../types';

type BackendAuthResponse = {
  access_token?: string;
  token_type?: string;
};

const mapAuthResponse = async (payload: BackendAuthResponse): Promise<AuthResponse> => {
  const token = String(payload.access_token ?? '').trim();
  if (!token) {
    throw new Error('Missing access token from authentication response.');
  }

  const tokenType = (payload.token_type || 'Bearer').trim() || 'Bearer';

  try {
    const profileResponse = await apiClient.get<User>('/user', {
      headers: {
        Authorization: `${tokenType} ${token}`,
        'X-Auth-Bootstrap': '1',
      },
    });

    return {
      user: profileResponse.data,
      token,
    };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      throw error;
    }

    if (__DEV__) {
      console.warn('Auth bootstrap profile request failed; continuing with token only.', error);
    }

    return {
      user: null,
      token,
    };
  }
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<BackendAuthResponse>('/login', payload);
  return mapAuthResponse(response.data);
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<BackendAuthResponse>('/register', payload);
  return mapAuthResponse(response.data);
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/logout');
};

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/user');
  return response.data;
};
