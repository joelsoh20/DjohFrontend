/**
 * Service worker de la PWA NDJOH AGOGO.
 *
 * Stratégie volontairement prudente :
 *  - Les fichiers de l'application (JS, CSS, icônes) sont mis en cache pour
 *    permettre un démarrage rapide et l'installation sur l'écran d'accueil.
 *  - Les appels à l'API ne sont JAMAIS mis en cache. C'est délibéré : cette
 *    application affiche des chiffres comptables, des stocks et des statuts
 *    de commandes. Servir une réponse en cache afficherait des montants
 *    périmés (ex : une commande déjà livrée affichée comme en attente), ce
 *    qui serait pire que d'afficher une erreur réseau.
 *
 * Changer CACHE_VERSION force la mise à jour du cache chez tous les
 * utilisateurs (à faire à chaque déploiement).
 */

const CACHE_VERSION = 'ndjoh-v1';
const FICHIERS_COQUILLE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      // addAll échoue en bloc si un seul fichier manque : on ajoute donc
      // fichier par fichier en ignorant les échecs individuels.
      .then((cache) =>
        Promise.all(
          FICHIERS_COQUILLE.map((url) => cache.add(url).catch(() => null))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) =>
        Promise.all(
          cles.filter((c) => c !== CACHE_VERSION).map((c) => caches.delete(c))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requete = event.request;

  // Seules les requêtes GET sont éligibles au cache.
  if (requete.method !== 'GET') return;

  const url = new URL(requete.url);

  // Ne jamais mettre en cache les appels API (données métier vivantes).
  if (url.pathname.startsWith('/api') || url.pathname.includes('/api/')) {
    return;
  }

  // Requêtes vers un autre domaine (ex : le backend Render) : on laisse
  // passer sans intervenir.
  if (url.origin !== self.location.origin) return;

  // Navigation (ouverture de l'app / rechargement) : on privilégie le
  // réseau pour récupérer la dernière version, avec repli sur le cache
  // quand l'utilisateur est hors ligne.
  if (requete.mode === 'navigate') {
    event.respondWith(
      fetch(requete)
        .then((reponse) => {
          const copie = reponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('/', copie));
          return reponse;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Ressources statiques : cache d'abord, réseau ensuite.
  event.respondWith(
    caches.match(requete).then((enCache) => {
      if (enCache) return enCache;
      return fetch(requete).then((reponse) => {
        if (reponse && reponse.status === 200 && reponse.type === 'basic') {
          const copie = reponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(requete, copie));
        }
        return reponse;
      });
    })
  );
});
