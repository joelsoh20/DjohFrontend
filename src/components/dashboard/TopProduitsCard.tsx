import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { TopProduit } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface TopProduitsCardProps {
  produits: TopProduit[];
}

export const TopProduitsCard: React.FC<TopProduitsCardProps> = ({ produits }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showAll, setShowAll] = useState(false);

  const displayedProduits = showAll ? produits : produits.slice(0, 5);

  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return theme.textSecondary;
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>🏆 {t('dashboard.topProducts')}</Text>

      {produits.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>{t('common.noData')}</Text>
      ) : (
        <>
          {displayedProduits.map((produit, index) => (
            <View key={produit.id}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Text style={[styles.rank, { color: getRankColor(index) }]}>#{index + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{produit.nom}</Text>
                    <Text style={[styles.count, { color: theme.textTertiary }]}>
                      {produit.nombre || 0} vente{(produit.nombre || 0) > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.ca, { color: theme.secondary }]}>{formatMonnaie(produit.chiffreAffaires)}</Text>
              </View>
              {index < displayedProduits.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
            </View>
          ))}

          {produits.length > 5 && (
            <TouchableOpacity style={styles.voirPlus} onPress={() => setShowAll(!showAll)}>
              <Text style={[styles.voirPlusText, { color: theme.primary }]}>
                {showAll ? 'Voir moins' : `Voir les ${produits.length} produits`}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  empty: { textAlign: 'center', paddingVertical: 20, fontSize: 14 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rank: { fontSize: 14, fontWeight: 'bold', width: 28 },
  name: { fontSize: 14, flex: 1 },
  count: { fontSize: 11, marginTop: 2 },
  ca: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1 },
  voirPlus: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  voirPlusText: { fontSize: 13, fontWeight: '600' },
});