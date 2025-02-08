
import React, { useEffect,useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert,TouchableOpacity, StyleSheet, Modal, FlatList, PanResponder, Settings  } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import { GestureHandlerRootView, FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';

import  supabase  from '@lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";



//import { AuthContext } from '../context/ctx';


const renderStars = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <FontAwesome
        key={i}
        name={i < rating ? 'star' : 'star-o'}
        size={20}
        color="gold"
      />
    );
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

const GalleryScreen = () => {
  const router = useRouter();

  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [hasUncompletedPrompt, setHasUncompletedPrompt] = useState(false);

  const [prompt, setPrompt] = useState("Click to generate prompt");
  const [previousPrompt, setPreviousPrompt] = useState('');
  const [images, setImages] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);

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
      const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) {
        throw new Error('No authenticated user found');
      }
  
      const { data: userPreferences, error } = await supabase
        .from('user_preferences')
        .select('artist_profile, skill_assessment, prompt_setup')
        .eq('id', user.id) 
        .single();
  
      if (error) {
        throw new Error('Error fetching user preferences: ' + error.message);
      }


      const promptTemplate = `
      Based on the following user profile:
      Artist Profile:
      ${Object.entries(userPreferences.artist_profile)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')}

      Skill Assessment:
      ${Object.entries(userPreferences.skill_assessment)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')}

      Preferred Setup:
      ${Object.entries(userPreferences.prompt_setup)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')}
  
      Generate a **simple short drawing prompt** that matches their preferences and skill level.`;
      console.log('promptTemplate:', promptTemplate);

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
    setIsGenerating(true);
    if (hasUncompletedPrompt) {
      Alert.alert('Warning', 'Please complete the current prompt before generating a new one');
      setIsGenerating(false);
      return; 
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        Alert.alert('Error', 'Please login first');
        setIsGenerating(false);
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


    } catch (error) {
      Alert.alert('Error', error.message);
      setIsGenerating(false);
      // You might want to set a default prompt or show an error message here
    } finally {
      setIsGenerating(false);
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






const handleSwipe = (direction) => {
  console.log('Swipe detected:', direction); // Debug log
  if (selectedIndex === null) return;
  
  let newIndex;
  if (direction === 'LEFT' && selectedIndex < images.length - 1) {
    newIndex = selectedIndex + 1;
  } else if (direction === 'RIGHT' && selectedIndex > 0) {
    newIndex = selectedIndex - 1;
  }
  
  if (newIndex !== undefined) {
    console.log('Setting new index:', newIndex); // Debug log
    setSelectedIndex(newIndex);
  }
};

const renderImageItem = ({ item, index }) => (
  <TouchableOpacity onPress={() => setSelectedIndex(index)}>
    <Image 
      source={{ uri: item.imageUrl }} 
      style={styles.thumbnail} 
    />
  </TouchableOpacity>
);




  const handlePromptClick = (prompt) => {
    console.log(prompt.id)
    if (prompt) {
      router.push({
        pathname: '/auth/upload',
        params: { promptId: prompt.id, promptText:prompt.prompt_text}
      });
    } 
  };

  // const panResponder = PanResponder.create({
  //   onStartShouldSetPanResponder: (e, g) => false, // Don't block touches immediately
  //   onMoveShouldSetPanResponder: (e, g) => {
  //     // Activate only if horizontal swipe is more significant than vertical movement
  //     return Math.abs(g.dx) > 10 && Math.abs(g.dy) < 10;
  //   },
  //   onPanResponderGrant: () => {
  //     console.log('GRANTED TO WRAPPER');
  //   },
  //   onPanResponderMove: (evt, gestureState) => {
  //     const SWIPE_THRESHOLD = 50;
  
  //     if (gestureState.dx > SWIPE_THRESHOLD) {
  //       console.log('Swiped right');
  //       handleSwipe('RIGHT');
  //     } else if (gestureState.dx < -SWIPE_THRESHOLD) {
  //       console.log('Swiped left');
  //       handleSwipe('LEFT');
  //     }
  //   },
  // });
  
  
  
  
  // const scrollerPanResponder = PanResponder.create({
  //   onStartShouldSetPanResponder: () => false, // Let ScrollView handle it
  //   onMoveShouldSetPanResponder: (e, g) => Math.abs(g.dy) > 10, // Only respond to vertical scrolls
  //   onPanResponderGrant: () => {
  //     console.log('GRANTED TO SCROLLER');
  //   },
  // });
  
  


// Updated return statement
return (
    <View style={{ padding: 5, flex: 1 }}>
      <View style={styles.topSection}>
      <View style={styles.header}>
        <Text style={styles.today}>Today</Text>
        <Pressable
          onPress={() => handlePromptClick(currentPrompt)}
          disabled={!currentPrompt}
          style={[
            styles.button,
            { opacity: currentPrompt ? 1 : 0.3 }
          ]}
        >
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </Pressable>
      </View>

        <Pressable
        onPress={generatePrompt}
        disabled={hasUncompletedPrompt}
        style={styles.promptCard}
      >
        {isGenerating ? (
          <Text style={{ textAlign: 'center' }}>Prompt generating...</Text>
        ) : hasUncompletedPrompt ? (
          <Text style={{  textAlign: 'center', fontSize:16, }}>{currentPrompt.prompt_text}</Text>
        ) : (
          <Text style={{  textAlign: 'center' }}>Click to generate today's prompt</Text>
        )}
      </Pressable>

      
      </View>
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.galleryContent}
    
      />

<Modal visible={selectedIndex !== null} transparent={true} animationType="fade">
<GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.modalContainer}>
      
      {/* RIGHT SWIPE  */}
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.END) {
            console.log('Swiped Right');
            handleSwipe('RIGHT'); // Move to previous image
          }
        }}
      >
        {/* LEFT SWIPE */}
        <FlingGestureHandler
          direction={Directions.LEFT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.END) {
              console.log('Swiped Left');
              handleSwipe('LEFT'); // Move to next image
            }
          }}
        >
          <View style={styles.modalCard}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.dateText}>
                {selectedIndex !== null ? 
                  new Date(images[selectedIndex]?.created_at).toLocaleDateString('default', { weekday: 'long',day: 'numeric',month: 'long',year: 'numeric' }) : ''}
              </Text>
              <TouchableOpacity 
                onPress={() => setSelectedIndex(null)} 
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
                  
            <View style={styles.modalImageContainer}>
              <Image 
                source={{ uri: selectedIndex !== null ? images[selectedIndex]?.imageUrl : null }} 
                style={styles.fullImage}
              />
            </View>

            <ScrollView 
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              pointerEvents="auto"
            >
              <Text style={styles.promptText}>
                {selectedIndex !== null ? images[selectedIndex]?.prompt_text : ''}
              </Text>

              <Text style={styles.surveyTitle}>Survey Responses:</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.label}>Rating: </Text>
                {renderStars(images[selectedIndex]?.review.rating)}
              </View>

              <Text style={styles.label}>Thoughts:</Text>
              <Text style={styles.surveyData}>
                {images[selectedIndex]?.review.thoughts}
              </Text>

              <Text style={styles.label}>Time Taken:</Text>
              <Text style={styles.surveyData}>{images[selectedIndex]?.review.timeTaken}</Text>
            </ScrollView>
            
          </View>
        </FlingGestureHandler>
      </FlingGestureHandler>

    </View>
  </GestureHandlerRootView>
</Modal>
    </View>
);
};
const styles = StyleSheet.create({
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  today: {
    flex: 1, 
    textAlign: 'left',
    fontSize: 18, 
    paddingLeft:10,
  },
  button: {
    backgroundColor: '#ccc',
    padding: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },

  thumbnail: {
    width: 100,
    aspectRatio: 1,
    marginHorizontal: 5, 
    marginVertical: 5,  
    borderRadius: 5,
    
  },
  promptCard: {
    backgroundColor:'#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5 ,
    height:200,

  },
  topSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,

  },
  galleryContent: {
    paddingHorizontal: 5,
    alignSelf: 'center', 
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
   
  },
  modalCard: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  modalImageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    lineHeight: 24,
  },
  scrollContainer: {
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, 
  },
  surveyContainer: {
    padding: 15,
  },
  surveyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  surveyData: { fontSize: 16, marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold' },
});


export default GalleryScreen;

