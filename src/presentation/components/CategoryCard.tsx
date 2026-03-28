import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../theme/colors';
import { CategoryStats } from '../../core/models/quiz';

interface Props {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  stats: CategoryStats;
  onPress: () => void;
  blocked?: boolean;
  blockLabel?: string;
}

export default function CategoryCard({ label, icon, stats, onPress, blocked, blockLabel }: Props) {
  const hasPlayed = stats.played > 0;
  const accuracy = hasPlayed ? Math.round((stats.correct / stats.played) * 100) : null;

  return (
    <TouchableOpacity
      style={[styles.card, blocked && styles.cardBlocked]}
      onPress={onPress}
      activeOpacity={blocked ? 1 : 0.75}
      disabled={blocked}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={32} color={blocked ? AppColors.muted : AppColors.strongBlue} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, blocked && styles.labelBlocked]}>{label}</Text>
        <Text style={styles.sub}>
          {blocked && blockLabel
            ? blockLabel
            : hasPlayed
            ? `${stats.correct}/${stats.played} corretas · ${accuracy}%`
            : 'Não jogado ainda'}
        </Text>
      </View>
      <MaterialIcons name={blocked ? 'lock-clock' : 'chevron-right'} size={24} color={AppColors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  cardBlocked: {
    opacity: 0.6,
    borderColor: AppColors.warning,
  },
  labelBlocked: {
    color: AppColors.muted,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: AppColors.midBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  label: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    color: AppColors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
