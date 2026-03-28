import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { AppColors } from '../theme/colors';
import ProgressBar from '../components/ProgressBar';

type Props = StackScreenProps<RootStackParamList, 'Results'>;

const CATEGORY_LABELS: Record<string, string> = {
  poupanca: 'Poupança',
  investimentos: 'Investimentos',
  credito: 'Crédito',
  orcamento: 'Orçamento',
};

export default function ResultsScreen({ route, navigation }: Props) {
  const { result } = route.params;
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDisplayedScore(count);
      if (count >= result.correctAnswers) clearInterval(interval);
    }, 600 / result.correctAnswers || 100);
    return () => clearInterval(interval);
  }, []);

  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const isPerfect = result.correctAnswers === result.totalQuestions;
  const isGood = result.correctAnswers >= 7;

  const icon = isPerfect ? 'emoji-events' : isGood ? 'military-tech' : 'menu-book';
  const iconColor = isPerfect ? AppColors.gold : isGood ? AppColors.warning : AppColors.muted;

  return (
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
    marginBottom: 24,
  },
  xpText: { color: AppColors.gold, fontSize: 16, fontWeight: '700' },
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
});
