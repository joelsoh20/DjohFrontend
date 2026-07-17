// Configuration commission (forfaitaire/par produit)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { CommissionMode, Produit, ProductCommission } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommissionConfigProps {
  mode: CommissionMode;
  onModeChange: (mode: CommissionMode) => void;
  commissionDefaut: string;
  onCommissionDefautChange: (value: string) => void;
  produits: Produit[];
  commissionsProduits: ProductCommission[];
  onAddCommission: (productId: string, montant: number) => void;
  onRemoveCommission: (productId: string) => void;
}

export const CommissionConfig: React.FC<CommissionConfigProps> = ({
  mode,
  onModeChange,
  commissionDefaut,
  onCommissionDefautChange,
  produits,
  commissionsProduits,
  onAddCommission,
  onRemoveCommission,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedMontant, setSelectedMontant] = useState('');

  const produitsDisponibles = produits.filter(
    p => !commissionsProduits.find(c => c.product_id === p.id)
  );

  const handleAdd = () => {
    if (selectedProductId && selectedMontant && parseFloat(selectedMontant) > 0) {
      onAddCommission(selectedProductId, parseFloat(selectedMontant));
      setSelectedProductId(null);
      setSelectedMontant('');
      setAddModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceVariant }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        ⚙️ {t('commission.title')}
      </Text>

      {/* Sélecteur de mode */}
      <View style={styles.modeSelector}>
        <ModeChip
          label={t('commission.modeForfaitaire')}
          selected={mode === 'forfaitaire'}
          onPress={() => onModeChange('forfaitaire')}
          theme={theme}
        />
        <ModeChip
          label={t('commission.modeParProduit')}
          selected={mode === 'par_produit'}
          onPress={() => onModeChange('par_produit')}
          theme={theme}
        />
      </View>

      {/* Commission par défaut */}
      <Input
        label={t('commission.defaultCommission')}
        value={commissionDefaut}
        onChangeText={onCommissionDefautChange}
        keyboardType="numeric"
        required
      />

      {/* Mode par produit */}
      {mode === 'par_produit' && (
        <View style={styles.produitsSection}>
          <View style={styles.produitsHeader}>
            <Text style={[styles.produitsTitle, { color: theme.text }]}>
              Commissions par produit
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => setAddModalVisible(true)}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {commissionsProduits.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              Aucune commission spécifique définie
            </Text>
          ) : (
            commissionsProduits.map(cp => {
              const produit = produits.find(p => p.id === cp.product_id);
              return (
                <View key={cp.product_id} style={[styles.commissionRow, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.commissionProduit, { color: theme.text }]}>
                    {produit?.nom || cp.product_id}
                  </Text>
                  <Text style={[styles.commissionMontant, { color: theme.primary }]}>
                    {formatMonnaie(cp.montant)}
                  </Text>
                  <TouchableOpacity onPress={() => onRemoveCommission(cp.product_id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {commissionsProduits.length > 0 && (
            <Text style={[styles.note, { color: theme.textTertiary }]}>
              {t('commission.notRetroactive')}
            </Text>
          )}
        </View>
      )}

      {/* Modal ajout */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
            activeOpacity={1}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Ajouter une commission
            </Text>

            <ScrollView style={{ maxHeight: 200 }}>
              {produitsDisponibles.map(produit => (
                <TouchableOpacity
                  key={produit.id}
                  style={[
                    styles.produitOption,
                    { borderBottomColor: theme.divider },
                    selectedProductId === produit.id && { backgroundColor: theme.primaryLight },
                  ]}
                  onPress={() => setSelectedProductId(produit.id)}
                >
                  <Text style={[styles.produitOptionText, { color: theme.text }]}>
                    {produit.nom}
                  </Text>
                  {selectedProductId === produit.id && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedProductId && (
              <Input
                label="Montant (FCFA)"
                value={selectedMontant}
                onChangeText={setSelectedMontant}
                keyboardType="numeric"
                placeholder="Ex: 1500"
              />
            )}

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
                  (!selectedProductId || !selectedMontant) && { opacity: 0.5 },
                ]}
                onPress={handleAdd}
                disabled={!selectedProductId || !selectedMontant}
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

// Sous-composant ModeChip
const ModeChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: any;
}> = ({ label, selected, onPress, theme }) => (
  <TouchableOpacity
    style={[
      chipStyles.chip,
      {
        backgroundColor: selected ? theme.primary : theme.surface,
        borderColor: selected ? theme.primary : theme.border,
      },
    ]}
    onPress={onPress}
  >
    <Text style={[chipStyles.text, { color: selected ? '#FFF' : theme.textSecondary }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  produitsSection: {
    marginTop: 8,
  },
  produitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  produitsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
    fontStyle: 'italic',
  },
  commissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  commissionProduit: {
    flex: 1,
    fontSize: 14,
  },
  commissionMontant: {
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  produitOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  produitOptionText: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});