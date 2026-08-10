// Une ligne produit
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Produit } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface ProduitListItemProps {
  produit: Produit;
  onPress: (produit: Produit) => void;
  onToggleActif?: (id: string, nom: string, actif: boolean) => void;
  onSupprimer?: (id: string, nom: string) => void;
}

export const ProduitListItem: React.FC<ProduitListItemProps> = ({ produit, onPress, onToggleActif, onSupprimer }) => {
  const { theme } = useTheme();

  const marge = produit.prix_catalogue && produit.cout_revient
    ? produit.prix_catalogue - produit.cout_revient
    : 0;
  const margePourcent = produit.prix_catalogue && produit.prix_catalogue > 0
    ? Math.round((marge / produit.prix_catalogue) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={() => onPress(produit)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: produit.actif ? theme.primaryLight : theme.dangerLight }]}>
          <Ionicons
            name="cube"
            size={22}
            color={produit.actif ? theme.primary : theme.textTertiary}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {produit.nom}
            </Text>
            {!produit.actif && (
              <View style={[styles.inactifBadge, { backgroundColor: theme.dangerLight }]}>
                <Text style={[styles.inactifText, { color: theme.danger }]}>Inactif</Text>
              </View>
            )}
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              {formatMonnaie(produit.prix_catalogue)}
            </Text>
            {produit.cout_revient > 0 && (
              <>
                <Text style={[styles.separator, { color: theme.textTertiary }]}>•</Text>
                <Text style={[styles.cost, { color: theme.textSecondary }]}>
                  Revient: {formatMonnaie(produit.cout_revient)}
                </Text>
              </>
            )}
          </View>
          {marge > 0 && (
            <Text style={[styles.marge, { color: theme.secondary }]}>
              Marge: {formatMonnaie(marge)} ({margePourcent}%)
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onToggleActif && (
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: produit.actif ? theme.dangerLight : theme.secondaryLight }]}
            onPress={() => onToggleActif(produit.id, produit.nom, produit.actif)}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            <Ionicons
              name={produit.actif ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={produit.actif ? theme.danger : theme.secondary}
            />
          </TouchableOpacity>
        )}

        {onSupprimer && (
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: theme.dangerLight }]}
            onPress={() => onSupprimer(produit.id, produit.nom)}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconContainer: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', flex: 1 },
  inactifBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  inactifText: { fontSize: 10, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price: { fontSize: 15, fontWeight: 'bold' },
  separator: { fontSize: 12 },
  cost: { fontSize: 13 },
  marge: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  toggleButton: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
});