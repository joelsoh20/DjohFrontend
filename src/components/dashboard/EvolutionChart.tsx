// Graphique d'évolution sur 6 mois
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { EvolutionMensuelle } from '../../types';
import { formatNombre } from '../../utils/formatMonnaie';

const screenWidth = Dimensions.get('window').width;

interface EvolutionChartProps {
  data: EvolutionMensuelle[];
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  if (!data || data.length === 0) return null;

  const labels = data.map(e => e.mois.substring(0, 3));
  const caData = data.map(e => e.chiffreAffaires);
  const beneficeData = data.map(e => e.beneficeNet);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        📈 {t('dashboard.evolution')}
      </Text>

      <LineChart
        data={{
          labels,
          datasets: [
            { data: caData, color: () => theme.primary, strokeWidth: 2 },
            { data: beneficeData, color: () => theme.secondary, strokeWidth: 2 },
          ],
        }}
        width={screenWidth - 72}
        height={200}
        chartConfig={{
          backgroundColor: theme.surface,
          backgroundGradientFrom: theme.surface,
          backgroundGradientTo: theme.surface,
          decimalPlaces: 0,
          color: (opacity = 1) =>
            isDark
              ? `rgba(255,255,255,${opacity * 0.7})`
              : `rgba(0,0,0,${opacity * 0.5})`,
          labelColor: () => theme.textSecondary,
          propsForDots: { r: '4', strokeWidth: '1' },
          formatYLabel: (value: string) => formatNombre(parseInt(value)),
        }}
        bezier
        style={styles.chart}
      />

      {/* Légende */}
      <View style={styles.legend}>
        <LegendItem color={theme.primary} label="CA" />
        <LegendItem color={theme.secondary} label={t('dashboard.netProfit')} />
      </View>
    </View>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => {
  const { theme } = useTheme();

  return (
    <View style={legendStyles.item}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <Text style={[legendStyles.text, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
};

const legendStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: { fontSize: 12 },
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
  },
});