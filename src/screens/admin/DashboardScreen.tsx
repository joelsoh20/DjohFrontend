import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDashboard } from '../../hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';

// Composants
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { PeriodeSelector, Periode } from '../../components/dashboard/PeriodeSelector';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChargesCard } from '../../components/dashboard/ChargesCard';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart';
import { TopProduitsCard } from '../../components/dashboard/TopProduitsCard';
import { RecapPeriodeCard } from '../../components/dashboard/RecapPeriodeCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatMonnaie } from '../../utils/formatMonnaie';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { dashboard, loading, refreshing, error, refresh, onRefresh } = useDashboard();

  const [periodeActive, setPeriodeActive] = useState<Periode>('mois');

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  const getActiveStats = () => {
    if (!dashboard) return { ca: 0, benefice: 0 };
    switch (periodeActive) {
      case 'jour': return { ca: dashboard.jour.chiffreAffaires, benefice: dashboard.jour.beneficeNet };
      case 'semaine': return { ca: dashboard.semaine.chiffreAffaires, benefice: dashboard.semaine.beneficeNet };
      case 'semestre': return { ca: dashboard.semestre.chiffreAffaires, benefice: dashboard.semestre.beneficeNet };
      case 'annee': return { ca: dashboard.annee.chiffreAffaires, benefice: dashboard.annee.beneficeNet };
      default: return { ca: dashboard.mois.chiffreAffaires, benefice: dashboard.mois.beneficeNet };
    }
  };

  if (loading && !dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  if (error && !dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>{t('common.noData')}</Text>
      </View>
    );
  }

  const activeStats = getActiveStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <DashboardHeader onToggleTheme={toggleTheme} onLogout={logout} />

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Sélecteur de période */}
        <PeriodeSelector active={periodeActive} onChange={setPeriodeActive} />

        {/* KPIs CA + Bénéfice */}
        <View style={styles.kpiRow}>
          <KpiCard
            title={t('dashboard.revenue')}
            value={activeStats.ca}
            icon="trending-up"
            backgroundColor={theme.primaryLight}
            iconColor={theme.primary}
          />
          <KpiCard
            title={t('dashboard.netProfit')}
            value={activeStats.benefice}
            icon="wallet"
            backgroundColor={theme.secondaryLight}
            iconColor={theme.secondary}
          />
        </View>

        {/* Ventes d'hier */}
<View style={[styles.hierCard, { backgroundColor: theme.surface }]}>
  <View style={styles.hierRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>Ventes d'hier</Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>
        {formatMonnaie(dashboard.hier?.chiffreAffaires || 0)}
      </Text>
      <Text style={{ fontSize: 12, color: theme.textTertiary }}>
        {dashboard.hier?.nombreCommandes || 0} commande{dashboard.hier?.nombreCommandes > 1 ? 's' : ''}
      </Text>
    </View>
  </View>
</View>

        {/* Bénéfices détaillés (jour, semaine, mois, semestre, année) */}
        <View style={[styles.beneficesCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Bénéfices</Text>
          <View style={styles.beneficesRow}>
            <BeneficeItem label="Jour" value={dashboard.jour.beneficeNet} theme={theme} />
            <BeneficeItem label="Semaine" value={dashboard.semaine.beneficeNet} theme={theme} />
            <BeneficeItem label="Mois" value={dashboard.mois.beneficeNet} theme={theme} />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.beneficesRow}>
            <BeneficeItem label="Semestre" value={dashboard.semestre.beneficeNet} theme={theme} />
            <BeneficeItem label="Année" value={dashboard.annee.beneficeNet} theme={theme} />
            <BeneficeItem label="Hier" value={dashboard.hier?.beneficeNet || 0} theme={theme} />
          </View>
        </View>

        {/* Charges du mois */}
        <ChargesCard totalCharges={dashboard.mois.totalCharges || 0} details={dashboard.mois.detailsCharges || []} />

        {/* Graphique d'évolution */}
        <EvolutionChart data={dashboard.evolutionMensuelle} />

        {/* Top Produits */}
        <TopProduitsCard produits={dashboard.topProduits} />

        {/* Récapitulatif */}
        <RecapPeriodeCard dashboard={dashboard} />
      </ScrollView>
    </View>
  );
};

// Petit composant pour un item bénéfice
const BeneficeItem: React.FC<{ label: string; value: number; theme: any }> = ({ label, value, theme }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 4 }}>{label}</Text>
    <Text style={{ fontSize: 14, fontWeight: '700', color: value >= 0 ? theme.secondary : theme.danger }}>
      {formatMonnaie(value)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  scroll: { flex: 1 },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  beneficesCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  beneficesRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  divider: { height: 1, marginVertical: 4 },
  hierCard: {
  marginHorizontal: 16,
  marginTop: 12,
  padding: 14,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 3,
  elevation: 1,
},
hierRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
});