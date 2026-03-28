import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { AppColors } from '../theme/colors';
import ProgressBar from '../components/ProgressBar';
import AchievementBadge from '../components/AchievementBadge';
import { useQuizStore } from '../../store/quizStore';
import { ACHIEVEMENTS } from '../../core/models/achievement';

type Props = StackScreenProps<RootStackParamList, 'Results'>;

const CATEGORY_LABELS: Record<string, string> = {
  poupanca: 'Poupança',
  investimentos: 'Investimentos',
  credito: 'Crédito',
  orcamento: 'Orçamento',
};

export default function ResultsScreen({ route, navigation }: Props) {
  const { result } = route.params;
  const { lastQuizAchievements, lastQuizLeveledUp, lastQuizPreviousLevel, userProgress } =
    useQuizStore();

  const [displayedScore, setDisplayedScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // animated score count-up
  useEffect(() => {
    if (result.correctAnswers === 0) return;
    let count = 0;
    const delay = Math.max(50, 600 / result.correctAnswers);
    const interval = setInterval(() => {
      count++;
      setDisplayedScore(count);
      if (count >= result.correctAnswers) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, []);

  // level-up modal
  useEffect(() => {
    if (lastQuizLeveledUp) setShowLevelUp(true);
  }, [lastQuizLeveledUp]);

  // achievement toast
  useEffect(() => {
    if (lastQuizAchievements.length === 0) return;
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  }, [lastQuizAchievements]);

  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const isPerfect = result.correctAnswers === result.totalQuestions;
  const isGood = result.correctAnswers >= 7;

  const icon = isPerfect ? 'emoji-events' : isGood ? 'military-tech' : 'menu-book';
  const iconColor = isPerfect ? AppColors.gold : isGood ? AppColors.warning : AppColors.muted;

  const newLevel = userProgress?.level ?? lastQuizPreviousLevel + 1;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={72} color={iconColor} />
        </View>

        <Text style={styles.categoryLabel}>{CATEGORY_LABELS[result.category]}</Text>

        <Text style={styles.score}>
          {displayedScore}
          <Text style={styles.scoreTotal}> / {result.totalQuestions}</Text>
        </Text>
        <Text style={styles.scoreLabel}>respostas corretas</Text>

        <View style={styles.xpBadge}>
          <MaterialIcons name="star" size={20} color={AppColors.gold} />
          <Text style={styles.xpText}>+{result.xpEarned} XP ganhos</Text>
        </View>

        {lastQuizAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.achievementsTitle}>
              {lastQuizAchievements.length === 1
                ? 'Conquista desbloqueada!'
                : `${lastQuizAchievements.length} conquistas desbloqueadas!`}
            </Text>
            <View style={styles.achievementsRow}>
              {lastQuizAchievements.map((id) => (
                <AchievementBadge key={id} achievement={ACHIEVEMENTS[id]} size="md" />
              ))}
            </View>
          </View>
        )}

        <View style={styles.accuracyWrap}>
          <View style={styles.accuracyHeader}>
            <Text style={styles.accuracyLabel}>Precisão</Text>
            <Text style={styles.accuracyPct}>{accuracy}%</Text>
          </View>
          <ProgressBar
            current={result.correctAnswers}
            max={result.totalQuestions}
            color={isGood ? AppColors.success : AppColors.warning}
            height={10}
          />
        </View>

        <Text style={styles.time}>
          <MaterialIcons name="timer" size={14} color={AppColors.muted} /> Concluído em {result.timeTaken}s
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Category')}>
          <Text style={styles.primaryBtnText}>Jogar Novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryBtnText}>Ir ao Início</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Level-up modal */}
      <Modal visible={showLevelUp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <MaterialIcons name="emoji-events" size={64} color={AppColors.gold} />
            <Text style={styles.modalTitle}>Subiu de Nível!</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelOld}>{lastQuizPreviousLevel}</Text>
              <MaterialIcons name="arrow-forward" size={20} color={AppColors.muted} />
              <Text style={styles.levelNew}>{newLevel}</Text>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowLevelUp(false)}>
              <Text style={styles.modalBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Achievement toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <MaterialIcons name="emoji-events" size={20} color={AppColors.gold} />
          <Text style={styles.toastText} numberOfLines={1}>
            {lastQuizAchievements.length === 1
              ? `Conquista: ${ACHIEVEMENTS[lastQuizAchievements[0]].title}`
              : `${lastQuizAchievements.length} conquistas desbloqueadas!`}
          </Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue },
  content: { alignItems: 'center', padding: 24, paddingBottom: 48 },
  iconWrap: { marginTop: 16, marginBottom: 8 },
  categoryLabel: { color: AppColors.muted, fontSize: 14, marginBottom: 12 },
  score: { color: AppColors.white, fontSize: 72, fontWeight: 'bold' },
  scoreTotal: { color: AppColors.muted, fontSize: 36, fontWeight: '400' },
  scoreLabel: { color: AppColors.muted, fontSize: 14, marginBottom: 20 },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.royalBlue,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 20,
  },
  xpText: { color: AppColors.gold, fontSize: 16, fontWeight: '700' },
  achievementsSection: {
    width: '100%',
    backgroundColor: AppColors.royalBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  achievementsTitle: { color: AppColors.gold, fontSize: 14, fontWeight: '700' },
  achievementsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  accuracyWrap: { width: '100%', marginBottom: 16 },
  accuracyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  accuracyLabel: { color: AppColors.muted, fontSize: 13 },
  accuracyPct: { color: AppColors.white, fontSize: 13, fontWeight: '600' },
  time: { color: AppColors.muted, fontSize: 13, marginBottom: 32 },
  primaryBtn: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    elevation: 4,
  },
  primaryBtnText: { color: AppColors.white, fontSize: 16, fontWeight: '700' },
  secondaryBtn: { padding: 14, alignItems: 'center', width: '100%' },
  secondaryBtnText: { color: AppColors.lightBlue, fontSize: 15 },
  // Level-up modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    gap: 12,
  },
  modalTitle: { color: AppColors.white, fontSize: 22, fontWeight: 'bold' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelOld: { color: AppColors.muted, fontSize: 28, fontWeight: '700' },
  levelNew: { color: AppColors.gold, fontSize: 36, fontWeight: 'bold' },
  modalBtn: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  modalBtnText: { color: AppColors.white, fontSize: 16, fontWeight: '700' },
  // Toast
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#7A5C00',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    elevation: 8,
  },
  toastText: { color: AppColors.white, fontSize: 14, fontWeight: '600', flex: 1 },
});
