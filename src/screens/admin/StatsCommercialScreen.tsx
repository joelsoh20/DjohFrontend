import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { statsService } from '../../services/statsService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { useAuth } from '../../context/AuthContext';


export const StatsCommercialScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const { commercialId, nom } = route.params;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mois' | 'precedent' | '6mois'>('mois');

  useEffect(() => {
    statsService.getStatsCommercial(commercialId).then(res => {
      if (res.success) setStats(res.data);
      setLoading(false);
    });
  }, []);

  const { isAdmin, utilisateur } = useAuth();

  const isManager = utilisateur?.role === 'manager';
const canEdit = isAdmin || isManager;
  if (loading) return <LoadingSpinner fullScreen />;

  const data = tab === 'mois' ? stats?.mois : tab === 'precedent' ? stats?.moisPrecedent : stats?.sixMois;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Ionicons name="person-circle" size={40} color={theme.primary} />
        <Text style={[styles.name, { color: theme.text }]}>{nom}</Text>
      </View>

      <View style={styles.tabs}>
        {(['mois', 'precedent', '6mois'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, { color: tab === t ? theme.primary : theme.textTertiary }]}>
              {t === 'mois' ? 'Ce mois' : t === 'precedent' ? 'Mois passé' : '6 mois'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.kpiGrid}>
        <KpiBox label="Commandes" value={data?.nb_commandes || 0} color={theme.primary} theme={theme} />
        <KpiBox label="Commissions" value={formatMonnaie(data?.total_commissions || 0)} color={theme.secondary} theme={theme} />
        <KpiBox label="Ventes" value={formatMonnaie(data?.total_ventes || 0)} color="#FF6B35" theme={theme} />
        <KpiBox label="Produits" value={data?.produits_vendus || 0} color="#7C4DFF" theme={theme} />
      </View>

      {tab === 'mois' && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailText, { color: theme.warning }]}>⏳ En attente : {data?.en_attente || 0}</Text>
          <Text style={[styles.detailText, { color: theme.danger }]}>❌ Annulées : {data?.annulees || 0}</Text>
        </View>
      )}

      {/* Évolution */}
      {stats?.evolution && (
        <View style={[styles.evolutionCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.evolutionTitle, { color: theme.text }]}>📈 Évolution sur 6 mois</Text>
          {stats.evolution.map((e: any, i: number) => (
            <View key={i} style={[styles.evoRow, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.evoMois, { color: theme.textSecondary }]}>{e.mois}</Text>
              <Text style={[styles.evoVal, { color: theme.text }]}>{e.nb_commandes || 0} cmd</Text>
              <Text style={[styles.evoVal, { color: theme.primary }]}>{formatMonnaie(e.total_commissions || 0)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const KpiBox: React.FC<{ label: string; value: string | number; color: string; theme: any }> = ({ label, value, color, theme }) => (
  <View style={[kpiStyles.box, { backgroundColor: theme.surface }]}>
    <Text style={[kpiStyles.value, { color }]}>{value}</Text>
    <Text style={[kpiStyles.label, { color: theme.textSecondary }]}>{label}</Text>
  </View>
);

const kpiStyles = StyleSheet.create({
  box: { width: '47%', padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  value: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 20, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1A73E8' },
  tabText: { fontSize: 14, fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 12 },
  detailText: { fontSize: 14, fontWeight: '600' },
  evolutionCard: { margin: 16, padding: 16, borderRadius: 14 },
  evolutionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  evoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  evoMois: { fontSize: 13, width: 80 },
  evoVal: { fontSize: 13, fontWeight: '600' },
});