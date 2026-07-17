import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'document-text-outline', title, message }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={theme.textTertiary} />
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: theme.textTertiary }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  message: { fontSize: 14, marginTop: 8, textAlign: 'center' },
});