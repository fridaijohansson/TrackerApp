import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import { takePhoto, pickImage } from '../../../lib/ImagePickerHandler';

const UploadScreen = ({ setSelectedImage, setCurrentScreen, promptText }) => {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, paddingBottom: 100 }}>Prompt: {promptText}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => takePhoto(setSelectedImage, setCurrentScreen)}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => pickImage(setSelectedImage, setCurrentScreen)}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UploadScreen;