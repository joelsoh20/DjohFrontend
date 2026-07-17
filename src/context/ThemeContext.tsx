import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME } from '../utils/constants';
import { ThemeMode } from '../types';

type ThemeColors = typeof LIGHT_THEME;

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('clair');

  useEffect(() => {
    const chargerTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('themeMode');
        if (stored === 'clair' || stored === 'sombre') {
          setThemeMode(stored);
        } else {
          // Utiliser le thème système par défaut
          setThemeMode(systemColorScheme === 'dark' ? 'sombre' : 'clair');
        }
      } catch {
        setThemeMode('clair');
      }
    };
    chargerTheme();
  }, []);

  const handleSetThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'clair' ? 'sombre' : 'clair';
    await handleSetThemeMode(newMode);
  };

  const theme = themeMode === 'sombre' ? DARK_THEME : LIGHT_THEME;
  const isDark = themeMode === 'sombre';

  return (
    <ThemeContext.Provider value={{ theme, themeMode, isDark, toggleTheme, setThemeMode: handleSetThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider');
  }
  return context;
};