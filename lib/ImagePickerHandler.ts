import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export const takePhoto = async (setSelectedImage, setCurrentScreen) => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status === 'granted') {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setCurrentScreen('preview');
    }
  }
};

export const pickImage = async (setSelectedImage, setCurrentScreen) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setCurrentScreen('preview');
    }
  }
};