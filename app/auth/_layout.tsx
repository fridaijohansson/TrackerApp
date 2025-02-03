import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../provider/AuthProvider';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StackLayout = () => {
  const { user, signOut } = useAuth(); // Ensure `useAuth` exposes `user` & `isLoading`
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

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

  return (
    <>
      {/* Banner with Sign Out Button */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Welcome, {user?.email || 'User'}!</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stack Navigation */}
      <Stack screenOptions={{ headerShown: false }}>
    </Stack>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: { color: '#fff', fontSize: 16 },
  signOutButton: { padding: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
});

export default StackLayout;
