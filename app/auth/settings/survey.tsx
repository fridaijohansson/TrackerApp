import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import supabase  from '@lib/supabase'; // Adjust path as needed
import { MaterialIcons } from '@expo/vector-icons';
import * as SurveyQuestions from '../../../constants/surveyData';
import { Modal } from 'react-native';
type CategoryKeys = 'artist_profile' | 'skill_assessment' | 'prompt_setup' | 'notifications_setup';

interface UserPreferences {
  artist_profile: Record<string, string>;
  skill_assessment: Record<string, string>;
  prompt_setup: Record<string, string>;
  notifications_setup: Record<string, string>;
}

interface SelectedOption {
  category: CategoryKeys;
  key: string;
  value: string;
}

const SurveySettings = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatCategoryName = (name: CategoryKeys): string => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_preferences')
        .select('artist_profile, skill_assessment, prompt_setup, notifications_setup')
        .eq('id', user.id)
        .single();

    console.log(data);

      if (error) throw error;
      setPreferences(data as UserPreferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
    
  };

  const handleOptionChange = async (category: CategoryKeys, key: string, newValue: string) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: newValue
      }
    };

    setPreferences(updatedPreferences);
    setHasChanges(true);
    setModalVisible(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_preferences')
        .update(updatedPreferences)
        .eq('id', user.id);

      if (error) throw error;
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C0A9BD" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {preferences && (Object.entries(preferences) as [CategoryKeys, Record<string, string>][]).map(([category, values]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>
              {formatCategoryName(category)}
            </Text>
            {Object.entries(values).map(([key, value]: [string, string]) => (
              <TouchableOpacity
                key={key}
                style={styles.optionButton}
                onPress={() => {
                  setSelectedOption({
                    category,
                    key,
                    value
                  });
                  setModalVisible(true);
                }}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionQuestion}>
                    {SurveyQuestions[category]?.[key]?.question || key}
                  </Text>
                  <Text style={styles.optionValue}>{value}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOption && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {SurveyQuestions[selectedOption.category]?.[selectedOption.key]?.question || selectedOption.key}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScrollView}>
                  {SurveyQuestions[selectedOption.category]?.[selectedOption.key]?.options.map((option: string) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.modalOption,
                        option === selectedOption.value && styles.modalOptionSelected
                      ]}
                      onPress={() => handleOptionChange(selectedOption.category, selectedOption.key, option)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        option === selectedOption.value && styles.modalOptionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
  },
  optionQuestion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#C0A9BD',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
  },
  modalOptionTextSelected: {
    color: '#FFF',
    fontWeight: '500',
  },
});

export default SurveySettings;