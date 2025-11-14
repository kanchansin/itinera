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

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, googleLogin, loading } = useAuth();
  const router = useRouter();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(googleAuthConfig);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const signUpButtonScale = useRef(new Animated.Value(1)).current;
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
      const idToken = response.authentication.idToken;
      if (idToken) {
        handleGoogleSignIn(idToken);
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

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    console.log('[SIGNUP] Attempting signup with email:', email);

    Animated.sequence([
      Animated.timing(signUpButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(signUpButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      console.log('[SIGNUP] Calling register function');
      await register(email, password, name);
      console.log('[SIGNUP] Signup successful, navigating to home');
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log('[SIGNUP] Signup failed with error:', err.message);
      Alert.alert('Signup Failed', err.message || 'Failed to create account');
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      console.log('[GOOGLE_SIGNUP] Starting Google sign-in process');
      console.log('[GOOGLE_SIGNUP] Calling googleLogin with idToken');
      await googleLogin(idToken);
      console.log('[GOOGLE_SIGNUP] Google signup successful, navigating to home');
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log('[GOOGLE_SIGNUP] Google sign-in failed with error:', err.message);
      Alert.alert('Google Sign-In Failed', err.message || 'Failed to sign in with Google');
    }
  };

  const handleGoogleLogin = () => {
    console.log('[GOOGLE_SIGNUP] Initiating Google authentication flow');
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
      console.log('[GOOGLE_SIGNUP] Calling promptAsync');
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
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Join us for a better travel experience</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8b9cb8"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>
            </View>

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
                  onSubmitEditing={handleSignup}
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

            <Animated.View style={[styles.signInButton, { transform: [{ scale: signUpButtonScale }] }]}>
              <TouchableOpacity onPress={handleSignup} disabled={loading}>
                <LinearGradient
                  colors={['#ff7b54', '#ff9a8b']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[styles.signInGradient, loading && { opacity: 0.6 }]}
                >
                  <Text style={styles.signInText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
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
              <Text style={styles.signUpText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign In</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 16,
    color: '#8b9cb8',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#2d3561',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: height * 0.65,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8b9cb8',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2749',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
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
  signInButton: {
    marginBottom: 24,
    marginTop: 12,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
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
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: '#1e2749',
    height: 56,
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