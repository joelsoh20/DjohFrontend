import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

interface EmptyValidationProps {
  hasSearchText: boolean;
}

export const EmptyValidation: React.FC<EmptyValidationProps> = ({ hasSearchText }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons
        name={hasSearchText ? 'search-outline' : 'checkmark-done-circle-outline'}
        size={64}
        color={theme.textTertiary}
      />
      <Text style={[styles.title, { color: theme.textSecondary }]}>
        {hasSearchText ? 'Aucun résultat' : t('commande.noPending')}
      </Text>
      <Text style={[styles.message, { color: theme.textTertiary }]}>
        {hasSearchText
          ? 'Essayez un autre terme de recherche.'
          : 'Toutes les commandes ont été traitées.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});