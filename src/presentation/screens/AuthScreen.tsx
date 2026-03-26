import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../theme/colors';
import { signIn, signUp, sendPasswordReset } from '../../core/services/authService';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === 'login';

  function resetFields() {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  }

  function toggleMode() {
    resetFields();
    setMode(isLogin ? 'register' : 'login');
  }

  async function handleSubmit() {
    const emailTrimmed = email.trim();

    if (!emailTrimmed || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        Alert.alert('Atenção', 'Preencha seu nome.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Atenção', 'As senhas não coincidem.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(emailTrimmed, password);
      } else {
        await signUp(emailTrimmed, password, name.trim());
      }
    } catch (error: any) {
      Alert.alert('Erro', getFirebaseErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordReset() {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      Alert.alert('Atenção', 'Digite seu e-mail primeiro.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordReset(emailTrimmed);
      Alert.alert('Enviado!', 'Verifique sua caixa de entrada para redefinir a senha.');
    } catch (error: any) {
      Alert.alert('Erro', getFirebaseErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <MaterialIcons name="auto-stories" size={64} color={AppColors.lightBlue} />
          <Text style={styles.title}>BankIo</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#6B7FC4"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#6B7FC4"
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
              placeholderTextColor="#6B7FC4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={AppColors.lightBlue}
              />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                placeholderTextColor="#6B7FC4"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={handlePasswordReset} style={styles.linkButton} disabled={isLoading}>
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
              <Text style={styles.toggleAction}>
                {isLogin ? 'Cadastre-se' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'Nenhuma conta encontrada com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
  };
  return messages[code] ?? 'Ocorreu um erro. Tente novamente.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.darkBlue,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: AppColors.white,
    marginTop: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.lightBlue,
    marginTop: 6,
  },
  form: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.royalBlue,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: AppColors.white,
    fontSize: 16,
  },
  inputFlex: {
    flex: 1,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkText: {
    color: AppColors.lightBlue,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  toggleLabel: {
    color: '#9BAEDD',
    fontSize: 14,
  },
  toggleAction: {
    color: AppColors.lightBlue,
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
