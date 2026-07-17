// Sélecteur jour/semaine/mois/semestre/année
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export type Periode = 'jour' | 'semaine' | 'mois' | 'semestre' | 'annee';

interface PeriodeSelectorProps {
  active: Periode;
  onChange: (periode: Periode) => void;
}

const PERIODES: Periode[] = ['jour', 'semaine', 'mois', 'semestre', 'annee'];

export const PeriodeSelector: React.FC<PeriodeSelectorProps> = ({ active, onChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {PERIODES.map(periode => {
        const isActive = active === periode;
        return (
          <TouchableOpacity
            key={periode}
            style={[
              styles.button,
              {
                backgroundColor: isActive ? theme.primary : theme.surface,
                borderColor: isActive ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onChange(periode)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                { color: isActive ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {t(`dashboard.${periode}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});