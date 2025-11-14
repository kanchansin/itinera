import { Platform } from 'react-native';

export const getGoogleAuthConfig = () => {
  const androidClientId = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;

  if (!androidClientId || !webClientId) {
    throw new Error('Google Client IDs are not configured in environment variables');
  }

  if (Platform.OS === 'android') {
    return {
      androidClientId,
      webClientId,
    };
  } else if (Platform.OS === 'ios') {
    return {
      iosClientId,
      webClientId,
    };
  } else {
    return {
      webClientId,
    };
  }
};
