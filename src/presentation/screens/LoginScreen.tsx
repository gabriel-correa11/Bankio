import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { signIn } from '../../core/services/authService';
import { AppColors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'Nenhuma conta encontrada com esse e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setIsLoading(true);
    try {
      await signIn(emailTrimmed, password);
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
          <Text style={styles.subtitle}>Acesse sua conta</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={AppColors.white} />
              : <Text style={styles.buttonText}>Entrar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPasswordRequest')}
            style={styles.linkButton}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
              <Text style={styles.toggleAction}>Cadastre-se</Text>
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
  linkButton: { alignItems: 'center', paddingVertical: 6 },
  linkText: { color: AppColors.lightBlue, fontSize: 14 },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  toggleLabel: { color: AppColors.softBlue, fontSize: 14 },
  toggleAction: { color: AppColors.lightBlue, fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },
});
