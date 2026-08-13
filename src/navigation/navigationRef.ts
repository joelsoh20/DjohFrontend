// Réf de navigation globale, utilisable en dehors des composants React
// (ex: listener de notification qui doit rediriger l'utilisateur vers
// la commande/le message concerné, même si l'app vient d'être ouverte
// par un tap sur la notification).
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

interface NavigateToOrderOptions {
  isAdmin: boolean;
  isManager: boolean;
  orderId: string;
  openComments?: boolean;
}

/**
 * Oriente l'utilisateur vers la commande visée par une notification.
 * Les onglets "Commandes" (admin/manager) et "Accueil" (commercial)
 * contiennent tous deux l'écran "ListeCommandes" ; on y navigue avec
 * l'id de la commande pour filtrer la liste dessus et, si la
 * notification concerne un commentaire, ouvrir directement la
 * discussion correspondante.
 */
export function navigateToOrder({ isAdmin, isManager, orderId, openComments = false }: NavigateToOrderOptions): void {
  if (!orderId || !navigationRef.isReady()) return;

  const tab = (isAdmin || isManager) ? 'Commandes' : 'Accueil';

  navigationRef.navigate('Main', {
    screen: tab,
    params: {
      screen: 'ListeCommandes',
      params: { orderId, openComments },
    },
  });
}
