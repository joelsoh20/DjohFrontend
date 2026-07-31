import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateHeure } from '../../utils/formatDate';

interface CommandeValidationCardProps {
  item: any;
  theme: any;
  estTraitee: boolean;
  onValidee: (item: any) => void;
  onAnnulerGroupe: (item: any) => void;
  onOpenValidation: (item: any) => void;
  onShowComments: (id: string) => void;
}

export const CommandeValidationCard: React.FC<CommandeValidationCardProps> = ({
  item, theme, estTraitee, onValidee, onAnnulerGroupe, onOpenValidation, onShowComments
}) => {
  const [dernierCommentaire, setDernierCommentaire] = useState<any>(null);

  useEffect(() => {
    if (!item.firstId) return;
    api.get(`/order-comments/${item.firstId}`)
      .then(res => {
        if (res.data?.success) {
          const data = res.data.data || [];
          if (data.length > 0) setDernierCommentaire(data[data.length - 1]);
        }
      })
      .catch(() => {});
  }, [item.firstId]);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.clientName, { color: theme.text }]}>👤 {item.client_nom}</Text>
          <Text style={[styles.info, { color: theme.textTertiary }]}>📱 {item.client_telephone || 'N/A'}</Text>
          <Text style={[styles.info, { color: theme.textTertiary }]}>📍 {item.client_quartier || 'N/A'}</Text>
          <Text style={[styles.info, { color: theme.textTertiary }]}>👩‍💼 {item.commercial_nom}</Text>
          <Text style={[styles.info, { color: theme.textTertiary }]}>🕐 {formatDateHeure(item.date_creation)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: estTraitee ? theme.secondaryLight : theme.warningLight }]}>
          <Text style={[styles.badgeText, { color: estTraitee ? theme.secondary : theme.warning }]}>
            {estTraitee ? 'Validée' : 'En attente'}
          </Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>📦 Nature du produit :</Text>
      {item.produits.map((p: any, i: number) => (
        <Text key={i} style={[styles.produit, { color: theme.text }]}>• {p.nom} x{p.quantite} — {formatMonnaie(p.prix * p.quantite)}</Text>
      ))}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>💰 Montant à percevoir</Text>
        <Text style={[styles.totalValue, { color: theme.text }]}>{formatMonnaie(item.total)}</Text>
      </View>

      {dernierCommentaire && (
        <View style={[styles.dernierCommentaire, { backgroundColor: theme.primaryLight }]}>
          <View style={styles.dernierCommentaireHeader}>
            <Ionicons name="chatbubble" size={14} color={theme.primary} />
            <Text style={[styles.dernierCommentaireAuteur, { color: theme.primary }]}>
              {dernierCommentaire.User?.nom || 'Inconnu'} ({dernierCommentaire.User?.role || '-'})
            </Text>
            <Text style={[styles.dernierCommentaireDate, { color: theme.textTertiary }]}>
              {formatDateHeure(dernierCommentaire.date_creation)}
            </Text>
          </View>
          <Text style={[styles.dernierCommentaireTexte, { color: theme.text }]} numberOfLines={2}>
            {dernierCommentaire.message}
          </Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      <TouchableOpacity
        style={[styles.commentBtn, { borderColor: theme.primary }]}
        onPress={() => onShowComments(item.firstId)}
      >
        <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
        <Text style={[styles.commentBtnText, { color: theme.primary }]}>💬 Voir les commentaires</Text>
      </TouchableOpacity>
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      <View style={styles.actions}>
        {!estTraitee && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.copyBtn, {
              borderColor: theme.primary,
              backgroundColor: 'transparent'
            }]}
            onPress={() => onValidee(item)}
          >
            <Ionicons name="copy-outline" size={16} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>Validée</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.danger }]} onPress={() => onAnnulerGroupe(item)}>
          <Ionicons name="close-circle-outline" size={16} color={theme.danger} />
          <Text style={[styles.actionText, { color: theme.danger }]}>Annuler</Text>
        </TouchableOpacity>
        {!estTraitee && (
          <TouchableOpacity style={[styles.actionBtn, styles.validateBtn, { backgroundColor: theme.secondary }]} onPress={() => onOpenValidation(item)}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
            <Text style={[styles.actionText, { color: '#FFF' }]}>Livré</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 14, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  clientName: { fontSize: 17, fontWeight: 'bold' },
  info: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  produit: { fontSize: 14, paddingVertical: 3 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  dernierCommentaire: { padding: 10, borderRadius: 8, marginVertical: 6 },
  dernierCommentaireHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dernierCommentaireAuteur: { fontSize: 12, fontWeight: '600' },
  dernierCommentaireDate: { fontSize: 10, marginLeft: 'auto' },
  dernierCommentaireTexte: { fontSize: 13, lineHeight: 18 },
  commentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  commentBtnText: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  copyBtn: { flex: 0.8 },
  validateBtn: { borderWidth: 0 },
  actionText: { fontSize: 12, fontWeight: '600' },
});