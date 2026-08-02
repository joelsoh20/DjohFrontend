import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW_CARD } from '../../utils/designSystem';

interface MenuItem {
  icon: string;
  label: string;
  screen: string;
  color: string;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

export const GestionAccueilScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isAdmin, isManager } = useAuth();

  const menuItems: MenuItem[] = [
  { icon: 'cube', label: 'Stock', screen: 'Stock', color: '#34A853' },
  { icon: 'bicycle', label: 'Services de livraison', screen: 'ServicesLivraison', color: '#FF6B35' },
  { icon: 'stats-chart', label: 'Stats livraison', screen: 'StatsLivraison', color: '#00897B' },
  { icon: 'cash', label: 'Encaissements livraison', screen: 'StatsLivraisonJour', color: '#F9A825' },
  { icon: 'cube', label: 'Produits', screen: 'Produits', color: '#1A73E8', adminOnly: true },
  { icon: 'people', label: 'Utilisateurs', screen: 'Utilisateurs', color: '#7C4DFF' },
  { icon: 'settings', label: 'Commissions', screen: 'Commissions', color: '#E91E63', adminOnly: true },
];

  const items = menuItems.filter(item => (!item.adminOnly || isAdmin) && (!item.managerOnly || isManager));

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
            activeOpacity={0.7}
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
    paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: SPACING.lg, gap: SPACING.md + 2,
  },
  card: {
    width: '46%', padding: SPACING.xl, borderRadius: RADIUS.lg,
    alignItems: 'center', gap: SPACING.sm + 2,
    ...SHADOW_CARD,
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, textAlign: 'center' },
});