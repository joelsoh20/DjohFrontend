// Barre de filtres (statut, date)
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { StatutCommande } from '../../types';

interface CommandesFilterBarProps {
  statutActif: StatutCommande | 'tous';
  onStatutChange: (statut: StatutCommande | 'tous') => void;
  total: number;
}

interface FilterOption {
  value: StatutCommande | 'tous';
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const CommandesFilterBar: React.FC<CommandesFilterBarProps> = ({
  statutActif,
  onStatutChange,
  total,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const filters: FilterOption[] = [
    { value: 'tous', labelKey: 'common.all', icon: 'layers', color: theme.primary },
    { value: 'recue', labelKey: 'commande.statutRecue', icon: 'time', color: theme.warning },
    { value: 'validee', labelKey: 'commande.statutValidee', icon: 'checkmark-circle-outline', color: theme.warning },
    { value: 'livree_payee', labelKey: 'commande.statutLivree', icon: 'checkmark-circle', color: theme.secondary },
    { value: 'annulee', labelKey: 'commande.statutAnnulee', icon: 'close-circle', color: theme.danger },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map(filter => {
          const isActive = statutActif === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? filter.color + '20' : theme.surfaceVariant,
                  borderColor: isActive ? filter.color : 'transparent',
                },
              ]}
              onPress={() => onStatutChange(filter.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={isActive ? filter.color : theme.textSecondary}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? filter.color : theme.textSecondary },
                ]}
              >
                {t(filter.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={[styles.count, { color: theme.textTertiary }]}>
        {total} commande{total > 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});