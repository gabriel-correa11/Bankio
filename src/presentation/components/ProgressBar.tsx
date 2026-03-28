import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors } from '../theme/colors';

interface Props {
  current: number;
  max: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ current, max, color = AppColors.strongBlue, height = 8 }: Props) {
  const pct = Math.min(Math.max(current / max, 0), 1);
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 99,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 99,
  },
});
