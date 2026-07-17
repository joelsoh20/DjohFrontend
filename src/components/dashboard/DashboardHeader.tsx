// En-tête avec greeting et actions
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface DashboardHeaderProps {
  onToggleTheme: () => void;
  onLogout: () => void;
  onSettings?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleTheme,
  onLogout,
  onSettings,
}) => {
  const { t } = useTranslation();
  const { utilisateur } = useAuth();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
      <View style={styles.left}>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>
          {t('dashboard.greeting', { name: utilisateur?.nom || '' })}
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('dashboard.title')}
        </Text>
      </View>

      <View style={styles.actions}>
        <HeaderButton icon={isDark ? 'sunny' : 'moon'} color={theme.text} onPress={onToggleTheme} />
        {onSettings && (
          <HeaderButton icon="settings-outline" color={theme.text} onPress={onSettings} />
        )}
        <HeaderButton icon="log-out-outline" color={theme.danger} onPress={onLogout} />
      </View>
    </View>
  );
};

// Sous-composant bouton
const HeaderButton: React.FC<{ icon: string; color: string; onPress: () => void }> = ({
  icon,
  color,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[headerStyles.button, { backgroundColor: theme.surfaceVariant }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={20} color={color} />
    </TouchableOpacity>
  );
};

const headerStyles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  left: {},
  greeting: { fontSize: 14 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});