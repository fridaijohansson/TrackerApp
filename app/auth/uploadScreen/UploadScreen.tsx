import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import { takePhoto, pickImage } from '../../../lib/ImagePickerHandler';
import { Ionicons } from '@expo/vector-icons';

const UploadScreen = ({ setSelectedImage, setCurrentScreen, promptText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.promptContainer}>
          <Text style={styles.promptTitle}>Prompt:</Text>
          <Text style={styles.promptText}>{promptText}</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => takePhoto(setSelectedImage, setCurrentScreen)}>
          <Ionicons name="camera-outline" size={36} color="#fff" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => pickImage(setSelectedImage, setCurrentScreen)}>
          <Ionicons name="image-outline" size={36} color="#fff" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UploadScreen;