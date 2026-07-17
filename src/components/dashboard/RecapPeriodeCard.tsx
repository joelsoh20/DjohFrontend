// Récapitulatif des périodesimport React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { DashboardData } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface RecapPeriodeCardProps {
  dashboard: DashboardData;
}

export const RecapPeriodeCard: React.FC<RecapPeriodeCardProps> = ({ dashboard }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const items = [
    { label: t('dashboard.today'), value: dashboard.jour.chiffreAffaires },
    { label: t('dashboard.week'), value: dashboard.semaine.chiffreAffaires },
    { label: t('dashboard.semester'), value: dashboard.semestre.chiffreAffaires },
    { label: t('dashboard.year'), value: dashboard.annee.chiffreAffaires },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        📋 {t('dashboard.summary')}
      </Text>

      {items.map((item, index) => (
        <View key={index}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatMonnaie(item.value)}
            </Text>
          </View>
          {index < items.length - 1 && (
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  divider: {
    height: 1,
  },
});