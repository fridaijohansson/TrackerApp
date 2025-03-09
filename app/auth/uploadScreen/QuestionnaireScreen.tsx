import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator  } from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

const getTimeLabel = (value) => {
  if (value < 1) return 'Gesture Sketch (~10 mins)';
  if (value < 2) return 'Refined Sketch (~30 mins)';
  if (value < 3) return 'Simple Drawing (~1 hr)';
  return 'Polished Drawing (> 1 hr)';
};



const QuestionnaireScreen = ({ timeTaken, setTimeTaken, rating, setRating, thoughts, uploadImage }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await uploadImage();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container_review}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
            <Text style={styles.question}>How much effort did this drawing take?</Text>

            <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 300, paddingHorizontal: 5, marginTop: 10}}>
              <Text style={{ textAlign: 'left' }}>~10 mins</Text>
              <Text style={{ textAlign: 'left' }}>~30 mins</Text>
              <Text style={{ textAlign: 'left' }}>~1 hr</Text>
              <Text style={{ textAlign: 'left' }}>{'> 1 hr'}</Text>
            </View>

            <Slider
              style={{ width: 300, height: 40 }}
              minimumValue={0}
              maximumValue={3}
              step={1}
              value={timeTaken}
              onValueChange={setTimeTaken}
              minimumTrackTintColor="#1E90FF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#1E90FF"
            />

            <Text style={{ marginBottom: 20}}>{getTimeLabel(timeTaken)}</Text>
          </View>

            <Text style={styles.question}>How satisfied are you with your drawing?</Text>
            <View style={styles.iconContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <FontAwesome key={i} name="heart" size={30} color={i <= rating ? '#FFD700' : '#D3D3D3'} onPress={() => setRating(i)} />
              ))}
            </View>

            <Text style={styles.question}>Reflections</Text>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="What was challenging? What would you try differently next time?"
              defaultValue={thoughts.current}
              onChangeText={(text) => (thoughts.current = text)}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.buttonText, { marginLeft: 10 }]}>Uploading...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Upload and Complete Prompt</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default QuestionnaireScreen;
