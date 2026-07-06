export type AdminSectionMeta = {
  title: string;
  description?: string;
  apiResource?: string;
};

/** Clé = chemin sans slash initial (ex. `utilisateurs/adresses`). */
export const adminSectionsRegistry: Record<string, AdminSectionMeta> = {
  utilisateurs: {
    title: 'Utilisateurs',
    description: 'Gestion des comptes clients et administrateurs.',
    apiResource: 'users',
  },
  'utilisateurs/employes': {
    title: 'Employés',
    description: 'Profils employés liés aux organisations.',
    apiResource: 'employees',
  },
  'utilisateurs/adresses': {
    title: 'Adresses',
    description: 'Adresses enregistrées par les utilisateurs.',
    apiResource: 'user-addresses',
  },
  'utilisateurs/moyens-paiement': {
    title: 'Moyens de paiement',
    description: 'Cartes et moyens de paiement enregistrés.',
    apiResource: 'user-payment-methods',
  },
  'utilisateurs/sessions': {
    title: 'Sessions',
    description: 'Sessions actives et historique de connexion.',
    apiResource: 'user-sessions',
  },
  'utilisateurs/journaux-securite': {
    title: 'Journaux de sécurité',
    description: 'Événements de sécurité et audit d’accès.',
    apiResource: 'rbac-audit-logs',
  },
  'fidelite/comptes': {
    title: 'Comptes fidélité',
    description: 'Programme OneKey — points et récompenses.',
    apiResource: 'loyalty-accounts',
  },
  hebergements: {
    title: 'Hébergements',
    description: 'Propriétés, chambres, équipements et calendrier de disponibilités.',
    apiResource: 'properties',
  },
  'hebergements/equipements': {
    title: 'Équipements',
    description: 'Catalogue global des équipements (amenities).',
    apiResource: 'amenities',
  },
  'produits/vols': {
    title: 'Vols',
    description: 'Compagnies, aéroports, vols, classes et disponibilités.',
    apiResource: 'flights',
  },
  'produits/vols/compagnies': {
    title: 'Compagnies aériennes',
    description: 'Référentiel des compagnies (IATA).',
    apiResource: 'airlines',
  },
  'produits/vols/aeroports': {
    title: 'Aéroports',
    description: 'Référentiel des aéroports (IATA).',
    apiResource: 'airports',
  },
  'produits/vols/nouveau': {
    title: 'Nouveau vol',
    apiResource: 'flights',
  },
  'produits/locations': {
    title: 'Locations véhicules',
    description: 'Agences, catégories, véhicules et disponibilités par dates.',
    apiResource: 'vehicles',
  },
  'produits/locations/agences': {
    title: 'Agences de location',
    description: 'Référentiel des agences.',
    apiResource: 'rental-agencies',
  },
  'produits/locations/categories': {
    title: 'Catégories véhicules',
    description: 'Types de véhicules (économique, SUV, etc.).',
    apiResource: 'vehicle-categories',
  },
  'produits/locations/nouveau': {
    title: 'Nouveau véhicule',
    apiResource: 'vehicles',
  },
  'produits/croisieres': {
    title: 'Croisières',
    description: 'Départs, itinéraires, cabines et disponibilités.',
    apiResource: 'cruise-sailings',
  },
  'produits/croisieres/lignes': {
    title: 'Lignes de croisière',
    description: 'Référentiel des lignes.',
    apiResource: 'cruise-lines',
  },
  'produits/croisieres/ports': {
    title: 'Ports de croisière',
    description: 'Référentiel des ports.',
    apiResource: 'cruise-ports',
  },
  'produits/croisieres/navires': {
    title: 'Navires',
    description: 'Navires, itinéraires et cabines.',
    apiResource: 'ships',
  },
  'produits/croisieres/nouveau': {
    title: 'Nouveau départ',
    apiResource: 'cruise-sailings',
  },
  'produits/croisieres/navires/nouveau': {
    title: 'Nouveau navire',
    apiResource: 'ships',
  },
  'produits/activites': {
    title: 'Activités',
    description: 'Expériences, fournisseurs et créneaux par destination.',
    apiResource: 'activities',
  },
  'produits/forfaits': {
    title: 'Forfaits',
    description: 'Packages combinés, items polymorphes et remise calculée.',
    apiResource: 'packages',
  },
  'produits/destinations': {
    title: 'Destinations',
    description: 'Géographie et points d’intérêt.',
    apiResource: 'destinations',
  },
  reservations: {
    title: 'Réservations',
    description: 'Suivi des réservations.',
    apiResource: 'bookings',
  },
  'reservations/lignes': {
    title: 'Lignes de réservation',
    description: 'Détail des articles par réservation.',
    apiResource: 'booking-items',
  },
  paiements: {
    title: 'Paiements',
    description: 'Transactions et statuts de paiement.',
    apiResource: 'payments',
  },
  'paiements/codes-promo': {
    title: 'Codes promo',
    description: 'Codes promotionnels.',
    apiResource: 'promo-codes',
  },
  'paiements/promotions': {
    title: 'Promotions',
    description: 'Campagnes et offres.',
    apiResource: 'promotions',
  },
  'contenu/blog': {
    title: 'Blog',
    description: 'Articles du site public.',
    apiResource: 'blog-posts',
  },
  'contenu/blog/nouveau': {
    title: 'Nouvel article',
    description: 'Rédiger un article de blog.',
    apiResource: 'blog-posts',
  },
  'contenu/avis': {
    title: 'Avis',
    description: 'Notes et commentaires clients.',
    apiResource: 'reviews',
  },
  'contenu/tickets': {
    title: 'Tickets support',
    description: 'Demandes d’assistance.',
    apiResource: 'support-tickets',
  },
  'contenu/messages': {
    title: 'Messages support',
    description: 'Échanges sur les tickets.',
    apiResource: 'support-messages',
  },
  guides: {
    title: 'Guides touristiques',
    description: 'Catalogue des guides internes et externes.',
    apiResource: 'tour-guides',
  },
  'guides/nouveau': {
    title: 'Nouveau guide',
    description: 'Créer un profil guide touristique.',
    apiResource: 'tour-guides',
  },
  organisations: {
    title: 'Organisations',
    description: 'Partenaires et entités.',
    apiResource: 'organizations',
  },
  'systeme/roles': {
    title: 'Rôles et permissions',
    description: 'Contrôle d’accès (RBAC).',
    apiResource: 'roles',
  },
  'systeme/audit': {
    title: 'Audit RBAC',
    description: 'Journal des changements de permissions.',
    apiResource: 'rbac-audit-logs',
  },
};

export function getAdminSectionByPath(segments: string[]): AdminSectionMeta | undefined {
  if (segments.length === 0) {
    return undefined;
  }
  const key = segments.join('/');
  return adminSectionsRegistry[key];
}
