import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

import { auth } from './firebaseConfig';
import { useAuthStore } from './src/store/authStore';
import { AppColors } from './src/presentation/theme/colors';

import AuthScreen from './src/presentation/screens/AuthScreen';
import VerifyEmailScreen from './src/presentation/screens/VerifyEmailScreen';
import BookSelectionScreen from './src/presentation/screens/BookSelectionScreen';

export type RootStackParamList = {
  Auth: undefined;
  VerifyEmail: undefined;
  BookSelection: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const { user, isLoadingAuth, setUser, setLoadingAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (isLoadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.darkBlue }}>
        <ActivityIndicator size="large" color={AppColors.lightBlue} />
      </View>
    );
  }

  function getInitialRoute(): keyof RootStackParamList {
    if (!user) return 'Auth';
    if (!user.emailVerified) return 'VerifyEmail';
    return 'BookSelection';
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerStyle: { backgroundColor: AppColors.royalBlue },
          headerTintColor: AppColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
          cardStyle: { backgroundColor: AppColors.darkBlue },
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verificação de E-mail' }} />
        <Stack.Screen name="BookSelection" component={BookSelectionScreen} options={{ title: 'BankIo', headerLeft: () => null }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
