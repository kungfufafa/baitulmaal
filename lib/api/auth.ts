import apiClient from './client';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../../types';

type BackendAuthResponse = {
  access_token: string;
  token_type?: string;
};

const mapAuthResponse = async (payload: BackendAuthResponse): Promise<AuthResponse> => {
  const token = payload.access_token;
  const tokenType = payload.token_type || 'Bearer';

  const profileResponse = await apiClient.get<User>('/user', {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });

  return {
    user: profileResponse.data,
    token,
  };
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
