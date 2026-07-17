import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateCourte } from '../../utils/formatDate';
import { EmptyState } from '../EmptyState';

interface CommercialCommandesListProps {
  commandes: any[];
}

export const CommercialCommandesList: React.FC<CommercialCommandesListProps> = ({ commandes = [] }) => {
  const { theme } = useTheme();

  // Regrouper par group_id
  const commandesGroupees = commandes.reduce((acc: any[], cmd: any) => {
    const key = cmd.group_id || `${cmd.client_nom}_${new Date(cmd.date_creation).getTime()}`;
    const existing = acc.find(c => c.key === key);
    if (existing) {
      existing.produits.push(cmd.produit_nom);
      existing.total += cmd.total;
    } else {
      acc.push({
        key,
        client_nom: cmd.client_nom,
        date: cmd.date_creation,
        statut: cmd.statut,
        produits: [cmd.produit_nom],
        total: cmd.total,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Grouper par jour
  const commandesParJour = commandesGroupees.reduce((acc: any[], cmd: any) => {
    const jour = new Date(cmd.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const existing = acc.find(c => c.jour === jour);
    if (existing) {
      existing.commandes.push(cmd);
      existing.totalJour += cmd.total;
    } else {
      acc.push({ jour, commandes: [cmd], totalJour: cmd.total });
    }
    return acc;
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>📝 Mes commandes (7 jours)</Text>

      {commandesParJour.length === 0 ? (
        <EmptyState icon="document-text-outline" title="Aucune commande" message="Vos commandes récentes apparaîtront ici." />
      ) : (
        commandesParJour.map((groupe, index) => (
          <View key={index} style={styles.jourBlock}>
            <View style={[styles.jourHeader, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.jourTitle, { color: theme.primary }]}>📅 {groupe.jour}</Text>
              <Text style={[styles.jourTotal, { color: theme.primary }]}>
                {groupe.commandes.length} cmd • {formatMonnaie(groupe.totalJour)}
              </Text>
            </View>

            {groupe.commandes.map((cmd: any, i: number) => (
              <View key={i} style={[styles.card, { backgroundColor: theme.surfaceVariant }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.client, { color: theme.text }]}>👤 {cmd.client_nom}</Text>
                  <View style={[styles.badge, { backgroundColor: getStatutColor(cmd.statut) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getStatutColor(cmd.statut) }]}>{getStatutLabel(cmd.statut)}</Text>
                  </View>
                </View>
                <Text style={[styles.produitsLabel, { color: theme.textSecondary }]}>Produits :</Text>
                {(cmd.produits || []).map((p: string, j: number) => (
                  <Text key={j} style={[styles.produit, { color: theme.text }]}>  • {p}</Text>
                ))}
                <View style={[styles.separator, { borderColor: theme.divider }]} />
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: theme.text }]}>{formatMonnaie(cmd.total || 0)}</Text>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 8 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  jourBlock: { marginBottom: 20 },
  jourHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 10, marginBottom: 8 },
  jourTitle: { fontSize: 14, fontWeight: '700' },
  jourTotal: { fontSize: 13, fontWeight: '600' },
  card: { padding: 14, borderRadius: 12, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  client: { fontSize: 15, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  separator: { borderTopWidth: 1, marginVertical: 8 },
  produitsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  produit: { fontSize: 13, marginLeft: 4, paddingVertical: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
});