import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsLayout() {
  return (
    <Tabs
    screenOptions={{
      headerShown: false, 
    }}>
      <Tabs.Screen
        name="survey"
        options={{
          title: 'Survey',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}