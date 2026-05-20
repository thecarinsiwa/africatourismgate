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
    description: 'Propriétés, chambres et disponibilités.',
    apiResource: 'properties',
  },
  'hebergements/equipements': {
    title: 'Équipements',
    description: 'Catalogue global des équipements (amenities).',
    apiResource: 'amenities',
  },
  'produits/vols': {
    title: 'Vols',
    description: 'Compagnies, aéroports et vols.',
    apiResource: 'flights',
  },
  'produits/locations': {
    title: 'Locations véhicules',
    description: 'Agences, véhicules et disponibilités.',
    apiResource: 'vehicles',
  },
  'produits/croisieres': {
    title: 'Croisières',
    description: 'Lignes, navires et croisières.',
    apiResource: 'cruise-sailings',
  },
  'produits/activites': {
    title: 'Activités',
    description: 'Expériences et fournisseurs.',
    apiResource: 'activities',
  },
  'produits/forfaits': {
    title: 'Forfaits',
    description: 'Packages combinés (hôtel + vol, etc.).',
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
