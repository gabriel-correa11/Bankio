import { useState } from 'react';
import { Alert } from 'react-native';
import { signIn, signUp, sendPasswordReset } from '../../core/services/authService';

type AuthMode = 'login' | 'register';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'Nenhuma conta encontrada com esse e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
};

function firebaseError(code: string): string {
  return FIREBASE_ERRORS[code] ?? 'Ocorreu um erro. Tente novamente.';
}

export function useAuthForm() {
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
      if (!name.trim()) { Alert.alert('Atenção', 'Preencha seu nome.'); return; }
      if (password !== confirmPassword) { Alert.alert('Atenção', 'As senhas não coincidem.'); return; }
      if (password.length < 6) { Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.'); return; }
    }
    setIsLoading(true);
    try {
      isLogin
        ? await signIn(emailTrimmed, password)
        : await signUp(emailTrimmed, password, name.trim());
    } catch (error: any) {
      Alert.alert('Erro', firebaseError(error.code));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordReset() {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) { Alert.alert('Atenção', 'Digite seu e-mail primeiro.'); return; }
    setIsLoading(true);
    try {
      await sendPasswordReset(emailTrimmed);
      Alert.alert('Enviado!', 'Verifique sua caixa de entrada para redefinir a senha.');
    } catch (error: any) {
      Alert.alert('Erro', firebaseError(error.code));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLogin,
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    isLoading,
    toggleMode,
    handleSubmit,
    handlePasswordReset,
  };
}
