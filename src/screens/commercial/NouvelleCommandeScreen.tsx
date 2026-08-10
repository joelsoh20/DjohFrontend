import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNouvelleCommande } from '../../hooks/useNouvelleCommande';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { CommandeFormSkeleton } from '../../components/commande/CommandeFormSkeleton';

export const NouvelleCommandeScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const commandeIdToEdit = route?.params?.commandeId || undefined;

  const {
    formData, produits, produitsSelectionnes,
    loadingData, loadingSubmit, isEditMode,
    updateField, toggleProduit, updateQuantite, handleSubmit,
  } = useNouvelleCommande(commandeIdToEdit);

  const produitsActifs = produits.filter(p => p.actif);
  const totalProduits = produitsSelectionnes.reduce((sum, p) => sum + p.prix * p.quantite, 0);

  if (loadingData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Ionicons name={isEditMode ? 'create' : 'add-circle'} size={32} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>
            {isEditMode ? 'Modifier la commande' : 'Nouvelle commande'}
          </Text>
        </View>
        <CommandeFormSkeleton />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name={isEditMode ? 'create' : 'add-circle'} size={32} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          {isEditMode ? 'Modifier la commande' : 'Nouvelle commande'}
        </Text>
      </View>

      <View style={[styles.clientBadge, { backgroundColor: theme.secondaryLight }]}>
        <Text style={[styles.clientBadgeText, { color: theme.secondary }]}>👤 NDJOH AGOGO</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Input label="Numéro du client" value={formData.client_telephone} onChangeText={(v) => updateField('client_telephone', v)} placeholder="652625546" keyboardType="phone-pad" />
        <Input label="Adresse de livraison" value={formData.client_quartier} onChangeText={(v) => updateField('client_quartier', v)} placeholder="Tkc" />
        <Input label="Montant à percevoir (FCFA)" value={formData.prix} onChangeText={(v) => updateField('prix', v)} placeholder="14500" keyboardType="numeric" />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>📦 Nature du produit</Text>

      {produitsActifs.map(item => {
        const selected = produitsSelectionnes.find(p => p.product_id === item.id);
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.productItem, { borderColor: selected ? theme.primary : theme.border }, selected && { backgroundColor: theme.primaryLight }]}
            onPress={() => toggleProduit(item.id, item.nom, item.prix_catalogue)}
          >
            <View style={styles.productInfo}>
              <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={22} color={selected ? theme.primary : theme.textTertiary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.productName, { color: theme.text }]}>{item.nom}</Text>
                <Text style={[styles.productPrice, { color: theme.textSecondary }]}>{item.prix_catalogue?.toLocaleString()} FCFA</Text>
              </View>
            </View>
            {selected && (
              <View style={styles.quantiteRow}>
                <TouchableOpacity onPress={() => updateQuantite(item.id, selected.quantite - 1)} style={[styles.qtyBtn, { backgroundColor: theme.surfaceVariant }]}>
                  <Ionicons name="remove" size={16} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: theme.text }]}>{selected.quantite}</Text>
                <TouchableOpacity onPress={() => updateQuantite(item.id, selected.quantite + 1)} style={[styles.qtyBtn, { backgroundColor: theme.primary }]}>
                  <Ionicons name="add" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {totalProduits > 0 && (
        <View style={[styles.recapSection, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.recapTitle, { color: theme.primary }]}>📋 Total produits: {totalProduits.toLocaleString()} FCFA</Text>
        </View>
      )}

      <Button
        title={isEditMode ? 'Modifier' : 'Enregistrer'}
        onPress={handleSubmit}
        loading={loadingSubmit}
        style={styles.saveButton}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingTop: 10 },
  title: { fontSize: 22, fontWeight: 'bold' },
  clientBadge: { padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 14 },
  clientBadgeText: { fontSize: 16, fontWeight: 'bold' },
  section: { padding: 16, borderRadius: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  productItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1.5, marginBottom: 8,
  },
  productInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { fontSize: 12, marginTop: 2 },
  quantiteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  recapSection: { padding: 14, borderRadius: 12, marginTop: 12, marginBottom: 16, alignItems: 'center' },
  recapTitle: { fontSize: 16, fontWeight: 'bold' },
  saveButton: { marginTop: 8 },
});