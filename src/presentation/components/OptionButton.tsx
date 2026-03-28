import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { AppColors } from '../theme/colors';

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

const bgColors: Record<OptionState, string> = {
  idle: AppColors.royalBlue,
  selected: AppColors.midBlue,
  correct: AppColors.success,
  wrong: AppColors.error,
};

interface Props {
  text: string;
  state: OptionState;
  onPress: () => void;
  disabled: boolean;
}

export default function OptionButton({ text, state, onPress, disabled }: Props) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
    if (state === 'correct') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: bgColors[state] }]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 16,
    marginBottom: 10,
  },
  text: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '500',
  },
});
