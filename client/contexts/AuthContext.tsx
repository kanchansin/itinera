import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string, displayName?: string, email?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      console.log('[AUTH] Bootstrapping - checking for stored session');
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedAccessToken && storedUser) {
        console.log('[AUTH] Stored session found');
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        console.log('[AUTH] Session restored');
      } else {
        console.log('[AUTH] No stored session found');
      }
    } catch (e) {
      console.error('[AUTH] Failed to restore session:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[AUTH] Login started for:', email);
      const response = await authAPI.login({ email, password });
      console.log('[AUTH] Login response received:', response);
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      console.log('[AUTH] Storing tokens in AsyncStorage');
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      console.log('[AUTH] Updating state');
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('[AUTH] Login completed successfully');
    } catch (err: any) {
      console.error('[AUTH] Login error caught:', err);
      console.error('[AUTH] Error message:', err.message);
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string, displayName?: string, email?: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[AUTH] Google login started');
      const response = await authAPI.googleAuth({
        idToken,
        displayName: displayName || '',
        email: email || ''
      });
      console.log('[AUTH] Google login response received:', response);
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      console.log('[AUTH] Storing tokens in AsyncStorage');
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      console.log('[AUTH] Updating state');
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('[AUTH] Google login completed successfully');
    } catch (err: any) {
      console.error('[AUTH] Google login error caught:', err);
      console.error('[AUTH] Error message:', err.message);
      const errorMessage = err.message || 'Google login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[AUTH] Register started for:', email);
      const response = await authAPI.register({ email, password, name });
      console.log('[AUTH] Register response received:', response);
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      console.log('[AUTH] Storing tokens in AsyncStorage');
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      console.log('[AUTH] Updating state');
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('[AUTH] Register completed successfully');
    } catch (err: any) {
      console.error('[AUTH] Register error caught:', err);
      console.error('[AUTH] Error message:', err.message);
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Logout started');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('[AUTH] Logout completed successfully');
    } catch (err) {
      console.error('[AUTH] Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        refreshToken,
        login,
        googleLogin,
        register,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}