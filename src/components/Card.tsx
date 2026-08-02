import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, SHADOW_CARD } from '../utils/designSystem';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevated?: boolean;
}

/**
 * Conteneur "carte" cohérent : fond theme.surface, coins arrondis,
 * ombre douce. À utiliser à la place d'un View stylé à la main pour
 * toute section encadrée (résumés, listes de stats, formulaires courts).
 */
export const Card: React.FC<CardProps> = ({ children, style, padding = SPACING.lg, elevated = false }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: RADIUS.lg,
          padding,
        },
        SHADOW_CARD,
        style,
      ]}
    >
      {children}
    </View>
  );
};
