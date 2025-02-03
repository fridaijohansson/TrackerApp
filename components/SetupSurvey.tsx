import React from 'react';
import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SetupSurvey() {
  const router = useRouter();

  return (
    <View>
      <Button
        title="Go to Gallery"
        onPress={() => router.push('../screens/gallery')}
      />
    </View>
  );
}