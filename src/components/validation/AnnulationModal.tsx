import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput } from 'react-native';
import { Button } from '../Button';

interface AnnulationModalProps {
  visible: boolean;
  motif: string;
  onMotifChange: (text: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  theme: any;
}

export const AnnulationModal: React.FC<AnnulationModalProps> = ({
  visible, motif, onMotifChange, onConfirm, onClose, theme
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.danger }]}>❌ Annuler la commande</Text>
          <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Veuillez indiquer le motif de l'annulation pour le commercial.</Text>
          <TextInput
            style={[styles.motifInput, { backgroundColor: theme.surfaceVariant, color: theme.text, borderColor: theme.border }]}
            placeholder="Motif de l'annulation..."
            placeholderTextColor={theme.textTertiary}
            value={motif}
            onChangeText={onMotifChange}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalBtns}>
            <Button title="Annuler" onPress={onClose} variant="outline" />
            <Button title="Confirmer l'annulation" onPress={onConfirm} variant="danger" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalSubtitle: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  motifInput: { padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
});