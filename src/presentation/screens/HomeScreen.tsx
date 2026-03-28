import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { signOut } from '../../core/services/authService';
import { AppColors } from '../theme/colors';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import LevelBadge from '../components/LevelBadge';
import { ACHIEVEMENTS } from '../../core/models/achievement';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const XP_PER_LEVEL = 100;

function getLevelName(level: number): string {
  if (level <= 2) return 'Iniciante';
  if (level <= 5) return 'Aprendiz';
  if (level <= 9) return 'Intermediário';
  if (level <= 14) return 'Avançado';
  return 'Expert';
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const { userProgress, isLoadingProgress, loadUserProgress } = useQuizStore();

  useEffect(() => {
    if (user) {
      loadUserProgress(user.uid, user.displayName ?? user.email ?? '');
    }
  }, [user?.uid]);

  const xpInLevel = userProgress ? userProgress.totalXP % XP_PER_LEVEL : 0;
  const achievementCount = userProgress?.unlockedAchievements?.length ?? 0;
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.name}>{user?.displayName || user?.email || 'Usuário'}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <MaterialIcons name="logout" size={22} color={AppColors.muted} />
        </TouchableOpacity>
      </View>

      {isLoadingProgress ? (
        <ActivityIndicator size="large" color={AppColors.lightBlue} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.levelBanner}>
            <LevelBadge level={userProgress?.level ?? 1} size="lg" />
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>{getLevelName(userProgress?.level ?? 1)}</Text>
              <Text style={styles.xpText}>
                {xpInLevel} / {XP_PER_LEVEL} XP
              </Text>
              <ProgressBar current={xpInLevel} max={XP_PER_LEVEL} color={AppColors.gold} height={10} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard icon="star" label="Total XP" value={userProgress?.totalXP ?? 0} color={AppColors.gold} />
            <StatCard icon="local-fire-department" label="Sequência" value={`${userProgress?.streak ?? 0} dias`} color={AppColors.warning} />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="quiz" label="Quizzes Feitos" value={userProgress?.completedQuizzes ?? 0} color={AppColors.accent} />
            <StatCard icon="military-tech" label="Conquistas" value={`${achievementCount}/${totalAchievements}`} color={AppColors.gold} />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Category')}>
            <MaterialIcons name="play-arrow" size={24} color={AppColors.white} />
            <Text style={styles.primaryBtnText}>Iniciar Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Leaderboard')}>
            <MaterialIcons name="leaderboard" size={20} color={AppColors.lightBlue} />
            <Text style={styles.secondaryBtnText}>Ver Ranking Global</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { color: AppColors.muted, fontSize: 14 },
  name: { color: AppColors.white, fontSize: 22, fontWeight: 'bold' },
  signOutBtn: { padding: 8 },
  levelBanner: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  levelInfo: { flex: 1, gap: 6 },
  levelName: { color: AppColors.white, fontSize: 18, fontWeight: '700' },
  xpText: { color: AppColors.muted, fontSize: 12 },
  statsRow: { flexDirection: 'row', marginBottom: 4 },
  primaryBtn: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    elevation: 4,
    gap: 8,
  },
  primaryBtnText: { color: AppColors.white, fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  secondaryBtnText: { color: AppColors.lightBlue, fontSize: 15 },
});
