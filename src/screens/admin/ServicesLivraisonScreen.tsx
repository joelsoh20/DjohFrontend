import React, { useState } from 'react';
import { View, FlatList, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { serviceLivraisonService } from '../../services/serviceLivraisonService';
import { produitService } from '../../services/produitService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useFocusEffect } from '@react-navigation/native';

export const ServicesLivraisonScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAdmin, utilisateur } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [nom, setNom] = useState('');
  const [contact, setContact] = useState('');
  const [zone, setZone] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showStock, setShowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantite, setQuantite] = useState('');

  const isManager = utilisateur?.role === 'manager';
  const canEdit = isAdmin || isManager;

  const charger = async () => {
    try {
      const [servRes, prodRes] = await Promise.all([
        serviceLivraisonService.getAll(),
        produitService.getAll()
      ]);
      if (servRes.success) setServices(servRes.data || []);
      if (prodRes.success) setProduits((prodRes.data || []).filter((p: any) => p.actif));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useFocusEffect(React.useCallback(() => { charger(); }, []));

  const handleCreate = async () => {
    if (!nom.trim()) return;
    await serviceLivraisonService.create({ nom: nom.trim(), contact, zone });
    Alert.alert('Succès', 'Service créé');
    setNom(''); setContact(''); setZone(''); setShowAdd(false);
    charger();
  };

  const handleAjouterStock = async () => {
    if (!selectedProduct || !quantite || !selectedService) return;
    await serviceLivraisonService.ajouterStock(selectedService.id, selectedProduct, parseInt(quantite));
    Alert.alert('Succès', 'Stock ajouté');
    setQuantite(''); setSelectedProduct(null);
    charger();
  };

  const handleToggle = async (id: string) => {
    if (!isAdmin) {
      Alert.alert('Accès refusé', 'Seul l\'administrateur peut activer/désactiver un service.');
      return;
    }
    await serviceLivraisonService.toggleActif(id);
    charger();
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const renderService = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.serviceName, { color: theme.text }]}>{item.nom}</Text>
          <Text style={[styles.serviceInfo, { color: theme.textSecondary }]}>
            {item.contact || 'Sans contact'} • {item.zone || 'Sans zone'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {canEdit && (
            <TouchableOpacity
              style={[styles.stockBtn, { backgroundColor: theme.primaryLight }]}
              onPress={() => { setSelectedService(item); setShowStock(true); }}
            >
              <Ionicons name="cube" size={18} color={theme.primary} />
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity onPress={() => handleToggle(item.id)}>
              <Ionicons name={item.actif ? 'eye' : 'eye-off'} size={20} color={item.actif ? theme.secondary : theme.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {(item.stocks || []).length > 0 && (
        <View style={[styles.stocksContainer, { backgroundColor: theme.surfaceVariant }]}>
          <Text style={[styles.stocksTitle, { color: theme.textSecondary }]}>📦 STOCK DU SERVICE</Text>
          {item.stocks.map((s: any) => {
            const isLow = s.quantite <= 5;
            const isOut = s.quantite <= 0;
            return (
              <View key={s.id} style={[styles.stockRow, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.stockProdName, { color: theme.text }]}>{s.produit?.nom || 'Inconnu'}</Text>
                <View style={[styles.stockQtyBadge, { backgroundColor: isOut ? theme.dangerLight : isLow ? theme.warningLight : theme.secondaryLight }]}>
                  <Text style={[styles.stockQtyText, { color: isOut ? theme.danger : isLow ? theme.warning : theme.secondary }]}>
                    {s.quantite} en stock
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {canEdit && (
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.addBtnText}>Ajouter un service</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: theme.textTertiary, textAlign: 'center', marginTop: 40 }}>Aucun service</Text>}
      />

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nouveau service</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.surfaceVariant, color: theme.text }]} placeholder="Nom" placeholderTextColor={theme.textTertiary} value={nom} onChangeText={setNom} />
            <TextInput style={[styles.input, { backgroundColor: theme.surfaceVariant, color: theme.text }]} placeholder="Contact" placeholderTextColor={theme.textTertiary} value={contact} onChangeText={setContact} />
            <TextInput style={[styles.input, { backgroundColor: theme.surfaceVariant, color: theme.text }]} placeholder="Zone" placeholderTextColor={theme.textTertiary} value={zone} onChangeText={setZone} />
            <View style={styles.modalBtns}>
              <Button title="Annuler" onPress={() => setShowAdd(false)} variant="outline" />
              <Button title="Créer" onPress={handleCreate} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showStock} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Stock - {selectedService?.nom}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {produits.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.chip, { backgroundColor: selectedProduct === p.id ? theme.primary : theme.surfaceVariant }]}
                  onPress={() => setSelectedProduct(p.id)}
                >
                  <Text style={{ color: selectedProduct === p.id ? '#FFF' : theme.text }}>{p.nom}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={[styles.input, { backgroundColor: theme.surfaceVariant, color: theme.text }]} placeholder="Quantité" keyboardType="numeric" value={quantite} onChangeText={setQuantite} />
            <View style={styles.modalBtns}>
              <Button title="Fermer" onPress={() => setShowStock(false)} variant="outline" />
              {canEdit && <Button title="Ajouter" onPress={handleAjouterStock} />}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, padding: 14, borderRadius: 12 },
  addBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  card: { padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceName: { fontSize: 16, fontWeight: '700' },
  serviceInfo: { fontSize: 12, marginTop: 2 },
  stockBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stocksContainer: { marginTop: 12, padding: 12, borderRadius: 10 },
  stocksTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  stockProdName: { fontSize: 14, fontWeight: '500', flex: 1 },
  stockQtyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockQtyText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8 },
});