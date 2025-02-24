import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

const PreviewScreen = ({ selectedImage, setSelectedImage, setCurrentScreen, promptText }) => {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, paddingBottom: 100 }}>Prompt: {promptText}</Text>
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.previewImage} />}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => {
          setSelectedImage(null);
          setCurrentScreen('upload');
        }}>
          <Text style={styles.buttonText}>Clear Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('questionnaire')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviewScreen;
