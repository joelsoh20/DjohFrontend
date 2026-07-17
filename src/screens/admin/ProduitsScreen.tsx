import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProduits } from '../../hooks/useProduits';
import { SearchBar } from '../../components/validation/SearchBar';
import { ProduitListItem } from '../../components/produits/ProduitListItem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const ProduitsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const {
    loading, refreshing, error,
    searchText, setSearchText,
    filterActif, setFilterActif,
    produitsFiltres,
    onRefresh, handleToggleActif,
  } = useProduits();

  const { refresh } = useProduits();
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  const filters = [
    { value: 'tous' as const, label: t('common.all') },
    { value: 'actif' as const, label: t('common.active') },
    { value: 'inactif' as const, label: t('common.inactive') },
  ];

  if (loading && produitsFiltres.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder={t('common.search')} />

      <View style={styles.filterRow}>
        {filters.map(f => {
          const isActive = filterActif === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, { backgroundColor: isActive ? theme.primary : theme.surfaceVariant }]}
              onPress={() => setFilterActif(f.value)}
            >
              <Text style={[styles.filterText, { color: isActive ? '#FFF' : theme.textSecondary }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('FormulaireProduit')}
        >
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.addButtonText}>{t('produit.new')}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={produitsFiltres}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProduitListItem
            produit={item}
            onPress={(p) => navigation.navigate('FormulaireProduit', { productId: p.id })}
            onToggleActif={isAdmin ? handleToggleActif : undefined}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Aucun produit trouvé" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={produitsFiltres.length === 0 ? styles.emptyContainer : styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 },
  filterText: { fontSize: 13, fontWeight: '600' },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 16, marginVertical: 10, paddingVertical: 12, borderRadius: 12,
  },
  addButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  listContent: { paddingBottom: 30 },
  emptyContainer: { flexGrow: 1 },
});