import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface CalendrierModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  dateInitiale?: Date;
  dateMax?: Date;
}

const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const memeJour = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const CalendrierModal: React.FC<CalendrierModalProps> = ({
  visible, onClose, onSelect, dateInitiale, dateMax
}) => {
  const { theme } = useTheme();
  const aujourdHui = new Date();
  const [moisAffiche, setMoisAffiche] = useState(new Date(dateInitiale || aujourdHui));
  const maxDate = dateMax || aujourdHui;

  const annee = moisAffiche.getFullYear();
  const mois = moisAffiche.getMonth();

  const premierJourMois = new Date(annee, mois, 1);
  // Index Lundi=0 ... Dimanche=6 (au lieu de Dimanche=0 par défaut en JS)
  const decalage = (premierJourMois.getDay() + 6) % 7;
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  const cases: (number | null)[] = [
    ...Array(decalage).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ];

  const changerMois = (delta: number) => {
    setMoisAffiche(new Date(annee, mois + delta, 1));
  };

  const moisSuivantAutorise = new Date(annee, mois + 1, 1) <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => changerMois(-1)} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {MOIS_NOMS[mois]} {annee}
            </Text>
            <TouchableOpacity
              onPress={() => moisSuivantAutorise && changerMois(1)}
              style={styles.navBtn}
              disabled={!moisSuivantAutorise}
            >
              <Ionicons name="chevron-forward" size={22} color={moisSuivantAutorise ? theme.text : theme.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.joursRow}>
            {JOURS.map((j, i) => (
              <Text key={i} style={[styles.jourLabel, { color: theme.textTertiary }]}>{j}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cases.map((jour, i) => {
              if (jour === null) return <View key={i} style={styles.case} />;

              const date = new Date(annee, mois, jour);
              const estFutur = date > maxDate;
              const estSelectionne = dateInitiale && memeJour(date, dateInitiale);
              const estAujourdHui = memeJour(date, aujourdHui);

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.case,
                    estSelectionne && { backgroundColor: theme.primary, borderRadius: 20 },
                  ]}
                  disabled={estFutur}
                  onPress={() => { onSelect(date); onClose(); }}
                >
                  <Text style={[
                    styles.caseText,
                    { color: estSelectionne ? '#FFF' : estFutur ? theme.textTertiary : theme.text },
                    estAujourdHui && !estSelectionne && { color: theme.primary, fontWeight: 'bold' },
                  ]}>
                    {jour}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  joursRow: { flexDirection: 'row', marginBottom: 4 },
  jourLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  case: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseText: { fontSize: 14 },
});
