import React, { useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useListeCommandes } from '../../hooks/useListeCommandes';
import { SearchBar } from '../../components/validation/SearchBar';
import { CommandesFilterBar } from '../../components/commandes-liste/CommandesFilterBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateCourte } from '../../utils/formatDate';

export const ListeCommandesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    loading, refreshing, filters, setStatut, setSearchText,
    commandesFiltrees, onRefresh, loadMore,
  } = useListeCommandes();

  const { refresh } = useListeCommandes();
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  // Grouper par group_id
  const commandesGroupees = useMemo(() => {
    const groupeMap = new Map<string, any>();
    for (const cmd of commandesFiltrees) {
      const key = (cmd as any).group_id || cmd.id;
      if (!groupeMap.has(key)) {
  groupeMap.set(key, {
    id: key,
    client_nom: cmd.client_nom,
    client_telephone: cmd.client_telephone,
    client_quartier: cmd.client_quartier,
    date_creation: cmd.date_creation,
    statut: cmd.statut,
    commercial_nom: (cmd as any).commercial?.nom || 'Inconnu',
    produits: [],
    total: 0,
  });
}
      const groupe = groupeMap.get(key);
      groupe.total += Number(cmd.prix_unitaire_reel) * cmd.quantite;
      groupe.produits.push({
        nom: (cmd as any).produit?.nom || 'Inconnu',
        quantite: cmd.quantite,
        prix: Number(cmd.prix_unitaire_reel),
      });
    }
    return Array.from(groupeMap.values())
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, [commandesFiltrees]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'recue': return theme.warning;
      case 'livree_payee': return theme.secondary;
      case 'annulee': return theme.danger;
      default: return theme.textTertiary;
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'recue': return 'En attente';
      case 'livree_payee': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };
  

  if (loading && commandesFiltrees.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={filters.searchText} onChangeText={setSearchText} />
      <CommandesFilterBar statutActif={filters.statut} onStatutChange={setStatut} total={commandesGroupees.length} />

      <FlatList
        data={commandesGroupees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.clientName, { color: theme.text }]}>👤 {item.client_nom}</Text>
                <Text style={[styles.info, { color: theme.textTertiary }]}>📱 {item.client_telephone || 'N/A'} • 📍 {item.client_quartier || 'N/A'}</Text>
                <Text style={[styles.info, { color: theme.textTertiary }]}>{formatDateCourte(item.date_creation)}</Text>
                <Text style={[styles.info, { color: theme.textTertiary }]}>👩‍💼 {item.commercial_nom}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatutColor(item.statut) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatutColor(item.statut) }]}>{getStatutLabel(item.statut)}</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>📦 Produits :</Text>
            {item.produits.map((p: any, i: number) => (
              <Text key={i} style={[styles.produit, { color: theme.text }]}>• {p.nom} x{p.quantite}</Text>
            ))}
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
              <Text style={[styles.totalValue, { color: theme.text }]}>{formatMonnaie(item.total)}</Text>
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="Aucune commande" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={commandesGroupees.length === 0 ? styles.emptyContainer : styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1 },
  card: { padding: 16, borderRadius: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  clientName: { fontSize: 16, fontWeight: 'bold' },
  info: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  produit: { fontSize: 13, paddingVertical: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
});