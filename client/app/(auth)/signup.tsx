import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  Alert,
  ScrollView
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, googleLogin, loading } = useAuth();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the terms of service and privacy policy');
      return;
    }

    try {
      await register(email, password, name);
      Alert.alert('Success', 'Account created successfully. Please sign in.');
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message || 'Failed to create account');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#e8d8f0', '#f0e8f8', '#d8c8e8']}
        style={styles.background}
      >
        <View style={styles.blobContainer}>
          <LinearGradient
            colors={['rgba(220, 180, 240, 0.5)', 'rgba(200, 160, 230, 0.4)']}
            style={[styles.blob, styles.blob1]}
          />
          <LinearGradient
            colors={['rgba(210, 170, 240, 0.4)', 'rgba(180, 140, 220, 0.5)']}
            style={[styles.blob, styles.blob2]}
          />
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{
              opacity: fadeAnim,
            }}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.glassCard}>
                <Text style={styles.title}>Create{'\n'}your account</Text>

                <View style={styles.inputContainer}>
                  <View style={styles.inputGlass}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your Name"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={name}
                      onChangeText={setName}
                      returnKeyType="next"
                      editable={!loading}
                    />
                  </View>
                  <View style={styles.inputUnderline} />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputGlass}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Email"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      editable={!loading}
                    />
                  </View>
                  <View style={styles.inputUnderline} />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputGlass}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
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
                        color="rgba(255, 255, 255, 0.7)" 
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputUnderline} />
                </View>

                <TouchableOpacity 
                  style={styles.termsContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <View style={styles.checkbox}>
                    {agreedToTerms && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    by signing up you agree to the terms{'\n'}of service and privacy policy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.signUpButton} 
                  onPress={handleSignup} 
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2d2d2d', '#1a1a1a']}
                    style={styles.signUpGradient}
                  >
                    <Text style={styles.signUpButtonText}>
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleGoogleLogin} 
                  style={styles.googleButton}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <View style={styles.googleButtonContent}>
                    <Ionicons name="logo-google" size={20} color="#2d2d2d" />
                    <Text style={styles.googleButtonText}>Sign up with Google</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.logInContainer}>
                  <Text style={styles.logInText}>Already have account? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.logInLink}>Log In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </Animated.View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    borderRadius: 1000,
  },
  blob1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 350,
    height: 350,
    bottom: -50,
    left: -80,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 30,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 40,
    lineHeight: 38,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 8,
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  signUpButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpGradient: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleButtonText: {
    color: '#2d2d2d',
    fontSize: 15,
    fontWeight: '600',
  },
  logInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  logInLink: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});