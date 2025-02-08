import { View, Text, Pressable, StyleSheet, TouchableOpacity, ScrollView  } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../provider/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import supabase from '@lib/supabase';

export default function AccountSettings() {
  const [profile, setProfile] = useState(null);
  const { user,  signOut } = useAuth();

  useEffect(() => {
      fetchProfile()
        
  }, [profile]);
  
 const fetchProfile = async () => {
  try {
    

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    setProfile(data);
  } catch (error) {
    console.error('Error in fetchProfile:', error);
  }}

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profile ? (
      <>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.profileText}>{profile.name}</Text>
          <Text style={styles.profileText}>Joined: {formatDate(profile.created_at)}</Text>
          <Text style={styles.profileText}>Current Streak: {profile.current_streak}</Text>
          <Text style={styles.profileText}>Longest Streak: {profile.longest_streak}</Text>
        </View>
        {/* Other sections */}
      </>
    ) : (
      <Text>Loading profile...</Text>
    )}

      <View style={styles.card}>
        <Text style={styles.title}>Account</Text>
        <Pressable style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Appearance</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Change Theme</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Data</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Reset Account</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </Pressable>
      </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 16,
  },
  profileText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
});
