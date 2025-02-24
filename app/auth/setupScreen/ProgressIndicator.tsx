import React from 'react';
import { View } from 'react-native';
import styles from './styles';

const ProgressIndicator = ({ totalQuestions, currentIndex }) => {
  return (
    <View style={styles.progressContainer}>
      {[...Array(totalQuestions)].map((_, index) => (
        <View key={index} style={[styles.progressDot, index <= currentIndex && styles.progressDotActive]} />
      ))}
    </View>
  );
};

export default ProgressIndicator;
