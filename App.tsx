import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useNotifications } from './src/hooks/useNotifications';
import { initI18n } from './src/i18n';
import './src/i18n';

const AppContent: React.FC = () => {
  const [i18nReady, setI18nReady] = useState(false);
  const { isDark, theme } = useTheme();

  useEffect(() => {
    const charger = async () => {
      await initI18n();
      setI18nReady(true);
    };
    charger();
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

const AppWithNotifications: React.FC = () => {
  useNotifications();
  return <AppContent />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppWithNotifications />
      </AuthProvider>
    </ThemeProvider>
  );
}