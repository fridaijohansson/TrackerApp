import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';
import { Ionicons } from '@expo/vector-icons';

const PreviewScreen = ({ selectedImage, setSelectedImage, setCurrentScreen, promptText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.promptContainer}>
          <Text style={styles.promptTitle}>Prompt:</Text>
          <Text style={styles.promptText}>{promptText}</Text>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.previewImage} />}
        </View>
        
        
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => {
          setSelectedImage(null);
          setCurrentScreen('upload');
        }}>
          <Ionicons name="trash-outline" size={34} color="#fff" />
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('questionnaire')}>
          <Ionicons name="checkmark-circle-outline" size={36} color="#fff" />
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviewScreen;