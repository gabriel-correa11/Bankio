import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { signUp } from '../../core/services/authService';
import { AppColors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'Register'>;

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
};

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim()) { Alert.alert('Atenção', 'Preencha seu nome.'); return; }
    if (!email.trim()) { Alert.alert('Atenção', 'Preencha seu e-mail.'); return; }
    if (!password) { Alert.alert('Atenção', 'Preencha a senha.'); return; }
    if (password.length < 6) { Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.'); return; }
    if (password !== confirmPassword) { Alert.alert('Atenção', 'As senhas não coincidem.'); return; }

    setIsLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (error: any) {
      Alert.alert('Erro', FIREBASE_ERRORS[error.code] ?? 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <MaterialIcons name="auto-stories" size={64} color={AppColors.lightBlue} />
          <Text style={styles.title}>BankIo</Text>
          <Text style={styles.subtitle}>Crie sua conta</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={AppColors.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={AppColors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="Senha"
              placeholderTextColor={AppColors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={AppColors.lightBlue} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor={AppColors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={AppColors.white} />
              : <Text style={styles.buttonText}>Criar Conta</Text>
            }
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
              <Text style={styles.toggleAction}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header: { alignItems: 'center', marginBottom: 36 },
  title: { fontSize: 36, fontWeight: 'bold', color: AppColors.white, marginTop: 12, letterSpacing: 2 },
  subtitle: { fontSize: 16, color: AppColors.lightBlue, marginTop: 6 },
  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 50, color: AppColors.white, fontSize: 16 },
  inputFlex: { flex: 1 },
  eyeButton: { padding: 4 },
  button: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: AppColors.white, fontSize: 18, fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  toggleLabel: { color: AppColors.softBlue, fontSize: 14 },
  toggleAction: { color: AppColors.lightBlue, fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },
});
