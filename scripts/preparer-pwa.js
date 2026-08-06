/**
 * Injecte les balises PWA dans le index.html généré par `expo export`.
 *
 * Pourquoi ce script : Expo génère lui-même index.html et ne permet pas
 * d'y ajouter des balises <meta> arbitraires pour une app qui n'utilise pas
 * Expo Router. Or iOS ignore complètement manifest.json : sans les balises
 * `apple-*` ci-dessous, l'app s'ouvre dans Safari avec la barre d'adresse
 * au lieu de s'afficher en plein écran comme une vraie application.
 *
 * Lancement automatique via `npm run build:web`.
 */

const fs = require('fs');
const path = require('path');

const DOSSIER_DIST = path.join(__dirname, '..', 'dist');
const FICHIER_HTML = path.join(DOSSIER_DIST, 'index.html');

// theme-color n'est pas listée ici : Expo l'ajoute déjà automatiquement
// à partir de app.json (l'ajouter à nouveau créerait un doublon).
const BALISES_PWA = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes" />

    <!-- iOS : Safari ignore manifest.json, ces balises sont indispensables -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="NDJOH AGOGO" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
`;

function main() {
  if (!fs.existsSync(FICHIER_HTML)) {
    console.error(`❌ ${FICHIER_HTML} introuvable. Lancez d'abord "expo export --platform web".`);
    process.exit(1);
  }

  let html = fs.readFileSync(FICHIER_HTML, 'utf-8');

  if (html.includes('apple-mobile-web-app-capable')) {
    console.log('ℹ️  Balises PWA déjà présentes, rien à faire.');
    return;
  }

  if (!html.includes('</head>')) {
    console.error('❌ Aucune balise </head> trouvée dans index.html.');
    process.exit(1);
  }

  html = html.replace('</head>', `${BALISES_PWA}  </head>`);
  fs.writeFileSync(FICHIER_HTML, html, 'utf-8');

  console.log('✅ Balises PWA injectées dans dist/index.html');

  // Vérification que les fichiers indispensables ont bien été copiés
  const attendus = [
    'manifest.json',
    'sw.js',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/apple-touch-icon.png',
  ];
  const manquants = attendus.filter((f) => !fs.existsSync(path.join(DOSSIER_DIST, f)));

  if (manquants.length > 0) {
    console.warn(`⚠️  Fichiers manquants dans dist/ : ${manquants.join(', ')}`);
    console.warn('   Vérifiez que le dossier public/ est bien présent à la racine du projet.');
  } else {
    console.log('✅ manifest.json, sw.js et icônes présents dans dist/');
  }
}

main();
