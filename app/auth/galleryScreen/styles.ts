
import {StyleSheet } from 'react-native';

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
      height:100,
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
      shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  
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
    yearSection: {
      marginBottom: 30,
    },
    yearHeader: {
      fontSize: 24,
      fontWeight: '600',
      color: '#999',
      textAlign: 'center',
      marginBottom: 15,
    },
    monthSection: {
      marginBottom: 20,
    },
    monthHeader: {
      fontSize: 20,
      fontWeight: '500',
      color: '#666',
      marginLeft: 10,
      marginBottom: 10,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      paddingHorizontal: 5,
    },
    galleryContainer: {
      flex: 1,
    },
  
    missedThumbnail: {
      opacity: 0.5
    },
    ongoingPromptContainer: {
      padding: 20,
      alignItems: 'center'
    },
    uploadButton: {
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      width: '100%'
    },

    emptyStateContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      marginVertical: 5,
      width: '100%',
    },
    emptyStateText: {
      fontSize: 14,
      color: '#888',
      fontStyle: 'italic',
    },
  });
  
  
  export default styles;
  
  