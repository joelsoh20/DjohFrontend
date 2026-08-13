// Navigation principale
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AuthNavigator } from './AuthNavigator';
import { AdminNavigator } from './AdminNavigator';
import { CommercialNavigator } from './CommercialNavigator';
import { ProfilParametresScreen } from '../screens/ProfilParametresScreen';
import { navigationRef } from './navigationRef';

export type RootStackParamList = {
  Main: undefined;
  ProfilParametres: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isAdmin, isManager } = useAuth();
  const { theme } = useTheme();

  // Écran de chargement pendant la vérification du token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Main" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => (isAdmin || isManager) ? <AdminNavigator /> : <CommercialNavigator />}
            </Stack.Screen>
            <Stack.Screen 
              name="ProfilParametres" 
              component={ProfilParametresScreen}
              options={{ 
                headerShown: true,
                headerTitle: 'Profil & Paramètres',
                presentation: 'modal',
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};