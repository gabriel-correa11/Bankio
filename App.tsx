import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

import { auth } from './firebaseConfig';
import { useAuthStore } from './src/store/authStore';
import { AppColors } from './src/presentation/theme/colors';
import { QuizSessionResult } from './src/core/models/quiz';

import AuthScreen from './src/presentation/screens/AuthScreen';
import VerifyEmailScreen from './src/presentation/screens/VerifyEmailScreen';
import HomeScreen from './src/presentation/screens/HomeScreen';
import CategoryScreen from './src/presentation/screens/CategoryScreen';
import QuizScreen from './src/presentation/screens/QuizScreen';
import ResultsScreen from './src/presentation/screens/ResultsScreen';
import LeaderboardScreen from './src/presentation/screens/LeaderboardScreen';

export type RootStackParamList = {
  Auth: undefined;
  VerifyEmail: undefined;
  Home: undefined;
  Category: undefined;
  Quiz: undefined;
  Results: { result: QuizSessionResult };
  Leaderboard: undefined;
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

  const initialRouteName = !user ? 'Auth' : !user.emailVerified ? 'VerifyEmail' : 'Home';

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: AppColors.royalBlue },
          headerTintColor: AppColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
          cardStyle: { backgroundColor: AppColors.darkBlue },
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verificação de E-mail' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Category" component={CategoryScreen} options={{ title: 'Categorias' }} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Resultado', headerLeft: () => null }} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Ranking Global' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
