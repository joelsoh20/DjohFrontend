// Carte KPI (CA, Bénéfice)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface KpiCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  subtitle?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  backgroundColor,
  iconColor,
  subtitle,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Ionicons name={icon} size={24} color={iconColor} style={styles.icon} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{formatMonnaie(value)}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  icon: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
  },
});