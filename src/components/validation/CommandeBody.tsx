// Corps de la carte (infos client, produit...)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Commande } from '../../types';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommandeBodyProps {
  commande: Commande;
}

// Ligne d'information simple
const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  bold?: boolean;
}> = ({ icon, label, value, bold = false }) => {
  const { theme } = useTheme();

  return (
    <View style={bodyStyles.row}>
      <Ionicons name={icon} size={16} color={theme.textTertiary} />
      <Text style={[bodyStyles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text
        style={[bold ? bodyStyles.valueBold : bodyStyles.value, { color: theme.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

export const CommandeBody: React.FC<CommandeBodyProps> = ({ commande }) => {
  const { theme } = useTheme();

  const items = [
    {
      icon: 'person-outline' as const,
      label: 'Client:',
      value: commande.client_nom || '-',
    },
    ...(commande.client_quartier
      ? [
          {
            icon: 'location-outline' as const,
            label: 'Lieu:',
            value: commande.client_quartier,
          },
        ]
      : []),
    {
      icon: 'cube-outline' as const,
      label: 'Produit:',
      value: `${commande.produit?.nom || '-'} x${commande.quantite || 1}`,
    },
    {
      icon: 'cash-outline' as const,
      label: 'Prix:',
      value: formatMonnaie((commande.prix_unitaire_reel || 0) * (commande.quantite || 1)),
      bold: true,
    },
    {
      icon: 'bicycle-outline' as const,
      label: 'Livreur:',
      value: `${commande.livreur?.nom || '-'} • Frais: ${formatMonnaie(commande.frais_livraison || 0)}`,
    },
    {
      icon: 'person-circle-outline' as const,
      label: 'Com:',
      value: `${commande.commercial?.nom || '-'} • ${formatMonnaie(commande.commission_commercial || 0)}`,
    },
  ];

  return (
    <View style={bodyStyles.container}>
      {items.map((item, index) => (
        <InfoRow key={index} {...item} />
      ))}
    </View>
  );
};

const bodyStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    width: 55,
  },
  value: {
    fontSize: 13,
    flex: 1,
  },
  valueBold: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
});