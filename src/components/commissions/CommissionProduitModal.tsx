// Modal édition commission par produit
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../Input';
import { Button } from '../Button';
import { Produit, ProductCommission, Utilisateur } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommissionProduitModalProps {
  visible: boolean;
  onClose: () => void;
  commercial: Utilisateur | null;
  produits: Produit[];
  commissionsProduits: ProductCommission[];
  onAdd: (userId: string, productId: string, montant: number) => Promise<void>;
  onRemove: (userId: string, productId: string) => Promise<void>;
  onUpdateDefaut: (userId: string, montant: number) => Promise<void>;
}

export const CommissionProduitModal: React.FC<CommissionProduitModalProps> = ({
  visible, onClose, commercial, produits, commissionsProduits,
  onAdd, onRemove, onUpdateDefaut,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [addMode, setAddMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [montant, setMontant] = useState('');

  const produitsDisponibles = produits.filter(
    p => !commissionsProduits.find(cp => cp.product_id === p.id)
  );

  const handleAdd = async () => {
    if (commercial && selectedProductId && montant && parseFloat(montant) > 0) {
      await onAdd(commercial.id, selectedProductId, parseFloat(montant));
      setAddMode(false);
      setSelectedProductId(null);
      setMontant('');
    }
  };

  if (!commercial) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={[styles.content, { backgroundColor: theme.surface }]} activeOpacity={1}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>{commercial.nom}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Commission par produit
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Commission par défaut */}
            <View style={[styles.defautSection, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.defautLabel, { color: theme.textSecondary }]}>
                Commission par défaut (si pas de produit spécifique)
              </Text>
              <Input
                label="Montant (FCFA)"
                value={commercial.commission_defaut?.toString() || '1000'}
                onChangeText={(val) => {}}
                keyboardType="numeric"
                editable={false}
              />
            </View>

            {/* Commissions par produit */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Commissions spécifiques
            </Text>

            {commissionsProduits.length === 0 && !addMode && (
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                Aucune commission spécifique définie
              </Text>
            )}

            {commissionsProduits.map(cp => {
              const produit = produits.find(p => p.id === cp.product_id);
              return (
                <View key={cp.product_id} style={[styles.commissionRow, { backgroundColor: theme.surfaceVariant }]}>
                  <View style={styles.commissionInfo}>
                    <Text style={[styles.commissionProduit, { color: theme.text }]}>
                      {produit?.nom || cp.product_id}
                    </Text>
                    <Text style={[styles.commissionMontant, { color: theme.primary }]}>
                      {formatMonnaie(cp.montant)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemove(commercial.id, cp.product_id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Ajout */}
            {addMode ? (
              <View style={[styles.addSection, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.addTitle, { color: theme.primary }]}>Ajouter une commission</Text>
                
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                  {produitsDisponibles.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.produitOption,
                        { borderBottomColor: theme.divider },
                        selectedProductId === p.id && { backgroundColor: theme.primaryLight },
                      ]}
                      onPress={() => setSelectedProductId(p.id)}
                    >
                      <Text style={[styles.produitOptionText, { color: theme.text }]}>{p.nom}</Text>
                      {selectedProductId === p.id && (
                        <Ionicons name="checkmark" size={18} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {selectedProductId && (
                  <Input
                    label="Montant (FCFA)"
                    value={montant}
                    onChangeText={setMontant}
                    keyboardType="numeric"
                    placeholder="Ex: 1500"
                  />
                )}

                <View style={styles.addActions}>
                  <Button title="Annuler" onPress={() => setAddMode(false)} variant="outline" />
                  <Button
                    title="Ajouter"
                    onPress={handleAdd}
                    disabled={!selectedProductId || !montant}
                  />
                </View>
              </View>
            ) : (
              <Button
                title="+ Ajouter une commission produit"
                onPress={() => setAddMode(true)}
                variant="outline"
              />
            )}
          </ScrollView>

          <Text style={[styles.note, { color: theme.textTertiary }]}>
            {t('commission.notRetroactive')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  defautSection: { padding: 14, borderRadius: 12, marginBottom: 16 },
  defautLabel: { fontSize: 13, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  emptyText: { textAlign: 'center', paddingVertical: 16, fontSize: 13, fontStyle: 'italic' },
  commissionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 10, marginBottom: 8,
  },
  commissionInfo: { flex: 1 },
  commissionProduit: { fontSize: 14, fontWeight: '500' },
  commissionMontant: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  addSection: { padding: 14, borderRadius: 12, marginBottom: 16 },
  addTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  produitOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1,
  },
  produitOptionText: { fontSize: 14 },
  addActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  note: {
    textAlign: 'center', paddingVertical: 16, fontSize: 12, fontStyle: 'italic',
  },
});