import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput, Alert,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatDateCourte } from '../../utils/formatDate';
import api from '../../services/api';

interface Comment {
  id: string;
  message: string;
  date_creation: string;
  User?: { id: string; nom: string; role: string };
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;   // ID de la commande (ou premier ID du groupe)
}

export const CommentModal: React.FC<CommentModalProps> = ({ visible, onClose, orderId }) => {
  const { theme } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await api.get(`/order-comments/${orderId}`);
      if (res.data?.success) setComments(res.data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => {
    if (visible) fetchComments();
  }, [visible, fetchComments]);

  const handleAdd = async () => {
    const msg = newMsg.trim();
    if (!msg) return;
    try {
      await api.post('/order-comments', { order_id: orderId, message: msg });
      setNewMsg('');
      fetchComments();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible d\'envoyer le commentaire');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/* Remonte la zone de saisie au-dessus du clavier (sinon le champ
          "Votre message" est recouvert et on tape sans se relire). */}
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>💬 Discussion</Text>
          <ScrollView style={{ maxHeight: 250 }}>
            {comments.length === 0 && !loading && (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                Aucun commentaire
              </Text>
            )}
            {comments.map(c => (
              <View key={c.id} style={[styles.comment, { borderBottomColor: theme.divider }]}>
                <Text style={{ fontWeight: '600', color: theme.primary }}>
                  {c.User?.nom || 'Inconnu'} ({c.User?.role || '-'})
                </Text>
                <Text style={{ color: theme.text, marginVertical: 2 }}>{c.message}</Text>
                <Text style={{ fontSize: 11, color: theme.textTertiary }}>
                  {formatDateCourte(c.date_creation)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border }]}
              placeholder="Votre message..."
              placeholderTextColor={theme.textTertiary}
              value={newMsg}
              onChangeText={setNewMsg}
              multiline
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.closeBtn, { borderColor: theme.border }]} onPress={onClose}>
            <Text style={{ color: theme.textSecondary }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  comment: { paddingVertical: 8, borderBottomWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { padding: 10, borderRadius: 10 },
  closeBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
});