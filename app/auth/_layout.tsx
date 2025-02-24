import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../provider/AuthProvider';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StackLayout = () => {
  const { user, signOut } = useAuth(); // Ensure `useAuth` exposes `user` & `isLoading`
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
      if (!user) {
        router.replace('./login'); // Redirect to login if no user session
      }
      setCheckingSession(false);
    
  }, [user]);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const hiddenSettingsPaths = [
    '/auth/setupScreen/',
    '/auth/uploadScreen/'
  ];

  const viewTitles: {[key: string]: string} = {
    '/auth/galleryScreen': 'Gallery',
    '/auth/settings/survey': 'Settings', 
    '/auth/settings/account': 'Settings',
    '/auth/uploadScreen/': 'Upload',
    '/auth/setupScreen/': 'Setup Survey'
  };


  const title = viewTitles[pathname] || 'Sketch IT';

  const renderRightButton = () => {
    switch (pathname) {
      case '/auth/settings/survey':
        return (
          <TouchableOpacity 
            onPress={() => router.push('/auth/galleryScreen')} 
            style={styles.actionButton}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        );
        case '/auth/settings/account':
        return (
          <TouchableOpacity 
            onPress={() => router.push('/auth/galleryScreen')} 
            style={styles.actionButton}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        );
        case '/auth/uploadScreen/':
        return (
          <TouchableOpacity 
            onPress={() => router.push('/auth/galleryScreen')} 
            style={styles.actionButton}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        );
      case '/auth/galleryScreen':
        return (
          <TouchableOpacity 
            onPress={() => router.push('/auth/settings/survey')} 
            style={styles.actionButton}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <View style={styles.banner}>
      <Text style={styles.bannerText}>{title}</Text>
      
      <View style={styles.bannerActions}>
        {renderRightButton()}
      </View>
    </View>

      {/* Stack Navigation */}
      <Stack screenOptions={{ headerShown: false }}>
    </Stack>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000', // Adjust as needed
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
});

export default StackLayout;
