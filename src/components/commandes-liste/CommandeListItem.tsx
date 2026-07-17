//  Une ligne de commande
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Commande, StatutCommande } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateCourte } from '../../utils/formatDate';

interface CommandeListItemProps {
  commande: Commande;
  onPress: (commande: Commande) => void;
}

export const CommandeListItem: React.FC<CommandeListItemProps> = ({ commande, onPress }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const getStatutConfig = (statut: StatutCommande) => {
    switch (statut) {
      case 'recue':
        return { label: t('commande.statutRecue'), color: theme.statusRecue, bg: theme.warningLight };
      case 'livree_payee':
        return { label: t('commande.statutLivree'), color: theme.statusLivree, bg: theme.secondaryLight };
      case 'annulee':
        return { label: t('commande.statutAnnulee'), color: theme.statusAnnulee, bg: theme.dangerLight };
    }
  };

  const statutConfig = getStatutConfig(commande.statut);
  const montantTotal = (commande.prix_unitaire_reel || 0) * (commande.quantite || 1);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface }]}
      onPress={() => onPress(commande)}
      activeOpacity={0.7}
    >
      {/* Ligne 1 : ID + Statut */}
      <View style={styles.row1}>
        <View style={styles.idRow}>
          <Text style={[styles.id, { color: theme.primary }]}>
            #{commande.id.substring(0, 8)}
          </Text>
          <Text style={[styles.date, { color: theme.textTertiary }]}>
            {formatDateCourte(commande.date_creation)}
          </Text>
        </View>
        <View style={[styles.statutBadge, { backgroundColor: statutConfig.bg }]}>
          <View style={[styles.statutDot, { backgroundColor: statutConfig.color }]} />
          <Text style={[styles.statutText, { color: statutConfig.color }]}>
            {statutConfig.label}
          </Text>
        </View>
      </View>

      {/* Ligne 2 : Client + Montant */}
      <View style={styles.row2}>
        <View style={styles.clientRow}>
          <Ionicons name="person-outline" size={14} color={theme.textTertiary} />
          <Text style={[styles.clientName, { color: theme.text }]} numberOfLines={1}>
            {commande.client_nom}
          </Text>
        </View>
        <Text style={[styles.montant, { color: theme.text }]}>
          {formatMonnaie(montantTotal)}
        </Text>
      </View>

      {/* Ligne 3 : Produit + Livreur */}
      <View style={styles.row3}>
        <View style={styles.produitRow}>
          <Ionicons name="cube-outline" size={14} color={theme.textTertiary} />
          <Text style={[styles.produitText, { color: theme.textSecondary }]} numberOfLines={1}>
            {commande.produit?.nom || '-'} x{commande.quantite}
          </Text>
        </View>
        {commande.livreur?.nom && (
          <View style={styles.livreurRow}>
            <Ionicons name="bicycle-outline" size={14} color={theme.textTertiary} />
            <Text style={[styles.livreurText, { color: theme.textSecondary }]} numberOfLines={1}>
              {commande.livreur.nom}
            </Text>
          </View>
        )}
      </View>

      {/* Ligne 4 : Commercial */}
      <View style={styles.row4}>
        <Ionicons name="person-circle-outline" size={14} color={theme.textTertiary} />
        <Text style={[styles.commercialText, { color: theme.textTertiary }]}>
          {commande.commercial?.nom || '-'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  id: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 11,
  },
  statutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  montant: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  row3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  produitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  produitText: {
    fontSize: 13,
    flex: 1,
  },
  livreurRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  livreurText: {
    fontSize: 13,
  },
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commercialText: {
    fontSize: 12,
  },
});