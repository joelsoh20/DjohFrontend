import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Commande } from '../../types';
import { LivreurGroupHeader } from './LivreurGroupHeader';
import { CommandeCard } from './CommandeCard';

interface LivreurGroupProps {
  nom: string;
  commandes: Commande[];
  actionLoading: string | null;
  validateAllLoading: boolean;
  onValider: (id: string) => Promise<void>;
  onAnnuler: (id: string) => void;
  onValidateAll: (ids: string[]) => Promise<void>;
}

export const LivreurGroup: React.FC<LivreurGroupProps> = ({
  nom,
  commandes,
  actionLoading,
  validateAllLoading,
  onValider,
  onAnnuler,
  onValidateAll,
}) => {
  const commandeIds = commandes.map(c => c.id);

  return (
    <View style={styles.container}>
      <LivreurGroupHeader
        nom={nom}
        count={commandes.length}
        onValidateAll={() => onValidateAll(commandeIds)}
        loading={validateAllLoading}
      />

      {commandes.map(commande => (
        <CommandeCard
          key={commande.id}
          commande={commande}
          loading={actionLoading === commande.id}
          onValider={() => onValider(commande.id)}
          onAnnuler={() => onAnnuler(commande.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});