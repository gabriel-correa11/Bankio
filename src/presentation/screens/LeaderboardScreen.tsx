import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { LeaderboardEntry } from '../../core/models/quiz';
import { AppColors } from '../theme/colors';
import LevelBadge from '../components/LevelBadge';

type Props = StackScreenProps<RootStackParamList, 'Leaderboard'>;

const rankColors = [AppColors.gold, '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen({ }: Props) {
  const { user } = useAuthStore();
  const { leaderboard, loadLeaderboard } = useQuizStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    loadLeaderboard().finally(() => setLoading(false));
  }, []);

  function renderItem({ item, index }: { item: LeaderboardEntry; index: number }) {
    const isMe = item.uid === user?.uid;
    const rankColor = index < 3 ? rankColors[index] : AppColors.muted;

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={styles.rankWrap}>
          {index < 3 ? (
            <MaterialIcons name="military-tech" size={22} color={rankColor} />
          ) : (
            <Text style={[styles.rank, { color: rankColor }]}>{index + 1}</Text>
          )}
        </View>
        <LevelBadge level={item.level} size="sm" />
        <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
          {item.displayName}
        </Text>
        <View style={styles.xpWrap}>
          <MaterialIcons name="star" size={14} color={AppColors.gold} />
          <Text style={styles.xp}>{item.totalXP}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.lightBlue} />
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="leaderboard" size={64} color={AppColors.muted} />
        <Text style={styles.emptyText}>Nenhum jogador no ranking ainda.</Text>
        <Text style={styles.emptySubText}>Seja o primeiro a completar um quiz!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>Top {leaderboard.length} jogadores</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue },
  center: { flex: 1, backgroundColor: AppColors.darkBlue, alignItems: 'center', justifyContent: 'center', padding: 24 },
  list: { padding: 16, paddingBottom: 32 },
  header: { color: AppColors.muted, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowMe: { backgroundColor: AppColors.midBlue, borderColor: AppColors.strongBlue },
  rankWrap: { width: 28, alignItems: 'center' },
  rank: { fontSize: 15, fontWeight: '700' },
  name: { flex: 1, color: AppColors.white, fontSize: 14 },
  nameMe: { fontWeight: '700' },
  xpWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xp: { color: AppColors.gold, fontSize: 14, fontWeight: '700' },
  emptyText: { color: AppColors.white, fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubText: { color: AppColors.muted, fontSize: 13, marginTop: 6 },
});
