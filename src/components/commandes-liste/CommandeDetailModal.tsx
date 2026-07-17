// Modal détail d'une commande
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Commande, StatutCommande } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateComplete, formatDateCourte } from '../../utils/formatDate';

interface CommandeDetailModalProps {
  commande: Commande | null;
  visible: boolean;
  onClose: () => void;
}

export const CommandeDetailModal: React.FC<CommandeDetailModalProps> = ({
  commande,
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (!commande) return null;

  const getStatutLabel = (statut: StatutCommande) => {
    switch (statut) {
      case 'recue': return t('commande.statutRecue');
      case 'livree_payee': return t('commande.statutLivree');
      case 'annulee': return t('commande.statutAnnulee');
    }
  };

  const getStatutColor = (statut: StatutCommande) => {
    switch (statut) {
      case 'recue': return theme.warning;
      case 'livree_payee': return theme.secondary;
      case 'annulee': return theme.danger;
    }
  };

  const montantTotal = (commande.prix_unitaire_reel || 0) * (commande.quantite || 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          style={[styles.content, { backgroundColor: theme.surface }]}
          activeOpacity={1}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <View>
              <Text style={[styles.headerId, { color: theme.primary }]}>
                #{commande.id.substring(0, 8)}
              </Text>
              <Text style={[styles.headerDate, { color: theme.textTertiary }]}>
                {formatDateComplete(commande.date_creation)}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.statutBadge, { backgroundColor: getStatutColor(commande.statut) + '20' }]}>
                <Text style={[styles.statutText, { color: getStatutColor(commande.statut) }]}>
                  {getStatutLabel(commande.statut)}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Section Client */}
            <DetailSection title={t('commande.client')} icon="person" theme={theme}>
              <DetailRow label={t('commande.clientName')} value={commande.client_nom} theme={theme} />
              {commande.client_telephone && (
                <DetailRow label={t('commande.clientPhone')} value={commande.client_telephone} theme={theme} />
              )}
              {commande.client_quartier && (
                <DetailRow label={t('commande.clientQuartier')} value={commande.client_quartier} theme={theme} />
              )}
            </DetailSection>

            {/* Section Produit */}
            <DetailSection title={t('commande.product')} icon="cube" theme={theme}>
              <DetailRow label="Produit" value={commande.produit?.nom || '-'} theme={theme} />
              <DetailRow label={t('commande.quantity')} value={String(commande.quantite || 1)} theme={theme} />
              <DetailRow
                label={t('commande.unitPrice')}
                value={formatMonnaie(commande.prix_unitaire_reel || 0)}
                theme={theme}
              />
              <DetailRow
                label={t('commande.total')}
                value={formatMonnaie(montantTotal)}
                bold
                theme={theme}
              />
            </DetailSection>

            {/* Section Livraison */}
            <DetailSection title={t('commande.deliverer')} icon="bicycle" theme={theme}>
              <DetailRow label="Livreur" value={commande.livreur?.nom || 'Non assigné'} theme={theme} />
              <DetailRow
                label={t('commande.deliveryFees')}
                value={formatMonnaie(commande.frais_livraison || 0)}
                theme={theme}
              />
            </DetailSection>

            {/* Section Commercial */}
            <DetailSection title={t('commande.commercial')} icon="person-circle" theme={theme}>
              <DetailRow label="Nom" value={commande.commercial?.nom || '-'} theme={theme} />
              <DetailRow
                label={t('commande.commission')}
                value={formatMonnaie(commande.commission_commercial || 0)}
                theme={theme}
              />
            </DetailSection>

            {/* Dates */}
            {commande.date_statut_livree && (
              <DetailSection title="Dates" icon="calendar" theme={theme}>
                <DetailRow label="Livrée le" value={formatDateComplete(commande.date_statut_livree)} theme={theme} />
              </DetailSection>
            )}

            {commande.cloture_id && (
              <View style={[styles.clotureBadge, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="lock-closed" size={14} color={theme.primary} />
                <Text style={[styles.clotureText, { color: theme.primary }]}>
                  Commande clôturée
                </Text>
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Sous-composants
const DetailSection: React.FC<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
  children: React.ReactNode;
}> = ({ title, icon, theme, children }) => (
  <View style={detailStyles.section}>
    <View style={detailStyles.sectionHeader}>
      <Ionicons name={icon} size={18} color={theme.primary} />
      <Text style={[detailStyles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const DetailRow: React.FC<{
  label: string;
  value: string;
  bold?: boolean;
  theme: any;
}> = ({ label, value, bold = false, theme }) => (
  <View style={detailStyles.row}>
    <Text style={[detailStyles.label, { color: theme.textSecondary }]}>{label}</Text>
    <Text
      style={[
        detailStyles.value,
        { color: theme.text },
        bold && detailStyles.bold,
      ]}
    >
      {value}
    </Text>
  </View>
);

const detailStyles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerId: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerDate: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  clotureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  clotureText: {
    fontSize: 13,
    fontWeight: '600',
  },
});