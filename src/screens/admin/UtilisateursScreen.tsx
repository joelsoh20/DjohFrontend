import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUtilisateurs } from '../../hooks/useUtilisateurs';
import { SearchBar } from '../../components/validation/SearchBar';
import { UtilisateurListItem } from '../../components/utilisateurs/UtilisateurListItem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Role } from '../../types';

export const UtilisateursScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const {
    loading, refreshing, error,
    searchText, setSearchText,
    roleFilter, setRoleFilter,
    utilisateursFiltres,
    onRefresh, handleToggleActif,
    refresh,
  } = useUtilisateurs();

  // Avant : useUtilisateurs() était rappelé ici juste pour "refresh", ce
  // qui créait une seconde instance d'état séparée de celle affichée —
  // le rafraîchissement au focus de l'écran (après ajout/édition d'un
  // utilisateur) n'avait donc aucun effet visible.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  const roleFilters: { label: string; value: Role | 'tous' }[] = [
    { label: t('common.all'), value: 'tous' },
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Commercial', value: 'commercial' },
  ];

  if (loading && utilisateursFiltres.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar value={searchText} onChangeText={setSearchText} placeholder={t('common.search')} />

      <View style={styles.roleFilters}>
        {roleFilters.map(filter => {
          const isActive = roleFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.roleChip, { backgroundColor: isActive ? theme.primary : theme.surfaceVariant, borderColor: isActive ? theme.primary : theme.border }]}
              onPress={() => setRoleFilter(filter.value)}
            >
              <Text style={[styles.roleChipText, { color: isActive ? '#FFF' : theme.textSecondary }]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isAdmin && (
  <TouchableOpacity
    style={[styles.addButton, { backgroundColor: theme.primary }]}
    onPress={() => navigation.navigate('FormulaireUtilisateur')}
  >
    <Ionicons name="person-add" size={22} color="#FFF" />
    <Text style={styles.addButtonText}>{t('utilisateur.new')}</Text>
  </TouchableOpacity>
)}

{/* Stock et Services visibles par Admin et Manager */}
<TouchableOpacity
  style={[styles.addButton, { backgroundColor: theme.secondary }]}
  onPress={() => navigation.navigate('Stock')}
>
  <Ionicons name="cube" size={22} color="#FFF" />
  <Text style={styles.addButtonText}>Gestion du Stock</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.addButton, { backgroundColor: '#FF6B35' }]}
  onPress={() => navigation.navigate('ServicesLivraison')}
>
  <Ionicons name="bicycle" size={22} color="#FFF" />
  <Text style={styles.addButtonText}>Services de livraison</Text>
</TouchableOpacity>

      <FlatList
        data={utilisateursFiltres}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UtilisateurListItem
            utilisateur={item}
            onPress={(user) => navigation.navigate('FormulaireUtilisateur', { userId: user.id })}
            onToggleActif={handleToggleActif}
            isAdmin={isAdmin}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Aucun utilisateur trouvé" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={utilisateursFiltres.length === 0 ? styles.emptyContainer : styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  roleFilters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1 },
  roleChipText: { fontSize: 13, fontWeight: '600' },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 16, marginVertical: 6, paddingVertical: 12, borderRadius: 12,
  },
  addButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  listContent: { paddingBottom: 30 },
  emptyContainer: { flexGrow: 1 },
});