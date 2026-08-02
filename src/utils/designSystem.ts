/**
 * Design tokens partagés pour moderniser l'interface tout en gardant la
 * palette de couleurs actuelle (LIGHT_THEME/DARK_THEME dans constants.ts).
 * Objectif : cohérence des espacements, rayons et ombres sur tout l'app,
 * au lieu de valeurs légèrement différentes copiées-collées dans chaque
 * écran (borderRadius 12 ici, 14 là, 16 ailleurs...).
 */
import { Platform } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
} as const;

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Ombre douce et cohérente pour toutes les cartes (au lieu de valeurs
// d'élévation différentes selon les écrans). iOS utilise shadow*, Android
// utilise elevation — les deux sont fournis.
export const SHADOW_CARD = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

export const SHADOW_ELEVATED = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  android: {
    elevation: 6,
  },
  default: {},
});
