import React, { useEffect,useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert,TouchableOpacity, StyleSheet, Modal, FlatList, PanResponder  } from 'react-native';
import { Link, useRouter } from 'expo-router';



import { GestureHandlerRootView} from 'react-native-gesture-handler';

import  supabase  from '@lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

//import { AuthContext } from '../context/ctx';

const GalleryScreen = () => {
  const router = useRouter();

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


// const renderImageItem = ({ item }) => {
//   if (!item) {
//       return null; // Handle case where item is invalid
//   }
//   return (
//       <Image source={{ uri: item }} style={styles.image} />
//   );
// };

// const renderImageItem = ({ item, index }) => {
//   if (!item || !item.imageUrl) {
//     console.warn("Skipping invalid image item:", item); // Debugging
//     return null;
//   }
//   return (
//     <TouchableOpacity onPress={() => setSelectedIndex(index)}>
//       <Image source={{ uri: item.imageUrl }} style={styles.imageThumbnail} />
//     </TouchableOpacity>
//   );
// };





const [selectedIndex, setSelectedIndex] = useState(null);


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


const config = {
  velocityThreshold: 0.1, // Reduced from 0.3
  directionalOffsetThreshold: 50, // Reduced from 80
  gestureIsClickThreshold: 5
};
  


  const handlePromptClick = (prompt) => {
    console.log(prompt.id)
    if (prompt) {
      router.push({
        pathname: '/auth/upload',
        params: { promptId: prompt.id, promptText:prompt.prompt_text}
      });
    } 
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      console.log('Pan responder released:', gestureState.dx);
      const SWIPE_THRESHOLD = 50;
      
      if (gestureState.dx > SWIPE_THRESHOLD) {
        console.log('Swiped right');
        handleSwipe('RIGHT');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        console.log('Swiped left');
        handleSwipe('LEFT');
      }
    },
  });
  
  


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

      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        style={styles.gallery}
        contentContainerStyle={{
          paddingHorizontal: 5, 
          alignSelf: 'center', 
        }}
      />

<Modal visible={selectedIndex !== null} transparent={true} animationType="fade">
  <View style={styles.modalContainer}>
    <View 
      style={styles.modalCard}
      {...panResponder.panHandlers}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.dateText}>
          {selectedIndex !== null ? 
            new Date(images[selectedIndex]?.created_at).toLocaleDateString() : ''}
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

      <Text style={styles.promptText}>
        {selectedIndex !== null ? images[selectedIndex]?.prompt_text : ''}
      </Text>

      <ScrollView>
        <Text style={styles.surveyTitle}>Survey Responses:</Text>
        <Text style={styles.surveyData}>
          {selectedIndex !== null ? JSON.stringify(images[selectedIndex]?.review, null, 2) : ''}
        </Text>
      </ScrollView>
    </View>
  </View>
</Modal>
    </View>
  </GestureHandlerRootView>
);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gallery: {
    // Remove any padding/margin if present
  },
  thumbnail: {
    width: 100,
    aspectRatio: 1,
    marginHorizontal: 5, // Add some spacing between columns
    marginVertical: 5,   // Add some spacing between rows
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center', // Center horizontally within the column
  },
  


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark semi-transparent backdrop
  },
  modalCard: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
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
  surveyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  surveyData: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  }
});
// const styles = StyleSheet.create({
//   container: {
//       flex: 1,
//       padding: 10,
//       width: '100%',
//       marginTop: 100,
//   },
//   image: {
//       width: '30%', // Adjust to fill the container
//       height: 100, // Fixed height
//       marginBottom: 10,
//       marginHorizontal: 5,
//       borderRadius: 5,
//   },

// imageThumbnail: {
//     width: Dimensions.get('window').width / 3 - 10,
//     height: Dimensions.get('window').width / 3 - 10,
//     margin: 5,
//     borderRadius: 8,
// },
// modalContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//     justifyContent: 'center',
// },
// closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 1,
// },
// closeText: {
//     color: 'white',
//     fontSize: 24,
//     fontWeight: 'bold',
// },
// fullImage: {
//     width: '100%',
//     height: '60%',
//     resizeMode: 'contain',
// },
// detailsContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
// },
// promptText: {
//     fontSize: 20,
//     fontWeight: 'bold',
// },
// dateText: {
//     color: 'gray',
//     marginVertical: 5,
// },
// surveyTitle: {
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: 'bold',
// },
// surveyData: {
//     marginTop: 5,
//     fontSize: 14,
//     color: '#555',
// },
// });


export default GalleryScreen;



{/* <View style={styles.container}>
            <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()} // Use index as key, or better, use a unique ID
                numColumns={3}
            />
        </View> */}



//         <GestureHandlerRootView style={styles.container}>
//         {/* Gallery Grid */}
//         <FlatList
//           data={images}
//           renderItem={renderImageItem}
//           keyExtractor={(item, index) => index.toString()}
//           numColumns={3}
//         />


//         {/* Fullscreen Modal */}
//         <Modal visible={selectedIndex !== null} transparent={true} animationType="slide">
//           {selectedIndex !== null && (
//               <PanGestureHandler
//                   onGestureEvent={(event) => {
//                       if (event.nativeEvent.translationX > 100) handleSwipe(-1); // Swipe Right
//                       if (event.nativeEvent.translationX < -100) handleSwipe(1); // Swipe Left
//                   }}
//               >
//                   <View style={styles.modalContainer}>
//                       <TouchableOpacity 
//                         onPress={() => setSelectedIndex(null)} 
//                         style={styles.closeButton}
//                     >
//                         <Text style={styles.closeText}>✕</Text>
//                     </TouchableOpacity>


//                       <Image source={{ uri: images[selectedIndex]?.imageUrl }} style={styles.fullImage} />

//                       {/* Image Details & Survey */}
//                       <ScrollView style={styles.detailsContainer}>
//                           <Text style={styles.promptText}>{images[selectedIndex]?.prompt_text}</Text>
//                           <Text style={styles.dateText}>Uploaded on: {images[selectedIndex]?.created_at}</Text>

//                           {/* Survey Data */}
//                           <Text style={styles.surveyTitle}>Survey Responses:</Text>
//                           <Text style={styles.surveyData}>{JSON.stringify(images[selectedIndex]?.review, null, 2)}</Text>
//                       </ScrollView>
//                   </View>
//               </PanGestureHandler>
//           )}
// </Modal>
//     </GestureHandlerRootView>