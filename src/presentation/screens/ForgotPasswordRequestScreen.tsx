import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { sendPasswordReset } from '../../core/services/authService';
import { AppColors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'ForgotPasswordRequest'>;

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'Nenhuma conta encontrada com esse e-mail.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
};

export default function ForgotPasswordRequestScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordReset(emailTrimmed);
      navigation.navigate('ForgotPasswordSent', { email: emailTrimmed });
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
          <MaterialIcons name="lock-reset" size={64} color={AppColors.lightBlue} />
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            Informe seu e-mail e enviaremos{'\n'}um link para redefinir sua senha.
          </Text>
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

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={AppColors.white} />
              : <Text style={styles.buttonText}>Enviar Link</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
            disabled={isLoading}
          >
            <MaterialIcons name="arrow-back" size={16} color={AppColors.lightBlue} />
            <Text style={styles.linkText}>  Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.darkBlue },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  header: { alignItems: 'center', marginBottom: 36 },
  title: { fontSize: 28, fontWeight: 'bold', color: AppColors.white, marginTop: 12, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: AppColors.softBlue, marginTop: 8, textAlign: 'center', lineHeight: 20 },
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
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  linkText: { color: AppColors.lightBlue, fontSize: 14 },
});
