import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../Button';
import { serviceLivraisonService } from '../../services/serviceLivraisonService';
import { commandeService } from '../../services/commandeService';
import { Commande } from '../../types';

interface CorrectionLivraisonModalProps {
  visible: boolean;
  onClose: () => void;
  commande: Commande | null;
  theme: any;
  onCorrige: () => void;
}

const FRAIS_PROPOSES = [0, 500, 1000, 1500, 2000, 2500];

export const CorrectionLivraisonModal: React.FC<CorrectionLivraisonModalProps> = ({
  visible, onClose, commande, theme, onCorrige
}) => {
  const [services, setServices] = useState<any[]>([]);
  const [fraisChoisi, setFraisChoisi] = useState(1000);
  const [serviceChoisiId, setServiceChoisiId] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (visible && commande) {
      setFraisChoisi(Number(commande.frais_livraison) || 1000);
      setServiceChoisiId(commande.service_livraison_id || null);
      serviceLivraisonService.getAll().then(res => {
        if (res.success) setServices((res.data || []).filter((s: any) => s.actif));
      });
    }
  }, [visible, commande]);

  const confirmer = async () => {
    if (!commande) return;
    setEnvoi(true);
    try {
      await commandeService.corrigerLivraison(commande.id, {
        frais_livraison: fraisChoisi,
        service_livraison_id: serviceChoisiId,
      });
      onCorrige();
      onClose();
      Alert.alert('Succès', 'Livraison corrigée');
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Corriger la livraison</Text>
          <Text style={[styles.modalSub, { color: theme.textTertiary }]}>
            Pour {commande?.client_nom} — corrige une erreur de frais ou de service, sans repasser par toute l'annulation.
          </Text>

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Frais de livraison</Text>
          <View style={styles.fraisRow}>
            {FRAIS_PROPOSES.map(frais => (
              <TouchableOpacity
                key={frais}
                style={[styles.fraisBtn, { backgroundColor: fraisChoisi === frais ? theme.primary : theme.surfaceVariant }]}
                onPress={() => setFraisChoisi(frais)}
              >
                <Text style={{ color: fraisChoisi === frais ? '#FFF' : theme.text, fontWeight: '600' }}>{frais} F</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Service de livraison</Text>
          {services.map((s: any) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.serviceItem, { borderBottomColor: theme.divider }]}
              onPress={() => setServiceChoisiId(s.id)}
            >
              <View>
                <Text style={[styles.serviceName, { color: theme.text }]}>{s.nom}</Text>
                <Text style={[styles.serviceZone, { color: theme.textSecondary }]}>{s.zone || ''}</Text>
              </View>
              {serviceChoisiId === s.id ? (
                <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
              ) : (
                <View style={{ width: 22 }} />
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <Button title="Annuler" onPress={onClose} variant="outline" style={{ flex: 1 }} />
            <Button title="Enregistrer" onPress={confirmer} loading={envoi} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSub: { fontSize: 12, marginTop: 4, marginBottom: 8 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  fraisRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  fraisBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceZone: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
