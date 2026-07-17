// Section générique (thème, langue...)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Type pour une option simple (navigation)
interface OptionNavigation {
  type: 'navigation';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color?: string;
  onPress: () => void;
}

// Type pour une option switch (toggle)
interface OptionSwitch {
  type: 'switch';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  color?: string;
  onToggle: (value: boolean) => void;
}

// Type pour un sélecteur de choix
interface OptionSelect {
  type: 'select';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  color?: string;
  onSelect: (value: string) => void;
}

type ParametreOption = OptionNavigation | OptionSwitch | OptionSelect;

interface SectionParametreProps {
  title: string;
  options: ParametreOption[];
}

export const SectionParametre: React.FC<SectionParametreProps> = ({ title, options }) => {
  const { theme } = useTheme();

  const renderOption = (option: ParametreOption, index: number) => {
    const isLast = index === options.length - 1;

    if (option.type === 'switch') {
      return (
        <View
          key={index}
          style={[
            styles.optionRow,
            { borderBottomColor: theme.divider },
            isLast && styles.lastOption,
          ]}
        >
          <View style={styles.optionLeft}>
            <View style={[styles.iconCircle, { backgroundColor: (option.color || theme.primary) + '15' }]}>
              <Ionicons name={option.icon} size={18} color={option.color || theme.primary} />
            </View>
            <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
          </View>
          <Switch
            value={option.value}
            onValueChange={option.onToggle}
            trackColor={{ false: theme.surfaceVariant, true: theme.primaryLight }}
            thumbColor={option.value ? theme.primary : theme.textTertiary}
          />
        </View>
      );
    }

    if (option.type === 'select') {
      return (
        <View
          key={index}
          style={[
            styles.optionRow,
            { borderBottomColor: theme.divider },
            isLast && styles.lastOption,
          ]}
        >
          <View style={styles.optionLeft}>
            <View style={[styles.iconCircle, { backgroundColor: (option.color || theme.primary) + '15' }]}>
              <Ionicons name={option.icon} size={18} color={option.color || theme.primary} />
            </View>
            <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
          </View>
          <View style={styles.selectRow}>
            {option.options.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.selectChip,
                  {
                    backgroundColor: option.value === opt.value ? theme.primary : theme.surfaceVariant,
                  },
                ]}
                onPress={() => option.onSelect(opt.value)}
              >
                <Text
                  style={[
                    styles.selectChipText,
                    { color: option.value === opt.value ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // type === 'navigation'
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.optionRow,
          { borderBottomColor: theme.divider },
          isLast && styles.lastOption,
        ]}
        onPress={option.onPress}
        activeOpacity={0.6}
      >
        <View style={styles.optionLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: (option.color || theme.primary) + '15' },
            ]}
          >
            <Ionicons name={option.icon} size={18} color={option.color || theme.primary} />
          </View>
          <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
        </View>
        <View style={styles.optionRight}>
          {option.value && (
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>
              {option.value}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {options.map((option, index) => renderOption(option, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionValue: {
    fontSize: 13,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 4,
  },
  selectChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selectChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});