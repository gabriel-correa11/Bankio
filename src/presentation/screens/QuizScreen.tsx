import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import OptionButton from '../components/OptionButton';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { styles } from './QuizScreen.styles';
import { AppColors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'Quiz'>;
type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

export default function QuizScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const {
    questions, currentIndex, answers,
    answerQuestion, nextQuestion, prevQuestion, finishQuiz, resetSession,
  } = useQuizStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const xpAnim = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const { timeLeft, timerColor, timerWidth, startTimer, stopTimer } = useQuizTimer(() => {
    if (showFeedback || selectedAnswer !== null) return;
    setSelectedAnswer(-1);
    setShowFeedback(true);
    answerQuestion(-1);
    // auto-advance on timeout only for non-last questions
    if (!isLastQuestion) {
      autoAdvanceTimer.current = setTimeout(() => handleNext(), 900);
    }
  });

  // When currentIndex changes (next or back), sync local state from answers array
  useEffect(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    const existingAnswer = answers[currentIndex];
    if (existingAnswer !== null && existingAnswer !== undefined) {
      // Already answered — show locked feedback, no timer
      setSelectedAnswer(existingAnswer);
      setShowFeedback(true);
    } else {
      // Fresh question — start timer
      setSelectedAnswer(null);
      setShowFeedback(false);
      startTimer();
    }
    return () => {
      stopTimer();
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [currentIndex]);

  function handleAnswer(index: number) {
    if (showFeedback || selectedAnswer !== null) return;
    stopTimer();
    setSelectedAnswer(index);
    setShowFeedback(true);
    answerQuestion(index);
    if (index === question.correctIndex) {
      xpAnim.setValue(0);
      xpOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(xpAnim, { toValue: -50, duration: 800, useNativeDriver: true }),
        Animated.timing(xpOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }
    // Auto-advance only for non-last questions
    if (!isLastQuestion) {
      autoAdvanceTimer.current = setTimeout(() => handleNext(), 900);
    }
  }

  async function handleNext() {
    if (isFinishing) return;
    if (isLastQuestion) {
      setIsFinishing(true);
      const result = await finishQuiz(user!.uid, user?.displayName ?? user?.email ?? '');
      resetSession();
      navigation.replace('Results', { result });
    } else {
      nextQuestion();
    }
  }

  function handleBack() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    prevQuestion();
  }

  function getOptionState(index: number): OptionState {
    if (!showFeedback) return 'idle';
    if (index === question.correctIndex) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'idle';
  }

  if (!question) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
      </View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="arrow-back-ios" size={18} color={AppColors.lightBlue} />
            </TouchableOpacity>
          )}
          <Text style={styles.questionCount}>{currentIndex + 1} / {questions.length}</Text>
        </View>
        <Text style={styles.timer}>{timeLeft}s</Text>
      </View>
      <View style={styles.questionWrap}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>
      <View style={styles.optionsWrap}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            text={opt}
            state={getOptionState(i)}
            onPress={() => handleAnswer(i)}
            disabled={showFeedback}
          />
        ))}
      </View>
      {showFeedback && selectedAnswer === question.correctIndex && (
        <Animated.Text style={[styles.xpToast, { transform: [{ translateY: xpAnim }], opacity: xpOpacity }]}>
          +{question.xpReward} XP
        </Animated.Text>
      )}
      {showFeedback && isLastQuestion && (
        <TouchableOpacity
          style={[styles.nextBtn, isFinishing && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={isFinishing}
        >
          <Text style={styles.nextBtnText}>Ver Resultado</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
