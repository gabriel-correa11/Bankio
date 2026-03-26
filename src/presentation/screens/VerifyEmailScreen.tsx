import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { reload, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { signOut } from '../../core/services/authService';
import { AppColors } from '../theme/colors';

export default function VerifyEmailScreen() {
  const [isSending, setIsSending] = React.useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await reload(user);
      }
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleResend() {
    const user = auth.currentUser;
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      Alert.alert('Enviado!', 'Novo e-mail de verificação enviado.');
    } catch {
      Alert.alert('Erro', 'Não foi possível reenviar. Tente mais tarde.');
    } finally {
      setIsSending(false);
    }
  }

  const userEmail = auth.currentUser?.email ?? '';

  return (
    <View style={styles.container}>
      <MaterialIcons name="mark-email-unread" size={90} color={AppColors.lightBlue} />
      <Text style={styles.title}>Verifique seu E-mail</Text>
      <Text style={styles.message}>
        Enviamos um link para:{'\n'}
        <Text style={styles.email}>{userEmail}</Text>
      </Text>
      <Text style={styles.hint}>
        Clique no link e esta tela avança automaticamente.
      </Text>

      <TouchableOpacity
        style={[styles.button, isSending && styles.buttonDisabled]}
        onPress={handleResend}
        disabled={isSending}
        activeOpacity={0.8}
      >
        {isSending ? (
          <ActivityIndicator color={AppColors.white} />
        ) : (
          <Text style={styles.buttonText}>Reenviar E-mail</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlineButton} onPress={signOut}>
        <Text style={styles.outlineButtonText}>Cancelar e Voltar</Text>
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
    padding: 28,
    gap: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: AppColors.white,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#9BAEDD',
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    color: AppColors.lightBlue,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 13,
    color: '#6B7FC4',
    textAlign: 'center',
  },
  button: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: AppColors.lightBlue,
    borderRadius: 10,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: AppColors.lightBlue,
    fontSize: 16,
  },
});
