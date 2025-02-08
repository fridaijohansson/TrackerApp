import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '@lib/supabase';
import { artist_profile, skill_assessment, prompt_setup } from 'constants/surveyData';

const SetupSurvey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const router = useRouter();

  // Create a flat array of questions for navigation
  const categories = [
    { name: 'Artist Profile', data: artist_profile },
    { name: 'Skill Assessment', data: skill_assessment },
    { name: 'Prompt Setup', data: prompt_setup }
  ];

  const flatQuestions = categories.reduce((acc, category) => {
    const categoryQuestions = Object.entries(category.data).map(([nickname, data]) => ({
      category: category.name,
      nickname,
      ...data
    }));
    return [...acc, ...categoryQuestions];
  }, []);

  const totalQuestions = flatQuestions.length;
  const currentQuestion = flatQuestions[currentQuestionIndex];

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.category]: {
        ...prev[currentQuestion.category],
        [currentQuestion.nickname]: answer
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitSurvey();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitSurvey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    // Transform answers into the correct format for the database
    const preferences = {
      id: user.id,
      artist_profile: answers['Artist Profile'] || {},
      skill_assessment: answers['Skill Assessment'] || {},
      prompt_setup: answers['Prompt Setup'] || {}
    };

    const { error } = await supabase
      .from('user_preferences')
      .upsert(preferences);

    if (error) {
      console.error('Error saving survey preferences:', error);
      return;
    }

    // Update profiles table to mark survey as completed
    await supabase
      .from('profiles')
      .update({ hasCompletedSurvey: true })
      .eq('id', user.id);

    router.replace('/auth/gallery');
  };

  const getCurrentAnswer = () => {
    return answers[currentQuestion?.category]?.[currentQuestion?.nickname];
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.themeTitle}>{currentQuestion?.category}</Text>
      
      <View style={styles.contentContainer}>
        <Text style={styles.questionText}>
          {currentQuestion?.question}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleAnswer(option)}
              style={[
                styles.optionButton,
                getCurrentAnswer() === option && styles.optionButtonSelected
              ]}
            >
              <Text style={[
                styles.optionText,
                getCurrentAnswer() === option && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.navButton,
              styles.backButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled
            ]}
          >
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleNext}
            disabled={!getCurrentAnswer()}
            style={[
              styles.navButton,
              styles.nextButton,
              !getCurrentAnswer() && styles.navButtonDisabled
            ]}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          {[...Array(totalQuestions)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentQuestionIndex && styles.progressDotActive
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  themeTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  optionButtonSelected: {
    backgroundColor: '#A0A0A0',
  },
  optionText: {
    fontSize: 14,
    color: '#000000',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#C0A9BD',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#C0A9BD',
  },
});

export default SetupSurvey;