import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { stockService } from '../../services/stockService';
import { Input } from '../Input';
import { Button } from '../Button';

interface Mouvement {
  id: string;
  quantite: number;
  date_creation: string;
  auteur: { id: string; nom: string; role: string } | null;
  peutModifier: boolean;
}

interface StockMouvementsModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string | null;
  produitNom: string;
  theme: any;
  onCorrige: () => void;
}

const formatDateHeure = (d: string) =>
  new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const StockMouvementsModal: React.FC<StockMouvementsModalProps> = ({
  visible, onClose, productId, produitNom, theme, onCorrige
}) => {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [enCorrection, setEnCorrection] = useState<string | null>(null);
  const [nouvelleQuantite, setNouvelleQuantite] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await stockService.getMouvements(productId);
      if (res.success) setMouvements(res.data || []);
    } catch {
      // silencieux : la liste reste vide, pas bloquant
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (visible) charger();
  }, [visible, charger]);

  const demarrerCorrection = (m: Mouvement) => {
    setEnCorrection(m.id);
    setNouvelleQuantite(String(m.quantite));
  };

  const confirmerCorrection = async () => {
    if (!enCorrection) return;
    const qte = parseInt(nouvelleQuantite);
    if (isNaN(qte) || qte < 0) {
      Alert.alert('Erreur', 'Quantité invalide');
      return;
    }
    setEnvoi(true);
    try {
      await stockService.modifierMouvement(enCorrection, qte);
      setEnCorrection(null);
      await charger();
      onCorrige();
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>📜 Historique — {produitNom}</Text>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} />
          ) : mouvements.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textTertiary }]}>Aucun mouvement récent</Text>
          ) : (
            mouvements.map(m => (
              <View key={m.id} style={[styles.ligne, { borderColor: theme.divider }]}>
                {enCorrection === m.id ? (
                  <View style={{ flex: 1 }}>
                    <Input value={nouvelleQuantite} onChangeText={setNouvelleQuantite} keyboardType="numeric" placeholder="Nouvelle quantité" />
                    <View style={styles.actionsCorrection}>
                      <Button title="Annuler" variant="outline" onPress={() => setEnCorrection(null)} style={{ flex: 1 }} />
                      <Button title="Valider" onPress={confirmerCorrection} loading={envoi} style={{ flex: 1 }} />
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.qte, { color: m.quantite >= 0 ? theme.secondary : theme.danger }]}>
                        {m.quantite >= 0 ? '+' : ''}{m.quantite}
                      </Text>
                      <Text style={[styles.meta, { color: theme.textTertiary }]}>
                        {m.auteur?.nom || 'Inconnu'} ({m.auteur?.role}) • {formatDateHeure(m.date_creation)}
                      </Text>
                    </View>
                    {m.peutModifier && (
                      <TouchableOpacity onPress={() => demarrerCorrection(m)} style={styles.editBtn}>
                        <Ionicons name="create-outline" size={20} color={theme.primary} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            ))
          )}

          <TouchableOpacity style={[styles.closeBtn, { borderColor: theme.border }]} onPress={onClose}>
            <Text style={{ color: theme.textSecondary }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
  empty: { textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
  ligne: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1,
  },
  qte: { fontSize: 16, fontWeight: 'bold' },
  meta: { fontSize: 12, marginTop: 2 },
  editBtn: { padding: 8 },
  actionsCorrection: { flexDirection: 'row', gap: 10, marginTop: 8 },
  closeBtn: { marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
});
