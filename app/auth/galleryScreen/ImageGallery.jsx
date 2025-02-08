
import React from 'react';
import { FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

const ImageGallery = ({ images, onImagePress }) => {
  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.imageContainer} 
      onPress={() => onImagePress(index)}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.thumbnail}
        onError={(error) => console.log('Image loading error:', item.image_url)}
      />
    </TouchableOpacity>
  );

  return (
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
  );
};

const styles = StyleSheet.create({
  gallery: {
    backgroundColor: 'grey',
    width: '100%',
  },
  thumbnail: {
    width: 100,
    aspectRatio: 1,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  imageContainer: {
    width: '33.33%',
    alignItems: 'center',
  }
});

export default ImageGallery;