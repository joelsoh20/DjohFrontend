import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
  Modal, TextInput, Alert, ScrollView as ScrollViewModal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateCourte } from '../../utils/formatDate';
import { EmptyState } from '../EmptyState';
import api from '../../services/api';

// ---------- Petit composant pour gérer les commentaires ----------
interface Comment {
  id: string;
  message: string;
  date_creation: string;
  User?: { id: string; nom: string; role: string };
}

const CommentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  groupId: string;
  theme: any;
}> = ({ visible, onClose, groupId, theme }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await api.get(`/order-comments/${groupId}`);
      if (res.data?.success) setComments(res.data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => {
    if (visible) fetchComments();
  }, [visible]);

  const handleAdd = async () => {
    const msg = newMsg.trim();
    if (!msg) return;
    try {
      await api.post('/order-comments', { order_id: groupId, message: msg });
      setNewMsg('');
      fetchComments();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible d\'envoyer le commentaire');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={cmStyles.overlay}>
        <View style={[cmStyles.content, { backgroundColor: theme.surface }]}>
          <Text style={[cmStyles.title, { color: theme.text }]}>💬 Discussion</Text>
          <ScrollViewModal style={{ maxHeight: 250 }}>
            {comments.length === 0 && !loading && (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                Aucun commentaire
              </Text>
            )}
            {comments.map(c => (
              <View key={c.id} style={[cmStyles.comment, { borderBottomColor: theme.divider }]}>
                <Text style={{ fontWeight: '600', color: theme.primary }}>
                  {c.User?.nom || 'Inconnu'} ({c.User?.role || '-'})
                </Text>
                <Text style={{ color: theme.text, marginVertical: 2 }}>{c.message}</Text>
                <Text style={{ fontSize: 11, color: theme.textTertiary }}>
                  {formatDateCourte(c.date_creation)}
                </Text>
              </View>
            ))}
          </ScrollViewModal>

          <View style={cmStyles.inputRow}>
            <TextInput
              style={[cmStyles.input, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border }]}
              placeholder="Votre message..."
              placeholderTextColor={theme.textTertiary}
              value={newMsg}
              onChangeText={setNewMsg}
              multiline
            />
            <TouchableOpacity style={[cmStyles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[cmStyles.closeBtn, { borderColor: theme.border }]} onPress={onClose}>
            <Text style={{ color: theme.textSecondary }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const cmStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  comment: { paddingVertical: 8, borderBottomWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { padding: 10, borderRadius: 10 },
  closeBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
});

// ---------- FIN CommentModal ----------

interface CommercialCommandesListProps {
  commandes: any[];
}

export const CommercialCommandesList: React.FC<CommercialCommandesListProps> = ({ commandes = [] }) => {
  const { theme } = useTheme();
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  // Regrouper par group_id
  const commandesGroupees = commandes.reduce((acc: any[], cmd: any) => {
    const key = cmd.group_id || `${cmd.client_nom}_${new Date(cmd.date_creation).getTime()}`;
    const existing = acc.find(c => c.key === key);
    if (existing) {
      existing.produits.push(cmd.produit_nom);
      existing.total += cmd.total;
      existing.client_telephone = cmd.client_telephone || existing.client_telephone;
      existing.ids.push(cmd.id);
    } else {
      acc.push({
        key,
        client_nom: cmd.client_nom,
        client_telephone: cmd.client_telephone || null,
        date: cmd.date_creation,
        statut: cmd.statut,
        produits: [cmd.produit_nom],
        total: cmd.total,
        firstId: cmd.id,
        ids: [cmd.id],
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

  const handleCall = (phoneNumber: string | null) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
  };

  const handleWhatsApp = (phoneNumber: string | null) => {
    if (phoneNumber) {
      let formatted = phoneNumber.replace(/\s/g, '');
      if (formatted.startsWith('0')) formatted = '237' + formatted.substring(1);
      if (!formatted.startsWith('237') && !formatted.startsWith('+')) formatted = '237' + formatted;
      formatted = formatted.replace('+', '');
      Linking.openURL(`whatsapp://send?phone=${formatted}`).catch(() => {
        Linking.openURL(`https://wa.me/${formatted}`);
      });
    }
  };

  const handleModifier = (commande: any) => {
    Alert.alert('Modifier', 'Redirection vers la modification...');
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

                <View style={styles.phoneContainer}>
  <Ionicons name="call-outline" size={16} color={theme.primary} />
  <Text style={[styles.phoneText, { color: theme.textSecondary }]}>
    {cmd.client_telephone || '📵 Numéro non renseigné'}
  </Text>
  {cmd.client_telephone && (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.primary }]} onPress={() => handleCall(cmd.client_telephone)}>
        <Ionicons name="call" size={14} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.whatsappButton, { backgroundColor: '#25D366' }]} onPress={() => handleWhatsApp(cmd.client_telephone)}>
        <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  )}
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

                {/* Boutons d'action */}
                <View style={styles.actionRow}>
                  {cmd.statut === 'recue' && (
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.primary }]} onPress={() => handleModifier(cmd)}>
                      <Ionicons name="create-outline" size={14} color={theme.primary} />
                      <Text style={[styles.actionBtnText, { color: theme.primary }]}>Modifier</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: theme.primary }]}
                    onPress={() => setShowCommentsFor(cmd.firstId)}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={theme.primary} />
                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>Discussion</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))
      )}

      {/* Modale commentaires */}
      <CommentModal
        visible={!!showCommentsFor}
        onClose={() => setShowCommentsFor(null)}
        groupId={showCommentsFor || ''}
        theme={theme}
      />
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
  phoneContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6, marginTop: 2 },
  phoneText: { fontSize: 14, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 6 },
  callButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  whatsappButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  separator: { borderTopWidth: 1, marginVertical: 8 },
  produitsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  produit: { fontSize: 13, marginLeft: 4, paddingVertical: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
});