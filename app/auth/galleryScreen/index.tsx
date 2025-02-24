import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert, TouchableOpacity, Modal, FlatList,  } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';
import supabase from '@lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {ImageItemProps, ImageData, MonthGroup, YearGroup} from "@lib/interfaces";

import styles from './styles';

const ImageItem: React.FC<ImageItemProps> = React.memo(({ item, index, onPress, getSignedUrl }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.image_url) {
      const loadUrl = async () => {
        const url = await getSignedUrl(item.image_url);
        if (url) setImageUrl(url);
      };
      loadUrl();
    }
  }, [item.image_url, getSignedUrl]);

  return (
    <TouchableOpacity 
      onPress={() => onPress(index)} 
      disabled={item.status === 'missed'}
    >
      <Image 
        source={
          item.image_url ? 
            { uri: imageUrl } : 
            item.status === 'ongoing' ?
              require('../../../assets/images/circle2.png') :
              require('../../../assets/images/scribble-v3.png')
        }
        style={[
          styles.thumbnail,
          item.status === 'missed' && styles.missedThumbnail
        ]}
        defaultSource={require('../../../assets/images/placeholder.jpg')}
      />
    </TouchableOpacity>
  );
});

const MonthSection: React.FC<{ monthGroup: MonthGroup, onImagePress: (image: ImageData) => void, getSignedUrl: any }> = ({ 
  monthGroup, 
  onImagePress,
  getSignedUrl 
}) => (
  <View style={styles.monthSection}>
    <Text style={styles.monthHeader}>{monthGroup.month}</Text>
    <View style={styles.imageGrid}>
      {monthGroup.images.map((image, index) => (
        <ImageItem
          key={image.id}
          item={image}
          index={index}
          onPress={() => onImagePress(image)}
          getSignedUrl={getSignedUrl}
        />
      ))}
    </View>
  </View>
);

const YearSection: React.FC<{ yearGroup: YearGroup, onImagePress: (image: ImageData) => void, getSignedUrl: any }> = ({ 
  yearGroup, 
  onImagePress,
  getSignedUrl 
}) => (
  <View style={styles.yearSection}>
    <Text style={styles.yearHeader}>{yearGroup.year}</Text>
    {yearGroup.months.map((monthGroup) => (
      <MonthSection
        key={monthGroup.month}
        monthGroup={monthGroup}
        onImagePress={onImagePress}
        getSignedUrl={getSignedUrl}
      />
    ))}
  </View>
);

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
  
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [images, setImages] = useState([]);
  const [realImages, setRealImages] = useState<ImageData[]>([]);
  const [organizedImages, setOrganizedImages] = useState<YearGroup[]>([]);



  const organizeImagesByDate = (images: ImageData[]): YearGroup[] => {
    const grouped = images.reduce((acc, image) => {
      const date = new Date(image.created_at);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });
  
      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = [];
  
      acc[year][month].push(image);
      return acc;
    }, {} as Record<string, Record<string, ImageData[]>>);
  
    const monthOrder: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3,
      May: 4, June: 5, July: 6, August: 7,
      September: 8, October: 9, November: 10, December: 11
    };
  
    return Object.entries(grouped)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) 
      .map(([year, months]) => ({
        year,
        months: Object.entries(months)
          .sort((a, b) => monthOrder[b[0]] - monthOrder[a[0]]) 
          .map(([month, images]) => ({
            month,
            images: images.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) 
          })),
      }));
  };
  

  const fetchImageMetadata = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
  
      const { data, error } = await supabase
        .from('prompt_uploads')
        .select('id, prompt_text, created_at, image_url, review, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
  
      if (error) throw error;
      return fillMissingDates(data);
    } catch (error) {
      console.error('Error fetching image metadata:', error);
      return [];
    }
  };
  
  const fillMissingDates = (images: ImageData[]) => {
    if (images.length === 0) return [];
  
    const today = new Date();
    today.setHours(23, 59, 59, 999); 
    const imageMap = new Map(
      images.map((img) => {
        const date = new Date(img.created_at);
        return [date.toISOString().split('T')[0], img];
      })
    );
  
    const startDate = new Date(Math.min(...images.map(img => new Date(img.created_at).getTime())));
    startDate.setHours(0, 0, 0, 0);
  
    const filledImages: ImageData[] = [];
  
    for (
      let date = new Date(startDate);
      date <= today;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split('T')[0];
      
      const dateImages = images.filter(img => 
        new Date(img.created_at).toISOString().split('T')[0] === dateStr
      );
  
      if (dateImages.length > 0) {
        filledImages.push(...dateImages);
      } else {
        filledImages.push({
          id: `blank-${dateStr}`,
          created_at: new Date(date).toISOString(),
          image_url: null,
          prompt_text: "-",
          review: null,
          status: 'missed'
        });
      }
    }
  
    return filledImages;
  };

const getSignedUrl = useCallback(async (path) => {
  if (!path) return null;
  try {
    const { data, error } = await supabase
      .storage
      .from('files')
      .createSignedUrl(path, 3600);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}, []);

useEffect(() => {
  checkUncompletedPrompts();
  loadInitialData();
}, []);



const loadInitialData = async () => {
  setIsLoading(true);
  try {
    const metadata = await fetchImageMetadata();
    const organized = organizeImagesByDate(metadata);

    setOrganizedImages(organized);
    setImages(metadata);
    setRealImages(metadata.filter(img => img.image_url)); 
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  if (selectedIndex !== null && images[selectedIndex]) {
    const loadSelectedImage = async () => {
      const url = await getSignedUrl(images[selectedIndex].image_url);
      setSelectedImageUrl(url);
    };
    loadSelectedImage();
  } else {
    setSelectedImageUrl(null);
  }
}, [selectedIndex]);



const checkUncompletedPrompts = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayPrompt, error: todayError } = await supabase
      .from('prompt_uploads')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (todayError && todayError.code !== 'PGRST116') {
      throw todayError;
    }

    if (todayPrompt && todayPrompt.image_url === null) {
      setCurrentPrompt(todayPrompt);
      setHasUncompletedPrompt(true);
      return;
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
  
      Generate a **short** drawing prompt that matches their preferences and skill level.`;
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
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
  
      if (!userId) {
        Alert.alert('Error', 'Please login first');
        setIsGenerating(false);
        return;
      }
  
      // Check if there's already a prompt for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: existingPrompt, error: checkError } = await supabase
        .from('prompt_uploads')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .single();
  
      if (checkError && checkError.code !== 'PGRST116') {
        
        throw checkError;
      }
  
      if (existingPrompt) {
        Alert.alert('Good Job!', 'You have completed your drawing task for today. Come back tomorrow to keep your streak alive!');
        setIsGenerating(false);
        return;
      }else{
        const newPrompt = await fetchAIResponse();
    
        const { data, error } = await supabase
          .from('prompt_uploads')
          .insert([
            {
              prompt_text: newPrompt,
              user_id: userId,
              image_url: null,
              review: null,
              status: 'ongoing' 
            },
          ])
          .select()
          .single();
    
        if (error) throw error;
    
        setCurrentPrompt(data);
        setHasUncompletedPrompt(true);
      }
  
      
  
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsGenerating(false);
    }
  };



  const handleSwipe = (direction) => {
    if (selectedIndex === null || realImages.length === 0) return;
  
    const currentRealIndex = realImages.findIndex(img => img.id === images[selectedIndex].id);
  
    let newIndex = currentRealIndex;
  
    if (direction === 'LEFT' && currentRealIndex > 0) {
      newIndex = currentRealIndex - 1; // Move to an older image
    } else if (direction === 'RIGHT' && currentRealIndex < realImages.length - 1) {
      newIndex = currentRealIndex + 1; // Move to a newer image
    }
  
    const newImage = realImages[newIndex];
    if (newImage) {
      const actualIndex = images.findIndex(img => img.id === newImage.id);
      setSelectedIndex(actualIndex);
    }
  };
  




  const handlePromptClick = (prompt) => {
    console.log(prompt.id)
    if (prompt) {
      router.push(
        `/auth/uploadScreen?promptId=${prompt.id}&promptText=${encodeURIComponent(prompt.prompt_text)}` as any
      );
    
    } 
  };

  

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
      
      <ScrollView style={styles.galleryContainer}>
        {organizedImages.map((yearGroup) => (
          <YearSection
            key={yearGroup.year}
            yearGroup={yearGroup}
            onImagePress={(image) => {
              const index = images.findIndex(img => img.id === image.id);
              setSelectedIndex(index);
            }}
            getSignedUrl={getSignedUrl}
          />
        ))}
      </ScrollView>
      

<Modal visible={selectedIndex !== null} transparent={true} animationType="fade">
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.modalContainer}>
        <FlingGestureHandler
          direction={Directions.RIGHT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.END) {
              handleSwipe('RIGHT');
            }
          }}
        >
          <FlingGestureHandler
            direction={Directions.LEFT}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.END) {
                handleSwipe('LEFT');
              }
            }}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.dateText}>
                  {selectedIndex !== null ? 
                    new Date(images[selectedIndex]?.created_at).toLocaleDateString('default', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : ''}
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedIndex(null)} 
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedIndex !== null && (
                images[selectedIndex]?.status === 'ongoing' ? (
                  <View style={styles.ongoingPromptContainer}>
                    <Text style={styles.promptText}>
                      {images[selectedIndex]?.prompt_text}
                    </Text>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={() => {
                        setSelectedIndex(null);
                        router.push(
                          `/auth/uploadScreen?promptId=${images[selectedIndex].id}&promptText=${encodeURIComponent(images[selectedIndex].prompt_text)}` as any
                        );
                        
                      }}
                    >
                      <Ionicons name="camera-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.modalImageContainer}>
                      <Image 
                        source={{ uri: selectedImageUrl }} 
                        style={styles.fullImage}
                        defaultSource={require('../../../assets/images/placeholder.jpg')}
                      />
                    </View>
                    <ScrollView 
                      keyboardShouldPersistTaps="handled"
                      scrollEnabled={true}
                      pointerEvents="auto"
                    >
                      <Text style={styles.promptText}>
                        {images[selectedIndex]?.prompt_text}
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
                      <Text style={styles.surveyData}>
                        {images[selectedIndex]?.review.timeTaken}
                      </Text>
                    </ScrollView>
                  </>
                )
              )}
            </View>
          </FlingGestureHandler>
        </FlingGestureHandler>
      </View>
    </GestureHandlerRootView>
  </Modal>
    </View>
);
};  
export default GalleryScreen;