// Carte statistiques du commercial
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CommercialStats } from '../../hooks/useCommercialDashboard';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommercialStatsCardProps {
  stats: CommercialStats;
}

export const CommercialStatsCard: React.FC<CommercialStatsCardProps> = ({ stats }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { utilisateur } = useAuth();

  const kpis = [
  {
    icon: 'cart-outline' as const,
    label: 'Produits vendus',
    value: `${stats.produitsVendus || 0}`,
    color: theme.primary,
    bg: theme.primaryLight,
  },
  {
    icon: 'cash-outline' as const,
    label: 'Total ventes',
    value: formatMonnaie(stats.totalVentes || 0),
    color: theme.secondary,
    bg: theme.secondaryLight,
  },
  {
    icon: 'gift-outline' as const,
    label: 'Commission',
    value: formatMonnaie(stats.commissionTotale || 0),
    color: '#FF6B35',
    bg: '#FFF0E6',
  },
  {
    icon: 'checkmark-done-outline' as const,
    label: 'Livrées',
    value: `${stats.commandesLivrees || 0} commandes`,
    color: theme.secondary,
    bg: theme.secondaryLight,
  },
  {
    icon: 'ribbon-outline' as const,
    label: 'Bonus',
    value: stats.bonus > 0 ? `+${formatMonnaie(stats.bonus)} 🎉` : '0 FCFA',
    color: '#FFD700',
    bg: '#FFF8E1',
  },
];
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.secondaryLight }]}>
          <Ionicons name="person" size={24} color={theme.secondary} />
        </View>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {t('dashboard.greeting', { name: utilisateur?.nom || '' })}
          </Text>
          <Text style={[styles.monthLabel, { color: theme.text }]}>
            Récapitulatif du mois
          </Text>
        </View>
      </View>

      {/* KPIs */}
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <View key={index} style={[styles.kpiItem, { backgroundColor: kpi.bg }]}>
            <Ionicons name={kpi.icon} size={20} color={kpi.color} />
            <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
            <Text style={[styles.kpiLabel, { color: kpi.color }]}>{kpi.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16, padding: 18, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#E8EAED',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  greeting: { fontSize: 14 },
  monthLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  kpiItem: {
    width: '47%', padding: 14, borderRadius: 12,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  kpiLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
});