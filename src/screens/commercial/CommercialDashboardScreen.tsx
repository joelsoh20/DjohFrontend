import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, ScrollView, Text, StyleSheet,
  RefreshControl, TouchableOpacity, Modal, TextInput, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCommercialDashboard } from '../../hooks/useCommercialDashboard';
import { CommercialStatsCard } from '../../components/commercial/CommercialStatsCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import api from '../../services/api';
import { formatMonnaie } from '../../utils/formatMonnaie';
import { formatDateHeure } from '../../utils/formatDate';

// ---------- Fonctions d'appel et WhatsApp ----------
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

// Composant simple pour afficher une commande avec commentaires et modification
const CommandeItem: React.FC<{
  commande: any;
  onModifier: (commande: any) => void;
  theme: any;
}> = ({ commande, onModifier, theme }) => {
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
        // ✅ Dernier commentaire
        if (data.length > 0) {
          setDernierCommentaire(data[data.length - 1]);
        }
      }
    } catch { /* ignore */ }
    finally { setLoadingComments(false); }
  }, [commande?.id]);

  // ✅ Charger les commentaires automatiquement au montage
  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post('/order-comments', {
        order_id: commande.id,
        message: newComment.trim()
      });
      setNewComment('');
      fetchComments();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible d\'envoyer le commentaire');
    }
  };

  const isRecue = commande.statut === 'recue';

  return (
    <View style={[itemStyles.card, { backgroundColor: theme.surface }]}>
      <View style={itemStyles.header}>
        <View>
          <Text style={[itemStyles.client, { color: theme.text }]}>👤 {commande.client_nom}</Text>
          <Text style={[itemStyles.date, { color: theme.textSecondary }]}>
            {formatDateHeure(commande.date_creation)}
          </Text>
        </View>
        <View style={[itemStyles.badge, { backgroundColor: isRecue ? theme.warningLight : theme.secondaryLight }]}>
          <Text style={[itemStyles.badgeText, { color: isRecue ? theme.warning : theme.secondary }]}>
            {isRecue ? 'En attente' : 'Livrée'}
          </Text>
        </View>
      </View>

      {/* Téléphone et boutons d'appel */}
      <View style={itemStyles.phoneContainer}>
        <Ionicons name="call-outline" size={16} color={theme.primary} />
        <Text style={[itemStyles.phoneText, { color: theme.textSecondary }]}>
          {commande.client_telephone || '📵 Numéro non renseigné'}
        </Text>
        {commande.client_telephone && (
          <View style={itemStyles.actionButtons}>
            <TouchableOpacity
              style={[itemStyles.callButton, { backgroundColor: theme.primary }]}
              onPress={() => handleCall(commande.client_telephone)}
            >
              <Ionicons name="call" size={14} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[itemStyles.whatsappButton, { backgroundColor: '#25D366' }]}
              onPress={() => handleWhatsApp(commande.client_telephone)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={[itemStyles.produits, { color: theme.textSecondary }]}>
        📦 {(commande as any).produit_nom || (commande as any).produits?.join(', ') || 'N/A'}
      </Text>
      <Text style={[itemStyles.total, { color: theme.text }]}>
        Total : {formatMonnaie(commande.total || 0)}
      </Text>

      {/* ✅ Dernier commentaire affiché directement */}
      {dernierCommentaire && (
        <View style={[itemStyles.dernierCommentaire, { backgroundColor: theme.primaryLight }]}>
          <View style={itemStyles.dernierCommentaireHeader}>
            <Ionicons name="chatbubble" size={14} color={theme.primary} />
            <Text style={[itemStyles.dernierCommentaireAuteur, { color: theme.primary }]}>
              {dernierCommentaire.User?.nom || 'Inconnu'} ({dernierCommentaire.User?.role || '-'})
            </Text>
            <Text style={[itemStyles.dernierCommentaireDate, { color: theme.textTertiary }]}>
              {formatDateHeure(dernierCommentaire.date_creation)}
            </Text>
          </View>
          <Text style={[itemStyles.dernierCommentaireTexte, { color: theme.text }]} numberOfLines={2}>
            {dernierCommentaire.message}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={itemStyles.actions}>
        {isRecue && (
          <TouchableOpacity
            style={[itemStyles.actionBtn, { borderColor: theme.primary }]}
            onPress={() => onModifier(commande)}
          >
            <Ionicons name="create-outline" size={16} color={theme.primary} />
            <Text style={[itemStyles.actionText, { color: theme.primary }]}>Modifier</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[itemStyles.actionBtn, { borderColor: theme.primary }]}
          onPress={() => setShowComments(true)}
        >
          <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
          <Text style={[itemStyles.actionText, { color: theme.primary }]}>
            Commentaires {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal commentaires */}
      <Modal visible={showComments} animationType="slide" transparent onRequestClose={() => setShowComments(false)}>
        <View style={itemStyles.modalOverlay}>
          <View style={[itemStyles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[itemStyles.modalTitle, { color: theme.text }]}>💬 Commentaires</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {comments.length === 0 && !loadingComments && (
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                  Aucun commentaire
                </Text>
              )}
              {comments.map(c => (
                <View key={c.id} style={[itemStyles.comment, { borderBottomColor: theme.divider }]}>
                  <Text style={[itemStyles.commentUser, { color: theme.primary }]}>
                    {c.User?.nom} ({c.User?.role})
                  </Text>
                  <Text style={{ color: theme.text }}>{c.message}</Text>
                  <Text style={[itemStyles.date, { color: theme.textSecondary }]}>
                    {formatDateHeure(c.date_creation)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={itemStyles.commentInputRow}>
              <TextInput
                style={[itemStyles.input, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border }]}
                placeholder="Ajouter un commentaire..."
                placeholderTextColor={theme.textTertiary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity style={[itemStyles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleAddComment}>
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[itemStyles.closeBtn, { borderColor: theme.border }]}
              onPress={() => setShowComments(false)}
            >
              <Text style={{ color: theme.textSecondary }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const itemStyles = StyleSheet.create({
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
  // ✅ Nouveaux styles pour le dernier commentaire
  dernierCommentaire: { padding: 10, borderRadius: 8, marginBottom: 8 },
  dernierCommentaireHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dernierCommentaireAuteur: { fontSize: 12, fontWeight: '600' },
  dernierCommentaireDate: { fontSize: 10, marginLeft: 'auto' },
  dernierCommentaireTexte: { fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  comment: { paddingVertical: 8, borderBottomWidth: 1 },
  commentUser: { fontSize: 13, fontWeight: '600' },
  commentDate: { fontSize: 11, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { padding: 10, borderRadius: 10 },
  closeBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
});

// ==============================
// ÉCRAN PRINCIPAL (inchangé)
// ==============================
export const CommercialDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, utilisateur } = useAuth();
  const { stats, loading, refresh } = useCommercialDashboard();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refresh());
    return unsubscribe;
  }, [navigation, refresh]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleModifier = (commande: any) => {
    navigation.navigate('NouvelleCommande', { commande });
  };

  const commandesEnAttente = useMemo(() => {
    return (stats.dernieresCommandes || []).filter((cmd: any) => cmd.statut === 'recue');
  }, [stats.dernieresCommandes]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner fullScreen message={t('common.loading')} />
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {t('dashboard.greeting', { name: utilisateur?.nom || '' })}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>Mon Tableau de Bord</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.surfaceVariant }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.surfaceVariant }]} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <CommercialStatsCard stats={stats} />

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📝 Mes commandes récentes</Text>

          <TouchableOpacity
            style={[styles.historyBtn, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate('ListeCommandes')}
          >
            <Ionicons name="time-outline" size={18} color={theme.primary} />
            <Text style={[styles.historyBtnText, { color: theme.primary }]}>Voir l'historique</Text>
          </TouchableOpacity>

          {commandesEnAttente.length > 0 ? (
            commandesEnAttente.map((cmd: any, idx: number) => (
              <CommandeItem
                key={cmd.id || idx}
                commande={cmd}
                onModifier={handleModifier}
                theme={theme}
              />
            ))
          ) : (
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>
              Aucune commande en attente
            </Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('NouvelleCommande')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1,
  },
  greeting: { fontSize: 14 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  historyBtnText: { fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
});