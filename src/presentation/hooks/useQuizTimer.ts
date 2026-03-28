import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { AppColors } from '../theme/colors';

const TIMER_SECONDS = 20;

export function useQuizTimer(onTimeout: () => void) {
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timerAnimRef.current) {
      timerAnimRef.current.stop();
    }
  }, []);

  const startTimer = useCallback(() => {
    setTimeLeft(TIMER_SECONDS);
    timerAnim.setValue(1);
    timerAnimRef.current = Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIMER_SECONDS * 1000,
      useNativeDriver: false,
    });
    timerAnimRef.current.start();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          onTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [AppColors.error, AppColors.warning, AppColors.success],
  });

  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return { timeLeft, timerColor, timerWidth, startTimer, stopTimer };
}
