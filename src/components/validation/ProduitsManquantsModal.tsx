// Détail des produits manquants quand un service de livraison n'a pas
// assez de stock pour couvrir une commande — remplace le message brut
// (un seul long texte) par une liste lisible produit par produit.
import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../Button';

export interface ProduitManquant {
  productId: string;
  nom: string;
  demande: number;
  disponible: number;
  manquant: number;
}

interface ProduitsManquantsModalProps {
  visible: boolean;
  onClose: () => void;
  manquants: ProduitManquant[];
  theme: any;
}

export const ProduitsManquantsModal: React.FC<ProduitsManquantsModalProps> = ({
  visible, onClose, manquants, theme
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Ionicons name="alert-circle" size={24} color={theme.danger} />
            <Text style={[styles.title, { color: theme.text }]}>Stock insuffisant</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ce service de livraison n'a pas assez de stock pour cette commande. Choisissez un autre service.
          </Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {manquants.map((m) => (
              <View key={m.productId} style={[styles.row, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.produitNom, { color: theme.text }]}>{m.nom}</Text>
                <View style={styles.chiffres}>
                  <Text style={[styles.chiffre, { color: theme.textSecondary }]}>Besoin : {m.demande}</Text>
                  <Text style={[styles.chiffre, { color: theme.textSecondary }]}>Disponible : {m.disponible}</Text>
                  <Text style={[styles.chiffreManque, { color: theme.danger }]}>Manque : {m.manquant}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Button title="Compris" onPress={onClose} style={{ marginTop: 16 }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  content: { width: '100%', maxHeight: '80%', borderRadius: 16, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginBottom: 14, lineHeight: 18 },
  list: { maxHeight: 300 },
  row: { paddingVertical: 10, borderBottomWidth: 1 },
  produitNom: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  chiffres: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chiffre: { fontSize: 12 },
  chiffreManque: { fontSize: 12, fontWeight: '700' },
});
