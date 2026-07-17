export const APP_NAME = 'Compta Social Commerce';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  COMMERCIAL: 'commercial' as const,
};

export const STATUTS_COMMANDE = {
  RECUE: 'recue' as const,
  LIVREE_PAYEE: 'livree_payee' as const,
  ANNULEE: 'annulee' as const,
};

export const TYPES_CHARGE = {
  PUBLICITE: 'publicite' as const,
  ECHANTILLON: 'echantillon' as const,
};

export const COMMISSION_MODES = {
  FORFAITAIRE: 'forfaitaire' as const,
  PAR_PRODUIT: 'par_produit' as const,
};

export const ACTIONS_ATTENTE = {
  ANNULEES: 'annulees' as const,
  REPORTEES: 'reportees' as const,
};

// Thème clair
export const LIGHT_THEME = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F4',
  primary: '#1A73E8',
  primaryLight: '#E8F0FE',
  secondary: '#34A853',
  secondaryLight: '#E6F4EA',
  danger: '#EA4335',
  dangerLight: '#FCE8E6',
  warning: '#FBBC04',
  warningLight: '#FEF7E0',
  text: '#202124',
  textSecondary: '#5F6368',
  textTertiary: '#9AA0A6',
  border: '#DADCE0',
  divider: '#E8EAED',
  statusRecue: '#FBBC04',
  statusLivree: '#34A853',
  statusAnnulee: '#EA4335',
};

// Thème sombre
export const DARK_THEME = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  primary: '#8AB4F8',
  primaryLight: '#1A3A5C',
  secondary: '#81C995',
  secondaryLight: '#1B3D28',
  danger: '#F28B82',
  dangerLight: '#3D1C1A',
  warning: '#FDD663',
  warningLight: '#3D3520',
  text: '#E8EAED',
  textSecondary: '#9AA0A6',
  textTertiary: '#5F6368',
  border: '#3C4043',
  divider: '#303134',
  statusRecue: '#FDD663',
  statusLivree: '#81C995',
  statusAnnulee: '#F28B82',
};

export const COMMISSION_DEFAUT = 1000;
export const FRAIS_LIVRAISON_DEFAUT = 1000;