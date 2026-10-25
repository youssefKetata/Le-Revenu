// Stable document IDs let the seed recognize records even after dashboard edits.
export const demoUsers = [
  {
    key: 'camille',
    documentId: 'a10000000000000000000001',
    username: 'camille_demo',
    email: 'camille.demo@example.test',
    passwordEnv: 'DEMO_CAMILLE_PASSWORD',
  },
  {
    key: 'thomas',
    documentId: 'a10000000000000000000002',
    username: 'thomas_demo',
    email: 'thomas.demo@example.test',
    passwordEnv: 'DEMO_THOMAS_PASSWORD',
  },
] as const;

export const demoCategories = [
  {
    documentId: 'b10000000000000000000001',
    name: 'Bourse',
    slug: 'bourse',
    description: 'Échanger sur les marchés, les entreprises et le suivi de portefeuille.',
    icon: 'chart',
    color: '#C62828',
  },
  {
    documentId: 'b10000000000000000000002',
    name: 'Immobilier',
    slug: 'immobilier',
    description: 'Partager ses questions et ses expériences autour de l’immobilier.',
    icon: 'home',
    color: '#1565C0',
  },
  {
    documentId: 'b10000000000000000000003',
    name: 'Épargne',
    slug: 'epargne',
    description: 'Discuter de ses projets et de l’organisation de son épargne.',
    icon: 'wallet',
    color: '#2E7D32',
  },
  {
    documentId: 'b10000000000000000000004',
    name: 'Fiscalité',
    slug: 'fiscalite',
    description: 'Poser ses questions sur les démarches et les documents fiscaux.',
    icon: 'file',
    color: '#7B1FA2',
  },
] as const;

export const demoDiscussions = [
  {
    documentId: 'c10000000000000000000001',
    title: 'Comment organisez-vous le suivi de votre portefeuille ?',
    content: 'Je cherche une méthode simple pour garder une vue d’ensemble de mon portefeuille.\n\nUtilisez-vous un tableur, un carnet ou un outil dédié ? Quels éléments suivez-vous au fil des mois ?',
    type: 'question',
    author: 'camille',
    category: 'bourse',
  },
  {
    documentId: 'c10000000000000000000002',
    title: 'Quels documents préparer avant une visite immobilière ?',
    content: 'Je prépare mes premières visites et je voudrais mieux organiser mes questions.\n\nQuels documents demandez-vous pour comprendre un bien et sa copropriété ? Vos retours d’expérience m’intéressent.',
    type: 'question',
    author: 'thomas',
    category: 'immobilier',
  },
  {
    documentId: 'c10000000000000000000003',
    title: 'Vos habitudes pour faire le point sur vos projets d’épargne',
    content: 'J’aimerais échanger sur la façon dont chacun suit ses projets personnels.\n\nPrenez-vous un moment chaque mois pour revoir vos objectifs ? Je cherche surtout des idées d’organisation.',
    type: 'discussion',
    author: 'camille',
    category: 'epargne',
  },
  {
    documentId: 'c10000000000000000000004',
    title: 'Comment classez-vous vos justificatifs pour la déclaration ?',
    content: 'Entre les documents papier et les fichiers numériques, je finis souvent par chercher mes justificatifs au dernier moment.\n\nAvez-vous une méthode de classement facile à maintenir pendant l’année ?',
    type: 'question',
    author: 'thomas',
    category: 'fiscalite',
  },
  {
    documentId: 'c10000000000000000000005',
    title: 'Quel format préférez-vous pour lire un rapport annuel ?',
    content: 'Je découvre les rapports annuels et leurs différents formats.\n\nPréférez-vous le PDF complet, la version web ou une lecture par sections ? Je serais curieuse de connaître vos habitudes.',
    type: 'discussion',
    author: 'camille',
    category: 'bourse',
  },
] as const;

// The last discussion intentionally has no replies.
export const demoReplies = [
  {
    documentId: 'd10000000000000000000001',
    content: 'J’utilise un tableur avec une page de synthèse. Je note surtout les dates et les opérations pour pouvoir retrouver mon historique.',
    author: 'thomas',
    discussion: 'c10000000000000000000001',
  },
  {
    documentId: 'd10000000000000000000002',
    content: 'Merci pour ce retour ! Une page de synthèse et un historique séparé semblent plus simples à tenir que mon fichier actuel.',
    author: 'camille',
    discussion: 'c10000000000000000000001',
  },
  {
    documentId: 'd10000000000000000000003',
    content: 'Je prépare une liste de questions avant chaque visite et je garde les documents reçus dans un dossier par bien. Cela m’aide à comparer mes notes ensuite.',
    author: 'camille',
    discussion: 'c10000000000000000000002',
  },
  {
    documentId: 'd10000000000000000000004',
    content: 'Je fais un point en fin de mois avec une liste de projets. Le plus utile pour moi est de noter ce qui a changé depuis le mois précédent.',
    author: 'thomas',
    discussion: 'c10000000000000000000003',
  },
  {
    documentId: 'd10000000000000000000005',
    content: 'Je range les fichiers dans un dossier par année, avec la date et le nom de l’organisme dans chaque nom de fichier. Je garde aussi une liste des documents encore attendus.',
    author: 'camille',
    discussion: 'c10000000000000000000004',
  },
] as const;
