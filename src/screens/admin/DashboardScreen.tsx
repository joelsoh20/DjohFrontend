import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDashboard } from '../../hooks/useDashboard';

// Composants
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { PeriodeSelector, Periode } from '../../components/dashboard/PeriodeSelector';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChargesCard } from '../../components/dashboard/ChargesCard';
import { EvolutionChart } from '../../components/dashboard/EvolutionChart';
import { TopProduitsCard } from '../../components/dashboard/TopProduitsCard';
import { RecapPeriodeCard } from '../../components/dashboard/RecapPeriodeCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { dashboard, loading, refreshing, error, refresh, onRefresh } = useDashboard();

  const [periodeActive, setPeriodeActive] = useState<Periode>('mois');

  // Rafraîchir au focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  // Obtenir les stats selon la période active
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

  // ====== ÉTATS ======

  // Chargement initial
  if (loading && !dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  // Erreur
  if (error && !dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      </View>
    );
  }

  // Pas de données
  if (!dashboard) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          {t('common.noData')}
        </Text>
      </View>
    );
  }

  // ====== RENDU PRINCIPAL ======
  const activeStats = getActiveStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <DashboardHeader
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />

      {/* Contenu scrollable */}
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Sélecteur de période */}
        <PeriodeSelector active={periodeActive} onChange={setPeriodeActive} />

        {/* KPIs */}
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

        {/* Charges du mois */}
        <ChargesCard totalCharges={dashboard.mois.totalCharges || 0} />

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scroll: { flex: 1 },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
});