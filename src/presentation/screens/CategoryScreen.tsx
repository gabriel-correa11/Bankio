import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../App';
import { useQuizStore } from '../../store/quizStore';
import { QuizCategory } from '../../core/models/quiz';
import { checkFloodGuard } from '../../core/services/quizService';
import { AppColors } from '../theme/colors';
import CategoryCard from '../components/CategoryCard';

type Props = StackScreenProps<RootStackParamList, 'Category'>;

const CATEGORIES: { slug: QuizCategory; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { slug: 'poupanca', label: 'Poupança', icon: 'savings' },
  { slug: 'investimentos', label: 'Investimentos', icon: 'trending-up' },
  { slug: 'credito', label: 'Crédito', icon: 'credit-card' },
  { slug: 'orcamento', label: 'Orçamento', icon: 'calculate' },
];

function getBlockLabel(reason: string | null, cooldownSecondsLeft?: number): string | null {
  if (!reason) return null;
  if (reason === 'cooldown') return `Aguarde ${cooldownSecondsLeft}s para jogar novamente`;
  if (reason === 'dailyXPCap') return 'Limite diário de XP atingido (500 XP)';
  if (reason === 'categoryDailyLimit') return 'Limite diário nesta categoria (3 quizzes)';
  return null;
}

export default function CategoryScreen({ navigation }: Props) {
  const { userProgress, startQuiz } = useQuizStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const anyInCooldown = CATEGORIES.some((cat) => {
      if (!userProgress) return false;
      return checkFloodGuard(userProgress, cat.slug).reason === 'cooldown';
    });
    if (!anyInCooldown) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [userProgress]); // tick intencionalmente fora: só precisa reiniciar quando o progresso muda

  function handleSelect(category: QuizCategory) {
    if (!userProgress) return;
    const check = checkFloodGuard(userProgress, category);
    if (check.blocked) return;
    startQuiz(category);
    navigation.navigate('Quiz');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Escolha uma Categoria</Text>
      <Text style={styles.sub}>10 perguntas por quiz · Ganhe XP em cada resposta certa</Text>

      {CATEGORIES.map((cat) => {
        const check = userProgress ? checkFloodGuard(userProgress, cat.slug) : { blocked: false, reason: null as null };
        const label = getBlockLabel(check.reason, check.cooldownSecondsLeft);

        return (
          <CategoryCard
            key={cat.slug}
            label={cat.label}
            icon={cat.icon}
            stats={userProgress?.categoryStats[cat.slug] ?? { played: 0, correct: 0 }}
            onPress={() => handleSelect(cat.slug)}
            blocked={check.blocked}
            blockLabel={label ?? undefined}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: AppColors.white, fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  sub: { color: AppColors.muted, fontSize: 13, marginBottom: 24 },
});
