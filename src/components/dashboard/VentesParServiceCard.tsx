import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { VenteParService } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface VentesParServiceCardProps {
  jour: VenteParService[];
  hier: VenteParService[];
}

export const VentesParServiceCard: React.FC<VentesParServiceCardProps> = ({ jour, hier }) => {
  const { theme } = useTheme();
  const [ongletHier, setOngletHier] = useState(false);

  const donnees = ongletHier ? hier : jour;
  const total = donnees.reduce((s, v) => s + v.montant, 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🚚 Ventes par service de livraison</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: !ongletHier ? theme.primary : theme.surfaceVariant }]}
          onPress={() => setOngletHier(false)}
        >
          <Text style={{ color: !ongletHier ? '#FFF' : theme.text, fontWeight: '600', fontSize: 13 }}>Aujourd'hui</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: ongletHier ? theme.primary : theme.surfaceVariant }]}
          onPress={() => setOngletHier(true)}
        >
          <Text style={{ color: ongletHier ? '#FFF' : theme.text, fontWeight: '600', fontSize: 13 }}>Hier</Text>
        </TouchableOpacity>
      </View>

      {donnees.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>Aucune vente livrée sur cette période</Text>
      ) : (
        <>
          {donnees.map(v => (
            <View key={v.serviceId} style={[styles.row, { borderBottomColor: theme.divider }]}>
              <View style={styles.rowLeft}>
                <Ionicons name="bicycle-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.serviceName, { color: theme.text }]} numberOfLines={1}>{v.nom}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.montant, { color: theme.text }]}>{formatMonnaie(v.montant)}</Text>
                <Text style={[styles.nombre, { color: theme.textTertiary }]}>{v.nombreCommandes} cmd{v.nombreCommandes > 1 ? 's' : ''}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>{formatMonnaie(total)}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  empty: { textAlign: 'center', paddingVertical: 16, fontSize: 13, fontStyle: 'italic' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  serviceName: { fontSize: 14, flex: 1 },
  montant: { fontSize: 14, fontWeight: '700' },
  nombre: { fontSize: 11, marginTop: 1 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, marginTop: 4,
  },
  totalLabel: { fontSize: 13, fontWeight: '600' },
  totalValue: { fontSize: 15, fontWeight: 'bold' },
});
