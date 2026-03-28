import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Achievement } from '../../core/models/achievement';
import { AppColors } from '../theme/colors';

interface Props {
  achievement: Achievement;
  size?: 'sm' | 'md';
  locked?: boolean;
}

export default function AchievementBadge({ achievement, size = 'md', locked = false }: Props) {
  const dim = size === 'sm' ? 40 : 56;
  const iconSize = size === 'sm' ? 20 : 28;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          { width: dim, height: dim, borderRadius: dim / 2 },
          locked ? styles.circleLocked : styles.circleUnlocked,
        ]}
      >
        <MaterialIcons
          name={achievement.icon}
          size={iconSize}
          color={locked ? AppColors.muted : AppColors.darkBlue}
        />
      </View>
      {size === 'md' && (
        <Text style={[styles.title, locked && styles.titleLocked]} numberOfLines={2}>
          {achievement.title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 6, width: 72 },
  circle: { alignItems: 'center', justifyContent: 'center' },
  circleUnlocked: { backgroundColor: AppColors.gold },
  circleLocked: { backgroundColor: AppColors.royalBlue, borderWidth: 1, borderColor: AppColors.midBlue },
  title: { color: AppColors.gold, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  titleLocked: { color: AppColors.muted },
});
