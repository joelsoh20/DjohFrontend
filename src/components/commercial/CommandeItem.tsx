import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateHeure } from '../../utils/formatDate';

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

interface CommandeItemProps {
  commande: any;
  onModifier: (commande: any) => void;
  theme: any;
}

export const CommandeItem: React.FC<CommandeItemProps> = ({ commande, onModifier, theme }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [dernierCommentaire, setDernierCommentaire] = useState<any>(null);

  const fetchComments = useCallback(async () => {
    if (!commande?.id) return;
    setLoadingComments(true);
    try {
      const res = await api.get(`/order-comments/${commande.id}`);
      if (res.data?.success) {
        const data = res.data.data || [];
        setComments(data);
        if (data.length > 0) setDernierCommentaire(data[data.length - 1]);
      }
    } catch { /* ignore */ }
    finally { setLoadingComments(false); }
  }, [commande?.id]);

  useEffect(() => { fetchComments(); }, []);
  useEffect(() => { if (showComments) fetchComments(); }, [showComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post('/order-comments', { order_id: commande.id, message: newComment.trim() });
      setNewComment('');
      fetchComments();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible d\'envoyer le commentaire');
    }
  };

  const isRecue = commande.statut === 'recue';
  const isValidee = commande.statut === 'validee';

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.client, { color: theme.text }]}>👤 {commande.client_nom}</Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDateHeure(commande.date_creation)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isValidee ? '#90EE90' : isRecue ? theme.warningLight : theme.secondaryLight }]}>
          <Text style={[styles.badgeText, { color: isValidee ? '#228B22' : isRecue ? theme.warning : theme.secondary }]}>
            {isValidee ? 'Validée' : isRecue ? 'En attente' : 'Livrée'}
          </Text>
        </View>
      </View>

      <View style={styles.phoneContainer}>
        <Ionicons name="call-outline" size={16} color={theme.primary} />
        <Text style={[styles.phoneText, { color: theme.textSecondary }]}>{commande.client_telephone || '📵 Numéro non renseigné'}</Text>
        {commande.client_telephone && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.primary }]} onPress={() => handleCall(commande.client_telephone)}>
              <Ionicons name="call" size={14} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.whatsappButton, { backgroundColor: '#25D366' }]} onPress={() => handleWhatsApp(commande.client_telephone)}>
              <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={[styles.produits, { color: theme.textSecondary }]}>
        📦 {(commande as any).produit_nom || (commande as any).produits?.join(', ') || 'N/A'}
      </Text>
      <Text style={[styles.total, { color: theme.text }]}>Total : {formatMonnaie(commande.total || 0)}</Text>

      {dernierCommentaire && (
        <View style={[styles.dernierCommentaire, { backgroundColor: theme.primaryLight }]}>
          <View style={styles.dernierCommentaireHeader}>
            <Ionicons name="chatbubble" size={14} color={theme.primary} />
            <Text style={[styles.dernierCommentaireAuteur, { color: theme.primary }]}>{dernierCommentaire.User?.nom || 'Inconnu'} ({dernierCommentaire.User?.role || '-'})</Text>
            <Text style={[styles.dernierCommentaireDate, { color: theme.textTertiary }]}>{formatDateHeure(dernierCommentaire.date_creation)}</Text>
          </View>
          <Text style={[styles.dernierCommentaireTexte, { color: theme.text }]} numberOfLines={2}>{dernierCommentaire.message}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {isRecue && (
          <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.primary }]} onPress={() => onModifier(commande)}>
            <Ionicons name="create-outline" size={16} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>Modifier</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.primary }]} onPress={() => setShowComments(true)}>
          <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.primary }]}>Commentaires {comments.length > 0 ? `(${comments.length})` : ''}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showComments} animationType="slide" transparent onRequestClose={() => setShowComments(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>💬 Commentaires</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {comments.length === 0 && !loadingComments && (
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>Aucun commentaire</Text>
              )}
              {comments.map(c => (
                <View key={c.id} style={[styles.comment, { borderBottomColor: theme.divider }]}>
                  <Text style={[styles.commentUser, { color: theme.primary }]}>{c.User?.nom} ({c.User?.role})</Text>
                  <Text style={{ color: theme.text }}>{c.message}</Text>
                  <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDateHeure(c.date_creation)}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.commentInputRow}>
              <TextInput style={[styles.input, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border }]} placeholder="Ajouter un commentaire..." placeholderTextColor={theme.textTertiary} value={newComment} onChangeText={setNewComment} multiline />
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleAddComment}>
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { borderColor: theme.border }]} onPress={() => setShowComments(false)}>
              <Text style={{ color: theme.textSecondary }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  client: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  phoneContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  phoneText: { fontSize: 14, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 6 },
  callButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  whatsappButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  produits: { fontSize: 13, marginBottom: 4 },
  total: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  dernierCommentaire: { padding: 10, borderRadius: 8, marginBottom: 8 },
  dernierCommentaireHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dernierCommentaireAuteur: { fontSize: 12, fontWeight: '600' },
  dernierCommentaireDate: { fontSize: 10, marginLeft: 'auto' },
  dernierCommentaireTexte: { fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  actionText: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  comment: { paddingVertical: 8, borderBottomWidth: 1 },
  commentUser: { fontSize: 13, fontWeight: '600' },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { padding: 10, borderRadius: 10 },
  closeBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
});