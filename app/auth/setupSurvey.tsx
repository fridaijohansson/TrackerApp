import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '@lib/supabase';

const surveyQuestions = [
  {
    theme: "Artist Profile",
    questions: [
      {
        id: 1,
        question: "Which option best describes your style?",
        options: ["Cartoon drawing", "Line art", "Sketching", "Illustration", "Surrealism", "Abstract", "Doodling", "Digital art", "Pixel drawing", "Realism", "Expressionism", "Minimalist", "Concept art", "Pop art"]
      },
      {
        id: 2,
        question: "What medium do you prefer?",
        options: ["Digital", "Pencil", "Ink"]
      },
      {
        id: 3,
        question: "What themes inspire you most?",
        options: ["Nature", "Urban", "Fantasy", "Sci-fi", "Abstract", "Portrait", "Still life", "Character design"]
      }
    ]
  },
  {
    theme: "Skill Assessment",
    questions: [
      {
        id: 4,
        question: "How would you rate your artistic experience?",
        options: ["Beginner", "Intermediate", "Advanced", "Professional"]
      },
      {
        id: 5,
        question: "How often do you create art?",
        options: ["Daily", "Weekly", "Monthly", "Occasionally"]
      },
      {
        id: 6,
        question: "What's your primary goal?",
        options: ["Hobby", "Professional development", "Building portfolio", "Learning new skills"]
      }
    ]
  },
  {
    theme: "Prompt Setup",
    questions: [
      {
        id: 7,
        question: "How detailed do you prefer prompts to be?",
        options: ["Simple", "Moderate", "Complex", "Varying"]
      },
      {
        id: 8,
        question: "What type of prompts interest you?",
        options: ["Technical exercises", "Creative challenges", "Subject matter", "Style exploration"]
      },
      {
        id: 9,
        question: "Would you like notifications and when?",
        options: ["Early morning (7am)", "Late morning (11am)", "early afternoon (2pm)", "Late afternoon (5pm)", "Early evening (7pm)", "Late evening (10pm)"]
      }
    ]
  }
];

const SetupSurvey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const router = useRouter();

  // Calculate current theme and question
  const totalQuestions = surveyQuestions.reduce((acc, theme) => acc + theme.questions.length, 0);
  const getCurrentThemeAndQuestion = () => {
    let questionCount = 0;
    for (const theme of surveyQuestions) {
      if (currentQuestionIndex < questionCount + theme.questions.length) {
        const questionIndex = currentQuestionIndex - questionCount;
        return {
          theme: theme.theme,
          question: theme.questions[questionIndex]
        };
      }
      questionCount += theme.questions.length;
    }
  };

  const currentThemeAndQuestion = getCurrentThemeAndQuestion();

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
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

    const { error } = await supabase
      .from('profiles')
      .update({ 
        hasCompletedSurvey: true,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    router.replace('/auth/gallery');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.themeTitle}>{currentThemeAndQuestion?.theme}</Text>
      
      <View style={styles.contentContainer}>
        <Text style={styles.questionText}>
          {currentThemeAndQuestion?.question.question}
        </Text>

        <View style={styles.optionsContainer}>
          {currentThemeAndQuestion?.question.options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleAnswer(option)}
              style={[
                styles.optionButton,
                answers[currentQuestionIndex] === option && styles.optionButtonSelected
              ]}
            >
              <Text style={[
                styles.optionText,
                answers[currentQuestionIndex] === option && styles.optionTextSelected
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
            disabled={!answers[currentQuestionIndex]}
            style={[
              styles.navButton,
              styles.nextButton,
              !answers[currentQuestionIndex] && styles.navButtonDisabled
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