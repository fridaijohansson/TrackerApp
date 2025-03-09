import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between', // This will push content to top and bottom
  },
  contentContainer: {
    flex: 1,
  },
  promptContainer: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 10,
    color: '#333',
  },
  promptText: {
    fontSize: 18,
    color: '#444',
    lineHeight: 24,
    paddingBottom:10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#C0A9BD',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#C0A9BD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  container_review: { flex: 1, padding: 20 },
  scrollView: { flexGrow: 1 },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  iconContainer: { flexDirection: 'row', gap: 5, marginBottom: 20 },
});

export default styles;