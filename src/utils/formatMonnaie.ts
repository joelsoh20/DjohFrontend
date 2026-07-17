export const formatMonnaie = (montant: number): string => {
  if (isNaN(montant)) return '0 FCFA';
  return Math.round(montant).toLocaleString('fr-FR') + ' FCFA';
};

export const formatNombre = (montant: number): string => {
  if (isNaN(montant)) return '0';
  return Math.round(montant).toLocaleString('fr-FR');
};