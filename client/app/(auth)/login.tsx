import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import { Link, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { getGoogleAuthConfig } from '@/config/googleAuth';

const { width, height } = Dimensions.get('window');
const googleAuthConfig = getGoogleAuthConfig();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, loading } = useAuth();
  const router = useRouter();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleAuthConfig);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const signInButtonScale = useRef(new Animated.Value(1)).current;
  const googleButtonScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const logoScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.3],
    extrapolate: 'clamp'
  });

  React.useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { idToken, accessToken } = response.authentication;
      if (idToken) {
        handleGoogleSignIn(idToken, accessToken);
      }
    }
  }, [response]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('[LOGIN] Attempting login with email:', email);

    Animated.sequence([
      Animated.timing(signInButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(signInButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      console.log('[LOGIN] Calling login function');
      await login(email, password);
      console.log('[LOGIN] Login successful, navigating to home');
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log('[LOGIN] Login failed with error:', err.message);
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    }
  };

  const handleGoogleSignIn = async (idToken: string, accessToken?: string) => {
    try {
      console.log('[GOOGLE_LOGIN] Starting Google sign-in process');
      console.log('[GOOGLE_LOGIN] Fetching user info from Google');
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken || idToken}` },
      });
      
      const userInfo = await userInfoResponse.json();
      console.log('[GOOGLE_LOGIN] User info received:', userInfo.email);
      
      console.log('[GOOGLE_LOGIN] Calling googleLogin with idToken and user info');
      await googleLogin(idToken, userInfo.name, userInfo.email);
      console.log('[GOOGLE_LOGIN] Google login successful, navigating to home');
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log('[GOOGLE_LOGIN] Google sign-in failed with error:', err.message);
      Alert.alert('Google Sign-In Failed', err.message || 'Failed to sign in with Google');
    }
  };

  const handleGoogleLogin = () => {
    console.log('[GOOGLE_LOGIN] Initiating Google authentication flow');
    Animated.sequence([
      Animated.timing(googleButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(googleButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('[GOOGLE_LOGIN] Calling promptAsync');
      promptAsync();
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: Animated.multiply(fadeAnim, headerOpacity),
                transform: [
                  { translateY: slideAnim },
                  { scale: logoScale }
                ]
              }
            ]}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="airplane" size={32} color="#ffffff" />
            </View>
            <Text style={styles.appName}>Itinera</Text>
            <Text style={styles.tagline}>Explore the extraordinary</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.welcomeTitle}>Hey there 👀</Text>
            <Text style={styles.welcomeSubtitle}>Ready for your next journey?</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="traveler@Itinera.com"
                  placeholderTextColor="#8b9cb8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#8b9cb8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#8b9cb8" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.signInButton, { transform: [{ scale: signInButtonScale }] }]}>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={['#ff7b54', '#ff9a8b']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[styles.signInGradient, loading && { opacity: 0.6 }]}
                >
                  <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.orText}>or</Text>

            <Animated.View style={{ transform: [{ scale: googleButtonScale }] }}>
              <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton} disabled={loading}>
                <View style={styles.googleButtonContent}>
                  <Ionicons name="logo-google" size={20} color="#ffffff" style={styles.googleIcon} />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff7b54',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ff7b54',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 123, 84, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'Zapfino',
      android: 'cursive',
      default: 'cursive'
    }),
    transform: [{ scale: 1.2 }],
  },
  tagline: {
    fontSize: 18,
    color: '#a8b2d1',
    fontStyle: 'italic',
    letterSpacing: 1,
    opacity: 0.9,
    textShadowColor: 'rgba(255, 123, 84, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-light',
      default: 'system-ui'
    }),
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#2d3561',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-medium',
      default: 'system-ui'
    }),
    textAlign: 'left',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#a8b2d1',
    marginBottom: 30,
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-light',
      default: 'system-ui'
    }),
    opacity: 0.85,
    textAlign: 'left',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.95,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif-medium',
      default: 'system-ui'
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2749',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 40,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#ff7b54',
    fontSize: 14,
  },
  signInButton: {
    marginBottom: 12,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderRadius: 12,
  },
  signInText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  orText: {
    textAlign: 'center',
    color: '#8b9cb8',
    fontSize: 16,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#1e2749',
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#8b9cb8',
    fontSize: 16,
  },
  signUpLink: {
    color: '#ff7b54',
    fontSize: 16,
    fontWeight: '600',
  },
});