import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  themeTitle: { fontSize: 28, fontWeight: '600', textAlign: 'center', marginTop: 20, marginBottom: 30 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  questionText: { fontSize: 18, fontWeight: '500', marginBottom: 24, textAlign: 'center' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 30 },
  optionButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  optionButtonSelected: { backgroundColor: '#A0A0A0' },
  optionText: { fontSize: 14, color: '#000000' },
  optionTextSelected: { color: '#FFFFFF' },

  navButtonText: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#000000' 
  },

  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 'auto', marginBottom: 20 },
  navButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButton: { backgroundColor: '#E0E0E0' },
  nextButton: { backgroundColor: '#C0A9BD' },
  navButtonDisabled: { opacity: 0.5 },
  
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  progressDotActive: { backgroundColor: '#C0A9BD' },
});

export default styles;
