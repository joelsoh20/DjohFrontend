import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW_CARD } from '../utils/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: object;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style
}) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'secondary': return { bg: theme.secondary, text: '#FFFFFF' };
      case 'danger': return { bg: theme.danger, text: '#FFFFFF' };
      case 'outline': return { bg: 'transparent', text: theme.primary, border: theme.primary };
      default: return { bg: theme.primary, text: '#FFFFFF' };
    }
  };

  const colors = getColors();
  const isSolid = variant !== 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.bg, borderColor: colors.border || 'transparent', borderWidth: colors.border ? 1.5 : 0 },
        isSolid && !disabled && !loading && SHADOW_CARD,
        (disabled || loading) && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
});