// Carte récapitulatif du mois
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { DashboardData } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface ClotureRecapCardProps {
  dashboard: DashboardData;
  moisNom: string;
  annee: number;
}

export const ClotureRecapCard: React.FC<ClotureRecapCardProps> = ({ dashboard, moisNom, annee }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const items = [
    {
      label: t('dashboard.revenue'),
      value: dashboard.mois.chiffreAffaires,
      icon: '📊',
    },
    {
      label: t('dashboard.grossProfit'),
      value: dashboard.mois.beneficeBrut,
      icon: '💰',
    },
    {
      label: t('dashboard.charges'),
      value: dashboard.mois.charges.publicite + dashboard.mois.charges.echantillons,
      icon: '📉',
    },
    {
      label: t('dashboard.netProfit'),
      value: dashboard.mois.beneficeNet,
      icon: '✅',
      highlight: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        📋 Récapitulatif - {moisNom} {annee}
      </Text>

      <View style={styles.grid}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.item,
              { borderBottomColor: theme.divider },
              item.highlight && { backgroundColor: theme.secondaryLight, borderRadius: 10, padding: 10, marginTop: 4 },
              index === items.length - 1 && styles.lastItem,
            ]}
          >
            <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>
              {item.icon} {item.label}
            </Text>
            <Text
              style={[
                styles.itemValue,
                { color: item.highlight ? theme.secondary : theme.text },
                item.highlight && styles.itemValueLarge,
              ]}
            >
              {formatMonnaie(item.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
  grid: {},
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lastItem: { borderBottomWidth: 0 },
  itemLabel: { fontSize: 14 },
  itemValue: { fontSize: 14, fontWeight: '600' },
  itemValueLarge: { fontSize: 18, fontWeight: 'bold' },
});