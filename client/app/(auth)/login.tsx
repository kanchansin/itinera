import { useAuth } from '@/contexts/AuthContext';import { useAuth } from '@/contexts/AuthContext';

import { Ionicons } from '@expo/vector-icons';import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';import { LinearGradient } from 'expo-linear-gradient';

import * as Google from 'expo-auth-session/providers/google';import * as Google from 'expo-auth-session/providers/google';

import { Link, useRouter } from 'expo-router';import { Link, useRouter } from 'expo-router';

import React, { useRef, useState } from 'react';import React, { useRef, useState } from 'react';

import {import {

  Animated,  Animated,

  Dimensions,  Dimensions,

  KeyboardAvoidingView,  KeyboardAvoidingView,

  Platform,  Platform,

  StatusBar,  StatusBar,

  StyleSheet,  StyleSheet,

  Text,  Text,

  TextInput,  TextInput,

  TouchableOpacity,  TouchableOpacity,

  View,  View,

  Alert  Alert

} from 'react-native';} from 'react-native';



const { width, height } = Dimensions.get('window');const { width, height } = Dimensions.get('window');

const GOOGLE_CLIENT_ID = '986881743640-uu998ii86m2o8ug2p24fu24cp7da2o1j.apps.googleusercontent.com';const GOOGLE_CLIENT_ID = '986881743640-uu998ii86m2o8ug2p24fu24cp7da2o1j.apps.googleusercontent.com';



export default function LoginPage() {export default function LoginPage() {

  const [email, setEmail] = useState('');  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);  const [showPassword, setShowPassword] = useState(false);

  const { login, googleLogin, loading } = useAuth();  const { login, googleLogin, loading } = useAuth();

  const router = useRouter();  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({

    clientId: GOOGLE_CLIENT_ID,    clientId: GOOGLE_CLIENT_ID,

  });  });

  const fadeAnim = useRef(new Animated.Value(0)).current;  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(50)).current;  const slideAnim = useRef(new Animated.Value(50)).current;

  const signInButtonScale = useRef(new Animated.Value(1)).current;  const signInButtonScale = useRef(new Animated.Value(1)).current;

  const googleButtonScale = useRef(new Animated.Value(1)).current;  const googleButtonScale = useRef(new Animated.Value(1)).current;

  const scrollY = useRef(new Animated.Value(0)).current;  const scrollY = useRef(new Animated.Value(0)).current;

    

  const logoScale = scrollY.interpolate({  const logoScale = scrollY.interpolate({

    inputRange: [-100, 0, 100],    inputRange: [-100, 0, 100],

    outputRange: [1.2, 1, 0.8],    outputRange: [1.2, 1, 0.8],

    extrapolate: 'clamp'    extrapolate: 'clamp'

  });  });

    

  const headerOpacity = scrollY.interpolate({  const headerOpacity = scrollY.interpolate({

    inputRange: [0, 100],    inputRange: [0, 100],

    outputRange: [1, 0.3],    outputRange: [1, 0.3],

    extrapolate: 'clamp'    extrapolate: 'clamp'

  });  });



  React.useEffect(() => {  React.useEffect(() => {

    if (response?.type === 'success' && response.authentication) {    if (response?.type === 'success' && response.authentication) {

      const idToken = response.authentication.idToken;      const idToken = response.authentication.idToken;

      if (idToken) {      if (idToken) {

        handleGoogleSignIn(idToken);        handleGoogleSignIn(idToken);

      }      }

    }    }

  }, [response]);  }, [response]);



  React.useEffect(() => {  React.useEffect(() => {

    Animated.parallel([    Animated.parallel([

      Animated.timing(fadeAnim, {      Animated.timing(fadeAnim, {

        toValue: 1,        toValue: 1,

        duration: 1000,        duration: 1000,

        useNativeDriver: true,        useNativeDriver: true,

      }),      }),

      Animated.timing(slideAnim, {      Animated.timing(slideAnim, {

        toValue: 0,        toValue: 0,

        duration: 800,        duration: 800,

        useNativeDriver: true,        useNativeDriver: true,

      }),      }),

    ]).start();    ]).start();

  }, []);  }, []);



  const handleLogin = async () => {  const handleLogin = async () => {

    if (!email || !password) {    if (!email || !password) {

      Alert.alert('Error', 'Please fill in all fields');      Alert.alert('Error', 'Please fill in all fields');

      return;      return;

    }    }



    Animated.sequence([    Animated.sequence([

      Animated.timing(signInButtonScale, {      Animated.timing(signInButtonScale, {

        toValue: 0.95,        toValue: 0.95,

        duration: 100,        duration: 100,

        useNativeDriver: true,        useNativeDriver: true,

      }),      }),

      Animated.timing(signInButtonScale, {      Animated.timing(signInButtonScale, {

        toValue: 1,        toValue: 1,

        duration: 100,        duration: 100,

        useNativeDriver: true,        useNativeDriver: true,

      }),      }),

    ]).start();    ]).start();



    try {    try {

      await login(email, password);      await login(email, password);

      router.replace("/(tabs)");      router.replace("/(tabs)");

    } catch (err: any) {    } catch (err: any) {

      Alert.alert('Login Failed', err.message || 'Invalid credentials');      Alert.alert('Login Failed', err.message || 'Invalid credentials');

    }    }

  };  };



  const handleGoogleSignIn = async (idToken: string) => {  const handleGoogleSignIn = async (idToken: string) => {

    try {    try {

      await googleLogin(idToken);      await googleLogin(idToken);

      router.replace("/(tabs)");      router.replace("/(tabs)");

    } catch (err: any) {    } catch (err: any) {

      Alert.alert('Google Sign-In Failed', err.message || 'Failed to sign in with Google');      Alert.alert('Google Sign-In Failed', err.message || 'Failed to sign in with Google');

    }    }

  };  };



  const handleGoogleLogin = () => {  const handleGoogleLogin = () => {

    Animated.sequence([    Animated.sequence([

      Animated.timing(googleButtonScale, {      Animated.timing(googleButtonScale, {

        toValue: 0.95,        toValue: 0.95,

        duration: 100,        duration: 100,

        useNativeDriver: true,        useNativeDriver: true,

      }),      }),

      Animated.timing(googleButtonScale, {      Animated.timing(googleButtonScale, {

        toValue: 1,        toValue: 1,

        duration: 100,        duration: 100,

        useNativeDriver: true,        useNativeDriver: true,

      }),      }),

    ]).start(() => {    ]).start(() => {

      promptAsync();      promptAsync();

    });    });

  };  };



  return (  return (

    <KeyboardAvoidingView     <KeyboardAvoidingView 

      style={styles.container}       style={styles.container} 

      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}

    >    >

      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <LinearGradient      <LinearGradient

        colors={['#1a1a2e', '#16213e', '#0f3460']}        colors={['#1a1a2e', '#16213e', '#0f3460']}

        style={styles.gradient}        style={styles.gradient}

      >      >

        <Animated.ScrollView         <Animated.ScrollView 

          contentContainerStyle={styles.scrollContent}          contentContainerStyle={styles.scrollContent}

          showsVerticalScrollIndicator={false}          showsVerticalScrollIndicator={false}

          bounces={true}          bounces={true}

          keyboardShouldPersistTaps="handled"          keyboardShouldPersistTaps="handled"

          onScroll={Animated.event(          onScroll={Animated.event(

            [{ nativeEvent: { contentOffset: { y: scrollY } } }],            [{ nativeEvent: { contentOffset: { y: scrollY } } }],

            { useNativeDriver: true }            { useNativeDriver: true }

          )}          )}

          scrollEventThrottle={16}          scrollEventThrottle={16}

        >        >

          <Animated.View           <Animated.View 

            style={[            style={[

              styles.logoContainer,              styles.logoContainer,

              {              {

                opacity: Animated.multiply(fadeAnim, headerOpacity),                opacity: Animated.multiply(fadeAnim, headerOpacity),

                transform: [                transform: [

                  { translateY: slideAnim },                  { translateY: slideAnim },

                  { scale: logoScale }                  { scale: logoScale }

                ]                ]

              }              }

            ]}            ]}

          >          >

            <View style={styles.logoCircle}>            <View style={styles.logoCircle}>

              <Ionicons name="airplane" size={32} color="#ffffff" />              <Ionicons name="airplane" size={32} color="#ffffff" />

            </View>            </View>

            <Text style={styles.appName}>Itinera</Text>            <Text style={styles.appName}>Itinera</Text>

            <Text style={styles.tagline}>Explore the extraordinary</Text>            <Text style={styles.tagline}>Explore the extraordinary</Text>

          </Animated.View>          </Animated.View>



          <Animated.View           <Animated.View 

            style={[            style={[

              styles.formContainer,              styles.formContainer,

              {              {

                opacity: fadeAnim,                opacity: fadeAnim,

                transform: [{ translateY: slideAnim }]                transform: [{ translateY: slideAnim }]

              }              }

            ]}            ]}

          >          >

            <Text style={styles.welcomeTitle}>Hey there 👀</Text>            <Text style={styles.welcomeTitle}>Hey there 👀</Text>

            <Text style={styles.welcomeSubtitle}>Ready for your next journey?</Text>            <Text style={styles.welcomeSubtitle}>Ready for your next journey?</Text>



            <View style={styles.inputContainer}>            <View style={styles.inputContainer}>

              <Text style={styles.inputLabel}>Email</Text>              <Text style={styles.inputLabel}>Email</Text>

              <View style={styles.inputWrapper}>              <View style={styles.inputWrapper}>

                <Ionicons name="mail-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />                <Ionicons name="mail-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />

                <TextInput                <TextInput

                  style={styles.textInput}                  style={styles.textInput}

                  placeholder="traveler@Itinera.com"                  placeholder="traveler@Itinera.com"

                  placeholderTextColor="#8b9cb8"                  placeholderTextColor="#8b9cb8"

                  value={email}                  value={email}

                  onChangeText={setEmail}                  onChangeText={setEmail}

                  keyboardType="email-address"                  keyboardType="email-address"

                  autoCapitalize="none"                  autoCapitalize="none"

                  returnKeyType="next"                  returnKeyType="next"

                  editable={!loading}                  editable={!loading}

                />                />

              </View>              </View>

            </View>            </View>



            <View style={styles.inputContainer}>            <View style={styles.inputContainer}>

              <Text style={styles.inputLabel}>Password</Text>              <Text style={styles.inputLabel}>Password</Text>

              <View style={styles.inputWrapper}>              <View style={styles.inputWrapper}>

                <Ionicons name="lock-closed-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />                <Ionicons name="lock-closed-outline" size={20} color="#8b9cb8" style={styles.inputIcon} />

                <TextInput                <TextInput

                  style={styles.textInput}                  style={styles.textInput}

                  placeholder="••••••••"                  placeholder="••••••••"

                  placeholderTextColor="#8b9cb8"                  placeholderTextColor="#8b9cb8"

                  value={password}                  value={password}

                  onChangeText={setPassword}                  onChangeText={setPassword}

                  secureTextEntry={!showPassword}                  secureTextEntry={!showPassword}

                  returnKeyType="done"                  returnKeyType="done"

                  onSubmitEditing={handleLogin}                  onSubmitEditing={handleLogin}

                  editable={!loading}                  editable={!loading}

                />                />

                <TouchableOpacity                 <TouchableOpacity 

                  onPress={() => setShowPassword(!showPassword)}                  onPress={() => setShowPassword(!showPassword)}

                  style={styles.eyeIcon}                  style={styles.eyeIcon}

                >                >

                  <Ionicons                   <Ionicons 

                    name={showPassword ? "eye-outline" : "eye-off-outline"}                     name={showPassword ? "eye-outline" : "eye-off-outline"} 

                    size={20}                     size={20} 

                    color="#8b9cb8"                     color="#8b9cb8" 

                  />                  />

                </TouchableOpacity>                </TouchableOpacity>

              </View>              </View>

            </View>            </View>



            <TouchableOpacity style={styles.forgotPassword}>            <TouchableOpacity style={styles.forgotPassword}>

              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>

            </TouchableOpacity>            </TouchableOpacity>



            <Animated.View style={[styles.signInButton, { transform: [{ scale: signInButtonScale }] }]}>            <Animated.View style={[styles.signInButton, { transform: [{ scale: signInButtonScale }] }]}>

              <TouchableOpacity onPress={handleLogin} disabled={loading}>              <TouchableOpacity onPress={handleLogin} disabled={loading}>

                <LinearGradient                <LinearGradient

                  colors={['#ff7b54', '#ff9a8b']}                  colors={['#ff7b54', '#ff9a8b']}

                  start={[0, 0]}                  start={[0, 0]}

                  end={[1, 0]}                  end={[1, 0]}

                  style={[styles.signInGradient, loading && { opacity: 0.6 }]}                  style={[styles.signInGradient, loading && { opacity: 0.6 }]}

                >                >

                  <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>                  <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>

                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />

                </LinearGradient>                </LinearGradient>

              </TouchableOpacity>              </TouchableOpacity>

            </Animated.View>            </Animated.View>



            <Text style={styles.orText}>or</Text>            <Text style={styles.orText}>or</Text>



            <Animated.View style={{ transform: [{ scale: googleButtonScale }] }}>            <Animated.View style={{ transform: [{ scale: googleButtonScale }] }}>

              <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton} disabled={loading}>              <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleButton} disabled={loading}>

                <View style={styles.googleButtonContent}>                <View style={styles.googleButtonContent}>

                  <Ionicons name="logo-google" size={20} color="#ffffff" style={styles.googleIcon} />                  <Ionicons name="logo-google" size={20} color="#ffffff" style={styles.googleIcon} />

                  <Text style={styles.googleText}>Continue with Google</Text>                  <Text style={styles.googleText}>Continue with Google</Text>

                </View>                </View>

              </TouchableOpacity>              </TouchableOpacity>

            </Animated.View>            </Animated.View>



            <View style={styles.signUpContainer}>            <View style={styles.signUpContainer}>

              <Text style={styles.signUpText}>Don't have an account? </Text>              <Text style={styles.signUpText}>Don't have an account? </Text>

              <Link href="/(auth)/signup" asChild>              <Link href="/(auth)/signup" asChild>

                <TouchableOpacity>                <TouchableOpacity>

                  <Text style={styles.signUpLink}>Sign Up</Text>                  <Text style={styles.signUpLink}>Sign Up</Text>

                </TouchableOpacity>                </TouchableOpacity>

              </Link>              </Link>

            </View>            </View>

          </Animated.View>          </Animated.View>

        </Animated.ScrollView>        </Animated.ScrollView>

      </LinearGradient>      </LinearGradient>

    </KeyboardAvoidingView>    </KeyboardAvoidingView>

  );  );

}}



const styles = StyleSheet.create({const styles = StyleSheet.create({

  container: {  container: {

    flex: 1,    flex: 1,

  },  },

  gradient: {  gradient: {

    flex: 1,    flex: 1,

  },  },

  scrollContent: {  scrollContent: {

    flexGrow: 1,    flexGrow: 1,

    paddingHorizontal: 28,    paddingHorizontal: 28,

    paddingTop: Platform.OS === 'ios' ? 80 : 60,    paddingTop: Platform.OS === 'ios' ? 80 : 60,

    paddingBottom: 40,    paddingBottom: 40,

  },  },

  logoContainer: {  logoContainer: {

    alignItems: 'center',    alignItems: 'center',

    marginBottom: 48,    marginBottom: 48,

  },  },

  logoCircle: {  logoCircle: {

    width: 80,    width: 80,

    height: 80,    height: 80,

    borderRadius: 40,    borderRadius: 40,

    backgroundColor: '#ff7b54',    backgroundColor: '#ff7b54',

    justifyContent: 'center',    justifyContent: 'center',

    alignItems: 'center',    alignItems: 'center',

    marginBottom: 16,    marginBottom: 16,

    shadowColor: '#ff7b54',    shadowColor: '#ff7b54',

    shadowOffset: { width: 0, height: 8 },    shadowOffset: { width: 0, height: 8 },

    shadowOpacity: 0.3,    shadowOpacity: 0.3,

    shadowRadius: 16,    shadowRadius: 16,

    elevation: 8,    elevation: 8,

  },  },

  appName: {  appName: {

    fontSize: 42,    fontSize: 42,

    fontWeight: '700',    fontWeight: '700',

    color: '#ffffff',    color: '#ffffff',

    marginBottom: 8,    marginBottom: 8,

    textShadowColor: 'rgba(255, 123, 84, 0.5)',    textShadowColor: 'rgba(255, 123, 84, 0.5)',

    textShadowOffset: { width: 2, height: 2 },    textShadowOffset: { width: 2, height: 2 },

    textShadowRadius: 10,    textShadowRadius: 10,

    letterSpacing: 2,    letterSpacing: 2,

    fontFamily: Platform.select({    fontFamily: Platform.select({

      ios: 'Zapfino',      ios: 'Zapfino',

      android: 'cursive',      android: 'cursive',

      default: 'cursive'      default: 'cursive'

    }),    }),

    transform: [{ scale: 1.2 }],    transform: [{ scale: 1.2 }],

  },  },

  tagline: {  tagline: {

    fontSize: 18,    fontSize: 18,

    color: '#a8b2d1',    color: '#a8b2d1',

    fontStyle: 'italic',    fontStyle: 'italic',

    letterSpacing: 1,    letterSpacing: 1,

    opacity: 0.9,    opacity: 0.9,

    textShadowColor: 'rgba(255, 123, 84, 0.3)',    textShadowColor: 'rgba(255, 123, 84, 0.3)',

    textShadowOffset: { width: 1, height: 1 },    textShadowOffset: { width: 1, height: 1 },

    textShadowRadius: 4,    textShadowRadius: 4,

    fontFamily: Platform.select({    fontFamily: Platform.select({

      ios: 'Helvetica Neue',      ios: 'Helvetica Neue',

      android: 'sans-serif-light',      android: 'sans-serif-light',

      default: 'system-ui'      default: 'system-ui'

    }),    }),

  },  },

  formContainer: {  formContainer: {

    flex: 1,    flex: 1,

    backgroundColor: '#2d3561',    backgroundColor: '#2d3561',

    borderTopLeftRadius: 30,    borderTopLeftRadius: 30,

    borderTopRightRadius: 30,    borderTopRightRadius: 30,

    paddingHorizontal: 20,    paddingHorizontal: 20,

    paddingTop: 32,    paddingTop: 32,

    paddingBottom: 32,    paddingBottom: 32,

    minHeight: height * 0.6,    minHeight: height * 0.6,

    shadowColor: '#000',    shadowColor: '#000',

    shadowOffset: { width: 0, height: -8 },    shadowOffset: { width: 0, height: -8 },

    shadowOpacity: 0.25,    shadowOpacity: 0.25,

    shadowRadius: 24,    shadowRadius: 24,

    elevation: 12,    elevation: 12,

  },  },

  welcomeTitle: {  welcomeTitle: {

    fontSize: 26,    fontSize: 26,

    fontWeight: '600',    fontWeight: '600',

    color: '#ffffff',    color: '#ffffff',

    marginBottom: 2,    marginBottom: 2,

    letterSpacing: 0.5,    letterSpacing: 0.5,

    fontFamily: Platform.select({    fontFamily: Platform.select({

      ios: 'Helvetica Neue',      ios: 'Helvetica Neue',

      android: 'sans-serif-medium',      android: 'sans-serif-medium',

      default: 'system-ui'      default: 'system-ui'

    }),    }),

    textAlign: 'left',    textAlign: 'left',

  },  },

  welcomeSubtitle: {  welcomeSubtitle: {

    fontSize: 15,    fontSize: 15,

    color: '#a8b2d1',    color: '#a8b2d1',

    marginBottom: 30,    marginBottom: 30,

    letterSpacing: 0.3,    letterSpacing: 0.3,

    fontFamily: Platform.select({    fontFamily: Platform.select({

      ios: 'Helvetica Neue',      ios: 'Helvetica Neue',

      android: 'sans-serif-light',      android: 'sans-serif-light',

      default: 'system-ui'      default: 'system-ui'

    }),    }),

    opacity: 0.85,    opacity: 0.85,

    textAlign: 'left',    textAlign: 'left',

    fontWeight: '400',    fontWeight: '400',

  },  },

  inputContainer: {  inputContainer: {

    marginBottom: 24,    marginBottom: 24,

  },  },

  inputLabel: {  inputLabel: {

    fontSize: 16,    fontSize: 16,

    color: '#ffffff',    color: '#ffffff',

    marginBottom: 5,    marginBottom: 5,

    fontWeight: '600',    fontWeight: '600',

    letterSpacing: 0.5,    letterSpacing: 0.5,

    opacity: 0.95,    opacity: 0.95,

    fontFamily: Platform.select({    fontFamily: Platform.select({

      ios: 'Helvetica Neue',      ios: 'Helvetica Neue',

      android: 'sans-serif-medium',      android: 'sans-serif-medium',

      default: 'system-ui'      default: 'system-ui'

    }),    }),

  },  },

  inputWrapper: {  inputWrapper: {

    flexDirection: 'row',    flexDirection: 'row',

    alignItems: 'center',    alignItems: 'center',

    backgroundColor: '#1e2749',    backgroundColor: '#1e2749',

    borderRadius: 12,    borderRadius: 12,

    paddingHorizontal: 16,    paddingHorizontal: 16,

    height: 54,    height: 54,

    borderWidth: 1,    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.08)',    borderColor: 'rgba(255, 255, 255, 0.08)',

    shadowColor: '#000',    shadowColor: '#000',

    shadowOffset: { width: 0, height: 4 },    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.15,    shadowOpacity: 0.15,

    shadowRadius: 12,    shadowRadius: 12,

    elevation: 4,    elevation: 4,

    width: '100%',    width: '100%',

  },  },

  inputIcon: {  inputIcon: {

    marginRight: 12,    marginRight: 12,

  },  },

  textInput: {  textInput: {

    flex: 1,    flex: 1,

    color: '#ffffff',    color: '#ffffff',

    fontSize: 16,    fontSize: 16,

  },  },

  eyeIcon: {  eyeIcon: {

    padding: 4,    padding: 4,

  },  },

  forgotPassword: {  forgotPassword: {

    alignSelf: 'flex-end',    alignSelf: 'flex-end',

    marginBottom: 40,    marginBottom: 40,

    marginTop: 8,    marginTop: 8,

  },  },

  forgotPasswordText: {  forgotPasswordText: {

    color: '#ff7b54',    color: '#ff7b54',

    fontSize: 14,    fontSize: 14,

  },  },

  signInButton: {  signInButton: {

    marginBottom: 12,    marginBottom: 12,

  },  },

  signInGradient: {  signInGradient: {

    flexDirection: 'row',    flexDirection: 'row',

    alignItems: 'center',    alignItems: 'center',

    justifyContent: 'center',    justifyContent: 'center',

    height: 45,    height: 45,

    borderRadius: 12,    borderRadius: 12,

  },  },

  signInText: {  signInText: {

    color: '#ffffff',    color: '#ffffff',

    fontSize: 16,    fontSize: 16,

    fontWeight: '600',    fontWeight: '600',

    marginRight: 8,    marginRight: 8,

  },  },

  orText: {  orText: {

    textAlign: 'center',    textAlign: 'center',

    color: '#8b9cb8',    color: '#8b9cb8',

    fontSize: 16,    fontSize: 16,

    marginBottom: 12,    marginBottom: 12,

  },  },

  googleButton: {  googleButton: {

    backgroundColor: '#1e2749',    backgroundColor: '#1e2749',

    height: 45,    height: 45,

    borderRadius: 12,    borderRadius: 12,

    justifyContent: 'center',    justifyContent: 'center',

    alignItems: 'center',    alignItems: 'center',

    marginBottom: 24,    marginBottom: 24,

    borderWidth: 1,    borderWidth: 1,

    borderColor: '#374151',    borderColor: '#374151',

  },  },

  googleButtonContent: {  googleButtonContent: {

    flexDirection: 'row',    flexDirection: 'row',

    alignItems: 'center',    alignItems: 'center',

    justifyContent: 'center',    justifyContent: 'center',

  },  },

  googleIcon: {  googleIcon: {

    marginRight: 12,    marginRight: 12,

  },  },

  googleText: {  googleText: {

    color: '#ffffff',    color: '#ffffff',

    fontSize: 16,    fontSize: 16,

    fontWeight: '500',    fontWeight: '500',

  },  },

  signUpContainer: {  signUpContainer: {

    flexDirection: 'row',    flexDirection: 'row',

    justifyContent: 'center',    justifyContent: 'center',

    alignItems: 'center',    alignItems: 'center',

  },  },

  signUpText: {  signUpText: {

    color: '#8b9cb8',    color: '#8b9cb8',

    fontSize: 16,    fontSize: 16,

  },  },

  signUpLink: {  signUpLink: {

    color: '#ff7b54',    color: '#ff7b54',

    fontSize: 16,    fontSize: 16,

    fontWeight: '600',    fontWeight: '600',

  },  },

});});
