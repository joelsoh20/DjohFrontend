import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { formatMonnaie } from '../../utils/formatMonnaie';

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

interface ResumeMensuelCardProps {
  resume: any;
}

export const ResumeMensuelCard: React.FC<ResumeMensuelCardProps> = ({ resume }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);

  if (!resume) return null;

  return (
    <View style={styles.container}>
      {/* Commissions du mois */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>💸 Commissions du mois</Text>
        {resume.commissionsMois?.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textTertiary }]}>Aucune commission ce mois</Text>
        ) : (
          resume.commissionsMois?.map((c: any, i: number) => (
            <View key={i} style={[styles.row, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.name, { color: theme.text }]}>{c.nom}</Text>
              <Text style={[styles.amount, { color: theme.primary }]}>{formatMonnaie(c.montant)}</Text>
            </View>
          ))
        )}
        <View style={[styles.totalRow, { borderTopColor: theme.divider }]}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total à payer</Text>
          <Text style={[styles.totalValue, { color: theme.primary }]}>{formatMonnaie(resume.totalCommissionsMois || 0)}</Text>
        </View>
      </View>

      {/* Total livraison du mois */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>🚚 Frais de livraison du mois</Text>
        <Text style={[styles.bigAmount, { color: theme.warning }]}>{formatMonnaie(resume.totalLivraisonMois || 0)}</Text>
      </View>

      {/* Historique */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.historyHeader} onPress={() => setShowHistory(!showHistory)}>
          <Text style={[styles.title, { color: theme.text }]}>📋 Historique des paiements</Text>
          <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={20} color={theme.text} />
        </TouchableOpacity>
        {showHistory && resume.historiquePaiements?.map((h: any, i: number) => (
          <View key={i} style={[styles.historyItem, { borderBottomColor: theme.divider }]}>
            <Text style={[styles.historyMonth, { color: theme.text }]}>{MOIS[h.mois - 1]} {h.annee}</Text>
            <Text style={[styles.historyAmount, { color: theme.secondary }]}>{formatMonnaie(h.totalCommissions)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 8 },
  card: { padding: 16, borderRadius: 14, marginBottom: 12 },
  title: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  empty: { textAlign: 'center', paddingVertical: 8, fontSize: 13, fontStyle: 'italic' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  name: { fontSize: 14 },
  amount: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTopWidth: 2 },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  bigAmount: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', paddingVertical: 8 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  historyMonth: { fontSize: 14 },
  historyAmount: { fontSize: 14, fontWeight: '600' },
});