import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../theme/colors';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { container: number; font: number }> = {
  sm: { container: 28, font: 12 },
  md: { container: 40, font: 16 },
  lg: { container: 56, font: 22 },
};

interface Props {
  level: number;
  size?: Size;
}

export default function LevelBadge({ level, size = 'md' }: Props) {
  const { container, font } = sizes[size];
  return (
    <View style={[styles.badge, { width: container, height: container, borderRadius: container / 2 }]}>
      <Text style={[styles.text, { fontSize: font }]}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: AppColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: AppColors.darkBlue,
    fontWeight: 'bold',
  },
});
