import React, { useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCommercialDashboard } from '../../hooks/useCommercialDashboard';
import { CommercialStatsCard } from '../../components/commercial/CommercialStatsCard';
import { CommandeItem } from '../../components/commercial/CommandeItem';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const CommercialDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, utilisateur } = useAuth();
  const { stats, loading, refresh } = useCommercialDashboard();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  React.useEffect(() => {
    const interval = setInterval(() => refresh(), 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleModifier = (commande: any) => {
    navigation.navigate('NouvelleCommande', { commandeId: commande.id });
  };

  const commandesEnAttente = useMemo(() => {
    return (stats.dernieresCommandes || []).filter((cmd: any) => cmd.statut === 'recue' || cmd.statut === 'validee');
  }, [stats.dernieresCommandes]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{t('dashboard.greeting', { name: utilisateur?.nom || '' })}</Text>
          <Text style={[styles.title, { color: theme.text }]}>Mon Tableau de Bord</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.surfaceVariant }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.surfaceVariant }]} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <CommercialStatsCard stats={stats} />
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📝 Mes commandes récentes</Text>
          <TouchableOpacity style={[styles.historyBtn, { borderColor: theme.primary }]} onPress={() => navigation.navigate('ListeCommandes')}>
            <Ionicons name="time-outline" size={18} color={theme.primary} />
            <Text style={[styles.historyBtnText, { color: theme.primary }]}>Voir l'historique</Text>
          </TouchableOpacity>
          {commandesEnAttente.length > 0 ? (
            commandesEnAttente.map((cmd: any, idx: number) => (
              <CommandeItem key={cmd.id || idx} commande={cmd} onModifier={handleModifier} theme={theme} />
            ))
          ) : (
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>Aucune commande en attente</Text>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('NouvelleCommande')} activeOpacity={0.8}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1 },
  greeting: { fontSize: 14 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginBottom: 12, borderRadius: 10, borderWidth: 1.5 },
  historyBtnText: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
});