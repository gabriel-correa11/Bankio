import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../theme/colors';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ icon, label, value, color = AppColors.strongBlue }: Props) {
  return (
    <View style={styles.card}>
      <MaterialIcons name={icon} size={28} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    margin: 6,
  },
  value: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  label: {
    color: AppColors.muted,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});
