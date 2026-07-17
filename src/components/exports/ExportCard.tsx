// Carte d'export
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { LoadingSpinner } from '../LoadingSpinner';

interface ExportCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  format: string;
  loading: boolean;
  onPress: () => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({
  icon, title, description, format, loading, onPress,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
        <Ionicons name={icon} size={28} color={theme.primary} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        <View style={styles.formatRow}>
          <Ionicons name="document-outline" size={14} color={theme.textTertiary} />
          <Text style={[styles.format, { color: theme.textTertiary }]}>
            {t('export.format')} : {format}
          </Text>
        </View>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <View style={[styles.exportIcon, { backgroundColor: theme.secondaryLight }]}>
          <Ionicons name="download-outline" size={22} color={theme.secondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, marginHorizontal: 16, marginTop: 12,
    borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 2, elevation: 1,
  },
  iconContainer: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: 14 },
  title: { fontSize: 15, fontWeight: 'bold' },
  description: { fontSize: 13, marginTop: 2 },
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  format: { fontSize: 12 },
  exportIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});