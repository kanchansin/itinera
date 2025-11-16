import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
  googleLogin: () => Promise<void>;
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

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      android: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      web: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    }),
  });

  useEffect(() => {
    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignInWithToken(id_token);
    }
  }, [response]);

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

  const handleGoogleSignInWithToken = async (idToken: string) => {
    try {
      console.log('[GOOGLE_AUTH] Signing in with Firebase credential');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      console.log('[GOOGLE_AUTH] Firebase sign-in successful');
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      };

      console.log('[GOOGLE_AUTH] Storing tokens in AsyncStorage');
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('refreshToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      console.log('[GOOGLE_AUTH] Updating state');
      setAccessToken(token);
      setRefreshToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('[GOOGLE_AUTH] Google login completed successfully');
    } catch (err: any) {
      console.error('[GOOGLE_AUTH] Error:', err);
      throw new Error(err.message || 'Google sign-in failed');
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[AUTH] Login started for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AUTH] Login response received');
      
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      };

      console.log('[AUTH] Storing tokens in AsyncStorage');
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('refreshToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      console.log('[AUTH] Updating state');
      setAccessToken(token);
      setRefreshToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('[AUTH] Login completed successfully');
    } catch (err: any) {
      console.error('[AUTH] Login error caught:', err);
      let errorMessage = 'Login failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[AUTH] Google login started');
      const result = await promptAsync();
      if (result.type !== 'success') {
        throw new Error('Google sign-in was cancelled');
      }
    } catch (err: any) {
      console.error('[AUTH] Google login error caught:', err);
      const errorMessage = err.message || 'Google login failed';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('[AUTH] Register error caught:', err);
      let errorMessage = 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Logout started');
      await signOut(auth);
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