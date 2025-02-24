import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

const QuestionScreen = ({ question, options, selectedAnswer, onSelectAnswer }) => {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelectAnswer(option)}
            style={[styles.optionButton, selectedAnswer === option && styles.optionButtonSelected]}
          >
            <Text style={[styles.optionText, selectedAnswer === option && styles.optionTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuestionScreen;
