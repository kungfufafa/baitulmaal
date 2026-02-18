import React, { createContext, useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Href, router } from 'expo-router';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile } from '@/lib/api/auth';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { AUTH_TOKEN_KEY } from '@/constants/keys';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    checkUser();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!isMountedRef.current) {
        return;
      }
      setUser(null);
      setLoading(false);
      router.replace('/(auth)/login' as Href);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const checkUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) {
        if (isMountedRef.current) {
          setLoading(false);
        }
        return;
      }

      if (!isMountedRef.current) return;

      try {
        const userData = await getProfile();
        if (isMountedRef.current) {
          setUser(userData);
        }
      } catch {
        if (isMountedRef.current) {
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          setUser(null);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Error checking user:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const resolveAuthenticatedUser = useCallback(async (userFromAuth: User | null, source: 'login' | 'register'): Promise<User> => {
    if (userFromAuth) {
      return userFromAuth;
    }

    try {
      return await getProfile();
    } catch (error) {
      if (__DEV__) console.warn(`Failed to bootstrap profile after ${source}`, error);
    }

    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    throw new Error('Autentikasi berhasil, tetapi profil akun tidak dapat dimuat. Silakan coba lagi.');
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    if (isMountedRef.current) setLoading(true);
    try {
      const response: AuthResponse = await apiLogin(payload);
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
      const resolvedUser = await resolveAuthenticatedUser(response.user, 'login');

      if (isMountedRef.current) {
        setUser(resolvedUser);
        router.replace('/(tabs)');
      }
    } catch (error) {
      if (__DEV__) console.error('Login error:', error);
      throw error;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [resolveAuthenticatedUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    if (isMountedRef.current) setLoading(true);
    try {
      const response: AuthResponse = await apiRegister(payload);
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
      const resolvedUser = await resolveAuthenticatedUser(response.user, 'register');

      if (isMountedRef.current) {
        setUser(resolvedUser);
        router.replace('/(tabs)');
      }
    } catch (error) {
      if (__DEV__) console.error('Register error:', error);
      throw error;
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [resolveAuthenticatedUser]);

  const logout = useCallback(async () => {
    if (isMountedRef.current) setLoading(true);
    try {
      await apiLogout();
    } catch (error) {
      if (__DEV__) console.error('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      if (isMountedRef.current) {
        setUser(null);
        setLoading(false);
        router.replace('/(auth)/login' as Href);
      }
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
