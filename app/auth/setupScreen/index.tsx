import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { artist_profile, skill_assessment, prompt_setup, notifications_setup } from '../../../constants/surveyData';
import QuestionScreen from './QuestionScreen';
import ProgressIndicator from './ProgressIndicator';
import { handleSubmitSurvey } from '../../../lib/SurveyHandler';
import styles from './styles';

const categories = [
  { name: 'Artist Profile', data: artist_profile },
  { name: 'Skill Assessment', data: skill_assessment },
  { name: 'Prompt Setup', data: prompt_setup },
  { name: 'Notifications Setup', data: notifications_setup },
];

const SetupSurvey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const router = useRouter();

  // Flatten questions into an array
  const flatQuestions = categories.reduce((acc, category) => {
    return [...acc, ...Object.entries(category.data).map(([nickname, data]) => ({
      category: category.name, nickname, ...data
    }))];
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
      handleSubmitSurvey(answers, router);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.themeTitle}>{currentQuestion?.category}</Text>

      <QuestionScreen 
        question={currentQuestion?.question} 
        options={currentQuestion?.options} 
        selectedAnswer={answers[currentQuestion?.category]?.[currentQuestion?.nickname]} 
        onSelectAnswer={handleAnswer} 
      />

      <View style={styles.navigationContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity onPress={() => setCurrentQuestionIndex(prev => prev - 1)} style={[styles.navButton, styles.backButton]}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleNext} disabled={!answers[currentQuestion?.category]?.[currentQuestion?.nickname]} style={[styles.navButton, styles.nextButton]}>
          <Text style={styles.navButtonText}>{currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>

      <ProgressIndicator totalQuestions={totalQuestions} currentIndex={currentQuestionIndex} />
    </SafeAreaView>
  );
};

export default SetupSurvey;
