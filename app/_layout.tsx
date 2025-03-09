import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '../provider/AuthProvider'
import  supabase  from '../lib/supabase'
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import SignInScreen from './index';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use a physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}


const InitialLayout = () => {
  const { session, initialized } = useAuth()
    const segments = useSegments()
    const router = useRouter()
    const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean | null>(null)
    
    useEffect(() => {
      const checkSurveyCompletion = async () => {
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('has_completed_survey')
            .eq('id', session.user.id)
            .maybeSingle()
          
          if (error) {
            console.error('Error checking survey completion:', error)
            return
          }
          
          setHasCompletedSurvey(data?.has_completed_survey ?? false)
        } else {
          setHasCompletedSurvey(null)
        }
      }
    
      if (session?.user) {
        checkSurveyCompletion()
      } else {
        setHasCompletedSurvey(null)
      }
    }, [session])

    useEffect(() => {
      registerForPushNotificationsAsync();
  
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log(notification);
      });
  
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
  
      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    }, []);

  useEffect(() => {
    if (!initialized || hasCompletedSurvey === null) return

    const inAuthGroup = segments[0] === 'auth'
    const isSetupSurvey = segments[1] === 'setupScreen'
    
    if (session) {
      if (!hasCompletedSurvey && !isSetupSurvey) {
        router.replace('/auth/setupScreen/' as any)
      } else if (!inAuthGroup && !isSetupSurvey) {
        router.replace('/auth/galleryScreen/' as any)
      }
    } else if (!session && !isSetupSurvey) {
      router.replace('/')
    }
  }, [session, initialized, hasCompletedSurvey])

  return <Slot />
}
  
  export default function App() {
    return (
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    )
  }