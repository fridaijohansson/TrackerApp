import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import UploadScreen from './UploadScreen';
import PreviewScreen from './PreviewScreen';
import QuestionnaireScreen from './QuestionnaireScreen';
import { uploadImage } from '../../../lib/UploadHandler';
import styles from './styles';

const UploadFlow = () => {
  const [currentScreen, setCurrentScreen] = useState('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [rating, setRating] = useState(0);
  const thoughts = useRef('');

  const { promptId, promptText } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      {currentScreen === 'upload' && (
        <UploadScreen
          setSelectedImage={setSelectedImage}
          setCurrentScreen={setCurrentScreen}
          promptText={promptText}
        />
      )}
      {currentScreen === 'preview' && (
        <PreviewScreen
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          setCurrentScreen={setCurrentScreen}
          promptText={promptText}
        />
      )}
      {currentScreen === 'questionnaire' && (
        <QuestionnaireScreen
          timeTaken={timeTaken}
          setTimeTaken={setTimeTaken}
          rating={rating}
          setRating={setRating}
          thoughts={thoughts}
          uploadImage={() => uploadImage(selectedImage, promptId, timeTaken, rating, thoughts, router)}
        />
      )}
    </View>
  );
};

export default UploadFlow;