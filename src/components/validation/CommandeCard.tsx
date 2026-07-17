import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { Commande } from '../../types';
import { CommandeHeader } from './CommandeHeader';
import { CommandeBody } from './CommandeBody';
import { CommandeActions } from './CommandeActions';
import { formatMonnaie } from '../../utils/formatMonnaie';

interface CommandeCardProps {
  commande: Commande;
  loading: boolean;
  onValider: (fraisLivraison: number, serviceId?: string) => void;
  onAnnuler: () => void;
  onCopy?: (commande: Commande) => void;
}

export const CommandeCard: React.FC<CommandeCardProps> = ({
  commande, loading, onValider, onAnnuler,
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
  const message = `*NDJOH AGOGO*\n\n*Nature du produit* :\n${(commande as any).produits?.map((p: string) => ` ${p}`).join('\n') || (commande as any).produit?.nom || 'N/A'}\n\n*Numéro du client* :\n${commande.client_telephone || 'N/A'}\n\n*Adresse de livraison*\n${commande.client_quartier || 'N/A'}\n\n*Montant à percevoir*\n${formatMonnaie(Number(commande.prix_unitaire_reel) * commande.quantite)}`;

  await Clipboard.setStringAsync(message);
  setCopied(true);
  Alert.alert('Copié !', 'Message prêt à être collé dans WhatsApp');
  setTimeout(() => setCopied(false), 2000);
};

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <CommandeHeader id={commande.id} dateCreation={commande.date_creation} />
      <CommandeBody commande={commande} />
      
      {/* Bouton copier */}
      <TouchableOpacity style={[styles.copyBtn, { backgroundColor: theme.primaryLight }]} onPress={handleCopy}>
        <Ionicons name="copy-outline" size={18} color={theme.primary} />
        <Text style={[styles.copyText, { color: theme.primary }]}>
          {copied ? 'Copié !' : 'Copier pour WhatsApp'}
        </Text>
      </TouchableOpacity>

      <CommandeActions onValider={onValider} onAnnuler={onAnnuler} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10, marginTop: 10 },
  copyText: { fontSize: 13, fontWeight: '600' },
});