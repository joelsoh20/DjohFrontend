import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  icon: string;
  label: string;
  screen: string;
  color: string;
  adminOnly?: boolean;
}

export const GestionAccueilScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  const menuItems: MenuItem[] = [
  { icon: 'cube', label: 'Stock', screen: 'Stock', color: '#34A853' },
  { icon: 'bicycle', label: 'Services de livraison', screen: 'ServicesLivraison', color: '#FF6B35' },
  { icon: 'cube', label: 'Produits', screen: 'Produits', color: '#1A73E8', adminOnly: true },
  { icon: 'people', label: 'Utilisateurs', screen: 'Utilisateurs', color: '#7C4DFF' },
  { icon: 'settings', label: 'Commissions', screen: 'Commissions', color: '#E91E63', adminOnly: true },
];

  const items = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Ionicons name="settings" size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Gestion</Text>
      </View>

      <View style={styles.grid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 16, gap: 14,
  },
  card: {
    width: '46%', padding: 20, borderRadius: 14,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});