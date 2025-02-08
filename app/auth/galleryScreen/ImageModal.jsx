// ImageModal.js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, PanResponder } from 'react-native';
import  supabase  from '@lib/supabase';

const ImageModal = ({ 
  visible, 
  image,
  onClose,
  images,
  selectedIndex,
  setSelectedIndex
}) => {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id);
    };
    
    fetchUser();
  }, []);

  const handleSwipe = (direction) => {
    if (selectedIndex === null) return;
    
    let newIndex;
    if (direction === 'LEFT' && selectedIndex < images.length - 1) {
      newIndex = selectedIndex + 1;
    } else if (direction === 'RIGHT' && selectedIndex > 0) {
      newIndex = selectedIndex - 1;
    }
    
    if (newIndex !== undefined) {
      setSelectedIndex(newIndex);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      const SWIPE_THRESHOLD = 50;
      
      if (gestureState.dx > SWIPE_THRESHOLD) {
        handleSwipe('RIGHT');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        handleSwipe('LEFT');
      }
    },
  });

  const getImageUrl = (imageUrl) => {
    if (!userId || !imageUrl) return null;
    return `${userId}/${imageUrl}`;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <View 
          style={styles.modalCard}
          {...panResponder.panHandlers}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.dateText}>
              {image?.created_at ? new Date(image.created_at).toLocaleDateString() : ''}
            </Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.imageContainer}>
              {userId && image?.image_url && (
                <Image 
                source={{ uri: image?.image_url }} // Use the signed URL directly
                style={styles.fullImage}
                resizeMode="contain"
              />
              )}
            </View>

            <Text style={styles.promptText}>
              {image?.prompt_text}
            </Text>

            <Text style={styles.surveyTitle}>Survey Responses:</Text>
            <Text style={styles.surveyData}>
              {image?.review ? JSON.stringify(image.review, null, 2) : ''}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Add these to your existing styles
const styles = StyleSheet.create({
  // ... your existing styles ...
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  // ... rest of your styles
});

export default ImageModal;