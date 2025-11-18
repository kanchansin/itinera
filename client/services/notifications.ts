import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  let token;
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  
  return token;
}

export async function scheduleTripReminder(tripData: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Trip Starting Soon! 🚗`,
      body: `Your trip to ${tripData.destination} starts at ${tripData.startTime}`,
      data: { tripId: tripData.id },
    },
    trigger: {
      date: new Date(tripData.startTime).getTime() - 3600000,
    },
  });
}