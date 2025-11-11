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
  googleLogin: (idToken: string) => Promise<void>;
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
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedAccessToken && storedUser) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.googleAuth({ idToken });
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
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
      const response = await authAPI.register({ email, password, name });
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
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