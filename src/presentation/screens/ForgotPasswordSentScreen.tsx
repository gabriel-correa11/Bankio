import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { AppColors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'ForgotPasswordSent'>;

export default function ForgotPasswordSentScreen({ navigation, route }: Props) {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="mark-email-read" size={80} color={AppColors.success} />
      </View>

      <Text style={styles.title}>E-mail Enviado!</Text>
      <Text style={styles.description}>
        Enviamos um link de recuperação para:
      </Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.hint}>
        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="login" size={20} color={AppColors.white} />
        <Text style={styles.buttonText}>  Voltar ao Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={() => navigation.navigate('ForgotPasswordRequest')}
      >
        <Text style={styles.resendText}>Não recebeu? Tentar novamente</Text>
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
  },
  iconWrapper: {
    backgroundColor: AppColors.royalBlue,
    borderRadius: 60,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: AppColors.midBlue,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: AppColors.white, marginBottom: 12 },
  description: { fontSize: 15, color: AppColors.softBlue, textAlign: 'center' },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.lightBlue,
    marginTop: 6,
    marginBottom: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: AppColors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: AppColors.strongBlue,
    borderRadius: 10,
    height: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonText: { color: AppColors.white, fontSize: 17, fontWeight: 'bold' },
  resendButton: { marginTop: 16, padding: 8 },
  resendText: { color: AppColors.lightBlue, fontSize: 14, textDecorationLine: 'underline' },
});
