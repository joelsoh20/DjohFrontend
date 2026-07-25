import React, { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { stockService } from '../../services/stockService';
import { produitService } from '../../services/produitService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StockScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAdmin, utilisateur } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantite, setQuantite] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const isManager = utilisateur?.role === 'manager';
  const canEdit = isAdmin || isManager;

  const charger = async () => {
    try {
      const [stocksRes, produitsRes] = await Promise.all([
        stockService.getAll(),
        produitService.getAll()
      ]);
      if (stocksRes.success) setStocks(stocksRes.data || []);
      if (produitsRes.success) setProduits((produitsRes.data || []).filter((p: any) => p.actif));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleAjouter = async () => {
  if (loadingSubmit) return; // ← Ici, avant tout
  if (!canEdit) {
    Alert.alert('Accès refusé', 'Vous ne pouvez pas modifier le stock.');
    return;
  }
  if (!selectedProduct || !quantite) {
    Alert.alert('Erreur', 'Sélectionnez un produit et une quantité');
    return;
  }
  setLoadingSubmit(true);
  try {
    await stockService.ajouter(selectedProduct, parseInt(quantite));
    Alert.alert('Succès', 'Stock mis à jour');
    setQuantite('');
    charger();
  } catch (err: any) {
    Alert.alert('Erreur', err.response?.data?.message || 'Erreur');
  } finally {
    setLoadingSubmit(false);
  }
};

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {canEdit && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>📦 Ajouter du stock</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
            {produits.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.productChip, { backgroundColor: selectedProduct === p.id ? theme.primary : theme.surfaceVariant }]}
                onPress={() => setSelectedProduct(p.id)}
              >
                <Text style={[styles.productChipText, { color: selectedProduct === p.id ? '#FFF' : theme.text }]}>{p.nom}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input label="Quantité" value={quantite} onChangeText={setQuantite} keyboardType="numeric" placeholder="Ex: 10" />
          <Button title="Ajouter au stock" onPress={handleAjouter} loading={loadingSubmit} />
        </View>
      )}

      <Text style={[styles.title, { color: theme.text, paddingHorizontal: 16, marginTop: 20 }]}>📋 Stock actuel</Text>
      <FlatList
        data={stocks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.stockItem, { backgroundColor: theme.surface }]}>
            <View>
              <Text style={[styles.stockName, { color: theme.text }]}>{item.produit?.nom || 'Inconnu'}</Text>
            </View>
            <Text style={[styles.stockQty, { color: item.quantite > 0 ? theme.secondary : theme.danger }]}>
              {item.quantite} en stock
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, padding: 16, borderRadius: 14 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  productList: { marginBottom: 12 },
  productChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  productChipText: { fontSize: 13, fontWeight: '500' },
  stockItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8 },
  stockName: { fontSize: 14, fontWeight: '600' },
  stockQty: { fontSize: 16, fontWeight: 'bold' },
});