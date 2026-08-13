import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../Button';
import { serviceLivraisonService } from '../../services/serviceLivraisonService';

interface ValidationModalProps {
  visible: boolean;
  onClose: () => void;
  fraisChoisi: number;
  onFraisChange: (frais: number) => void;
  onServiceSelect: (serviceId: string) => void;
  theme: any;
  loading?: boolean;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  visible, onClose, fraisChoisi, onFraisChange, onServiceSelect, theme, loading = false
}) => {
  const [services, setServices] = React.useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      serviceLivraisonService.getAll().then(res => {
        if (res.success) setServices((res.data || []).filter((s: any) => s.actif));
      });
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Valider la commande</Text>
          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Frais de livraison</Text>
          <View style={styles.fraisRow}>
            {[0, 500, 1000, 1500, 2000, 2500].map(frais => (
              <TouchableOpacity key={frais} disabled={loading} style={[styles.fraisBtn, { backgroundColor: fraisChoisi === frais ? theme.primary : theme.surfaceVariant, opacity: loading ? 0.5 : 1 }]} onPress={() => onFraisChange(frais)}>
                <Text style={{ color: fraisChoisi === frais ? '#FFF' : theme.text, fontWeight: '600' }}>{frais} F</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Service de livraison</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.primary} />
              <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Validation en cours…</Text>
            </View>
          ) : (
            services.map((s: any) => (
              <TouchableOpacity key={s.id} style={[styles.serviceItem, { borderBottomColor: theme.divider }]} onPress={() => onServiceSelect(s.id)}>
                <View><Text style={[styles.serviceName, { color: theme.text }]}>{s.nom}</Text><Text style={[styles.serviceZone, { color: theme.textSecondary }]}>{s.zone || ''}</Text></View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ))
          )}
          <Button title="Annuler" onPress={onClose} variant="outline" style={{ marginTop: 12 }} disabled={loading} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  fraisRow: { flexDirection: 'row', gap: 10 },
  fraisBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  serviceName: { fontSize: 14, fontWeight: '600' },
  serviceZone: { fontSize: 12 },
  loadingRow: { alignItems: 'center', paddingVertical: 24 },
});