import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppColors } from '../theme/colors';
import { useAuthForm } from '../hooks/useAuthForm';
import { styles } from './AuthScreen.styles';

export default function AuthScreen() {
  const {
    isLogin, name, setName, email, setEmail,
    password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, isLoading,
    toggleMode, handleSubmit, handlePasswordReset,
  } = useAuthForm();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <MaterialIcons name="auto-stories" size={64} color={AppColors.lightBlue} />
          <Text style={styles.title}>BankIo</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Acesse sua conta' : 'Crie sua conta'}</Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={AppColors.muted} value={name} onChangeText={setName} autoCapitalize="words" />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={AppColors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
            <TextInput style={[styles.input, styles.inputFlex]} placeholder="Senha" placeholderTextColor={AppColors.muted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={AppColors.lightBlue} />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color={AppColors.lightBlue} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Confirmar Senha" placeholderTextColor={AppColors.muted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
            </View>
          )}

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
            {isLoading
              ? <ActivityIndicator color={AppColors.white} />
              : <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
            }
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={handlePasswordReset} style={styles.linkButton} disabled={isLoading}>
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{isLogin ? 'Não tem conta? ' : 'Já tem conta? '}</Text>
            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
              <Text style={styles.toggleAction}>{isLogin ? 'Cadastre-se' : 'Entrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
