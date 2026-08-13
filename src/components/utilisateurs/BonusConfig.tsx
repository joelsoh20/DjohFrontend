// Configuration des paliers de bonus mensuel d'un commercial :
// "à partir de N commandes dans le mois, bonus de M FCFA".
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { BonusPalier } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface BonusConfigProps {
  bonusPaliers: BonusPalier[];
  onAddPalier: (nombreCommandes: number, montant: number) => void;
  onRemovePalier: (palierId: string) => void;
}

export const BonusConfig: React.FC<BonusConfigProps> = ({
  bonusPaliers, onAddPalier, onRemovePalier,
}) => {
  const { theme } = useTheme();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [nombreCommandes, setNombreCommandes] = useState('');
  const [montant, setMontant] = useState('');

  const paliersTries = [...bonusPaliers].sort((a, b) => a.nombre_commandes - b.nombre_commandes);

  const handleAdd = () => {
    const n = parseInt(nombreCommandes);
    const m = parseFloat(montant);
    if (n > 0 && m >= 0) {
      onAddPalier(n, m);
      setNombreCommandes('');
      setMontant('');
      setAddModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceVariant }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          🎯 Bonus mensuel par nombre de commandes
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: theme.textTertiary }]}>
        Le commercial touche le bonus du palier le plus haut atteint dans le mois (non cumulé).
      </Text>

      {paliersTries.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
          Aucun palier de bonus défini
        </Text>
      ) : (
        paliersTries.map(p => (
          <View key={p.id} style={[styles.palierRow, { backgroundColor: theme.surface }]}>
            <Text style={[styles.palierSeuil, { color: theme.text }]}>
              À partir de {p.nombre_commandes} commandes
            </Text>
            <Text style={[styles.palierMontant, { color: theme.primary }]}>
              {formatMonnaie(p.montant)}
            </Text>
            <TouchableOpacity onPress={() => onRemovePalier(p.id)}>
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <Modal visible={addModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        >
          <TouchableOpacity style={[styles.modalContent, { backgroundColor: theme.surface }]} activeOpacity={1}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ajouter un palier de bonus</Text>

            <Input
              label="Nombre de commandes dans le mois"
              value={nombreCommandes}
              onChangeText={setNombreCommandes}
              keyboardType="numeric"
              placeholder="Ex: 20"
            />
            <Input
              label="Montant du bonus (FCFA)"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
              placeholder="Ex: 5000"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.primary },
                  (!nombreCommandes || !montant) && { opacity: 0.5 },
                ]}
                onPress={handleAdd}
                disabled={!nombreCommandes || !montant}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 14, marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 14, fontWeight: '600', flex: 1 },
  hint: { fontSize: 11, fontStyle: 'italic', marginBottom: 12 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', paddingVertical: 16, fontSize: 13, fontStyle: 'italic' },
  palierRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 8, gap: 10 },
  palierSeuil: { flex: 1, fontSize: 13 },
  palierMontant: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { width: '100%', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalButtonText: { fontSize: 15, fontWeight: '600' },
});
