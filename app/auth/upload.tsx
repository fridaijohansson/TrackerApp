
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard   } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from 'expo-file-system';
import supabase from '@lib/supabase';
import { decode } from 'base64-arraybuffer';
import { Link, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const UploadFlow = () => {
  const [currentScreen, setCurrentScreen] = useState('upload');
  const [selectedImage, setSelectedImage] = useState(null);
  

  const router = useRouter();
  const { promptId, promptText } = useLocalSearchParams();

  const [timeTaken, setTimeTaken] = useState(0);
  const [rating, setRating] = useState(0);
  const thoughts = useRef(''); 


  const takePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setCurrentScreen('preview');
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setCurrentScreen('preview');
      }
    }
  };


  const uploadImage = async () => {
    if (!selectedImage) {
        console.log('No image selected.');
        return;
    }

    try {
        // Get authenticated user
        const { data: user, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        const userId = user?.user?.id;
        if (!userId) throw new Error("User not authenticated");

        // Read the image file
        const file = await FileSystem.readAsStringAsync(selectedImage, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Store images in a user-specific folder
        const fileName = `${userId}/${Date.now()}.jpg`;
        const contentType = 'image/jpeg';

        // Upload to Supabase storage
        await supabase.storage.from('files').upload(fileName, decode(file), { contentType });

        console.log('Image uploaded:', fileName);

        const reviewData = {
          timeTaken: getTimeLabel(timeTaken),
          rating: rating,
          thoughts: thoughts.current
        };
        console.log(reviewData);

        // Store the file name in the prompt_uploads table
        const { data: updateData, error: updateError } = await supabase
            .from('prompt_uploads')
            .update({ 
              image_url: fileName,
              review: reviewData 
             }) 
            .eq('id', promptId); 

        if (updateError) throw updateError;

        console.log('Database updated:', updateData);

        router.push({
            pathname: '/auth/gallery'
          });
    } catch (error) {
        console.error('Upload failed:', error.message);
    }
};



  const UploadScreen = () => (
    <View style={styles.container}>
        <Text style={{fontSize:20, paddingBottom:100, }}>Prompt: {promptText}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const PreviewScreen = () => (
    <View style={styles.container}>
        <Text style={{fontSize:20, paddingBottom:100, }}>Prompt: {promptText}</Text>


      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            setSelectedImage(null);
            setCurrentScreen('upload');
          }}
        >
          <Text style={styles.buttonText}>Clear Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCurrentScreen('questionnaire')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );



 


  const getTimeLabel = (value: number) => {
    if (value < 1) return 'Less than 10 minutes';
    if (value < 2) return 'Less than an hour';
    return 'More than an hour';
  };

  const QuestionnaireScreen = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container_review}>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollView} 
            keyboardShouldPersistTaps="handled"
          >
            {/* Time Taken */}
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

            {/* Rating */}
            <Text style={styles.question}>How would you rate your result?</Text>
            <View style={styles.iconContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <FontAwesome
                  key={i}
                  name="star"
                  size={30}
                  color={i <= rating ? '#FFD700' : '#D3D3D3'}
                  onPress={() => setRating(i)}
                />
              ))}
            </View>

            {/* Thoughts */}
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

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => {
            console.log('Submitted:', { timeTaken, rating, thoughts: thoughts.current });
            uploadImage();
          }}
        >
          <Text style={styles.buttonText}>Upload and Complete Prompt</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
);

  return (
    <View style={styles.mainContainer}>
      {currentScreen === 'upload' && <UploadScreen />}
      {currentScreen === 'preview' && <PreviewScreen />}
      {currentScreen === 'questionnaire' && <QuestionnaireScreen />}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  container_review: { flex: 1, padding: 20 },
  scrollView: { flexGrow: 1 },
  question_review: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  iconContainer: { flexDirection: 'row', gap: 5, marginBottom: 20 },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
});

export default UploadFlow;