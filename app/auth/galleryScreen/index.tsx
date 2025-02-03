import ImageGallery from './ImageGallery';
import ImageModal from './ImageModal';

import React, { useEffect,useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert,TouchableOpacity, StyleSheet, Modal, FlatList, Dimensions, PanResponder  } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

import  supabase  from '@lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";


const GalleryScreen = () => {
   
  //const { signOut } = useAuth()
  const router = useRouter();
  //const { session } = useContext(AuthContext);

  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [hasUncompletedPrompt, setHasUncompletedPrompt] = useState(false);

  const [prompt, setPrompt] = useState("Click to generate prompt");
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const [previousPrompt, setPreviousPrompt] = useState('');
  const [images, setImages] = useState([]);


  useEffect(() => {
    checkUncompletedPrompts();

    const loadImages = async () => {
      const fetchedImages = await fetchUploadedImages();
      if (fetchedImages) {
          console.log('||||||||||||||||Fetched Prompt Objects:', fetchedImages);
          setImages(fetchedImages);
      }
  };

  loadImages();
}, []);

  const checkUncompletedPrompts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const { data, error } = await supabase
        .from('prompt_uploads')
        .select('*')
        .eq('user_id', userId)
        .is('image_url', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentPrompt(data);
        setHasUncompletedPrompt(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  
  

  const fetchAIResponse = async () => {
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyC85IpE-EItQ5T_n6me92bhOYVrI8kpSck");
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      if (prompt) {
        setPreviousPrompt(prompt);
    }

      const promptTemplate = `
      Generate a **simple short drawing prompt**.
      
      Avoid overly elaborate or nonsensical ideas, and focus on prompts that are creative yet practical to execute.
      The new prompt must be different from this one:` + previousPrompt;


      const result = await model.generateContent(promptTemplate);
      console.log('AI Response:', result.response.text());
      return result.response.text();
    } catch (error) {
      console.error('Error with Google Generative AI:', error);
      throw error;
    }
  };

  // Function to generate a prompt
  const generatePrompt = async () => {
    if (hasUncompletedPrompt) {
      Alert.alert('Warning', 'Please complete the current prompt before generating a new one');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      // Generate your prompt here - this is a simple example
      const newPrompt = await fetchAIResponse();
      setPrompt(newPrompt);

      const { data, error } = await supabase
        .from('prompt_uploads')
        .insert([
          {
            prompt_text: newPrompt,
            user_id: userId,
            // created_at will be handled by Supabase's now()
            image_url: null,
            review: null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentPrompt(data);
      setHasUncompletedPrompt(true);

      setIsLoading(true);

    } catch (error) {
      Alert.alert('Error', error.message);
      // You might want to set a default prompt or show an error message here
    } finally {
      setIsLoading(false);
    }
  
  };

  const fetchUploadedImages = async () => {
    try {
        const { data: user } = await supabase.auth.getUser();
        const userId = user?.user?.id;

        const { data, error } = await supabase
            .from('prompt_uploads')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching images:', error);
            return [];
        }

        //console.log("Fetched Data:", data);

        // Sort newest to oldest
        const sortedData = data.sort((a, b) => 
            new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
        );

        // Generate signed URLs and keep all object properties
        const validImages = await Promise.all(
            sortedData
                .filter(item => item.image_url !== null && item.image_url.trim() !== '')
                .map(async item => {
                    const { data: signedUrlData, error: urlError } = await supabase
                        .storage
                        .from('files')
                        .createSignedUrl(item.image_url, 60); // Expires in 60 seconds
                    
                    if (urlError) {
                        console.error('Error generating signed URL:', urlError.message);
                        return null;
                    }
                    
                    return {
                        ...item, // Keep other properties (prompt, created_at, etc.)
                        imageUrl: signedUrlData.signedUrl // Replace image_url with signed URL
                    };
                })
        );

        // Remove null entries and return full objects
        return validImages.filter(item => item !== null);
    } catch (error) {
        console.error('Error fetching images:', error.message);
        return [];
    }
};







const [selectedIndex, setSelectedIndex] = useState(null);


  
  const handlePromptClick = (prompt) => {
    console.log(prompt.id)
    if (prompt) {
      router.push({
        pathname: '/auth/upload',
        params: { promptId: prompt.id, promptText:prompt.prompt_text}
      });
    } 
  };

  
  // Updated return statement
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ padding: 20, flex: 1 }}>
        <TouchableOpacity
          onPress={generatePrompt}
          style={{
            backgroundColor: hasUncompletedPrompt ? '#ccc' : '#007AFF',
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
          }}
          disabled={hasUncompletedPrompt}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Generate Prompt
          </Text>
        </TouchableOpacity>
  
        {currentPrompt && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, textAlign: 'center' }}>
              {currentPrompt.prompt_text}
            </Text>
          </View>
        )}
  
        <Pressable
          onPress={() => handlePromptClick(currentPrompt)}
          disabled={!currentPrompt}
          style={{
            backgroundColor: currentPrompt ? '#007AFF' : '#ccc',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5,
            height: 50,
            opacity: currentPrompt ? 1 : 0.5,
          }}
        >
          <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Upload Image</Text>
          </View>
        </Pressable>
  
        <View style={{ flex: 1 }}>
        <ImageGallery 
        images={images}
        onImagePress={(index) => setSelectedIndex(index)}
      />
      
      <ImageModal 
        visible={selectedIndex !== null}
        image={selectedIndex !== null ? images[selectedIndex] : null}
        onClose={() => setSelectedIndex(null)}
        images={images}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </View>
      </View>
    </GestureHandlerRootView>
  );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });
  
  
  export default GalleryScreen;