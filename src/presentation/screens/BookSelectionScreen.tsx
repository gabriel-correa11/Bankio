import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppColors } from '../theme/colors';
import { signOut } from '../../core/services/authService';
import { useAuthStore } from '../../store/authStore';

export default function BookSelectionScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha um Livro</Text>
      <Text style={styles.subtitle}>
        Bem-vindo, {user?.displayName ?? user?.email}!
      </Text>
      <Text style={styles.hint}>(Próxima aula)</Text>

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.lightBlue,
  },
  hint: {
    fontSize: 13,
    color: '#6B7FC4',
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: AppColors.lightBlue,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: AppColors.lightBlue,
    fontSize: 16,
  },
});
