import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

const getTimeLabel = (value) => {
  if (value < 1) return 'Less than 10 minutes';
  if (value < 2) return 'Less than an hour';
  return 'More than an hour';
};

const QuestionnaireScreen = ({ timeTaken, setTimeTaken, rating, setRating, thoughts, uploadImage }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container_review}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
            <Text style={styles.question}>How long did the prompt take?</Text>
            <Slider
              style={{ width: 300, height: 40 }}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={timeTaken}
              onValueChange={setTimeTaken}
              minimumTrackTintColor="#1E90FF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#1E90FF"
            />
            <Text>{getTimeLabel(timeTaken)}</Text>

            <Text style={styles.question}>How would you rate your result?</Text>
            <View style={styles.iconContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <FontAwesome key={i} name="star" size={30} color={i <= rating ? '#FFD700' : '#D3D3D3'} onPress={() => setRating(i)} />
              ))}
            </View>

            <Text style={styles.question}>Thoughts:</Text>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="What would you do differently?"
              defaultValue={thoughts.current}
              onChangeText={(text) => (thoughts.current = text)}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <TouchableOpacity style={styles.submitButton} onPress={uploadImage}>
          <Text style={styles.buttonText}>Upload and Complete Prompt</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default QuestionnaireScreen;
