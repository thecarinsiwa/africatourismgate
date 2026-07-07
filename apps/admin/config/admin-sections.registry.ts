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
  'contenu/a-propos/pages': {
    title: 'Pages À propos',
    description: 'Pages institutionnelles du site public.',
    apiResource: 'about-pages',
  },
  'contenu/a-propos/pages/nouveau': {
    title: 'Nouvelle page',
    description: 'Créer une page institutionnelle.',
    apiResource: 'about-pages',
  },
  'contenu/a-propos/equipe': {
    title: 'Équipe',
    description: 'Membres de l\'équipe affichés sur le site.',
    apiResource: 'team-members',
  },
  'contenu/a-propos/equipe/nouveau': {
    title: 'Nouveau membre',
    description: 'Ajouter un membre de l\'équipe.',
    apiResource: 'team-members',
  },
  'contenu/a-propos/timeline': {
    title: 'Frise chronologique',
    description: 'Jalons de l\'histoire affichés sur le site.',
    apiResource: 'about-timeline-milestones',
  },
  'contenu/a-propos/timeline/nouveau': {
    title: 'Nouveau jalon',
    description: 'Ajouter un jalon à la frise chronologique.',
    apiResource: 'about-timeline-milestones',
  },
  'contenu/a-propos/ressources': {
    title: 'Ressources',
    description: 'Rapports et ressources médias.',
    apiResource: 'about-resources',
  },
  'contenu/a-propos/ressources/nouveau': {
    title: 'Nouvelle ressource',
    description: 'Ajouter un document ou une ressource média.',
    apiResource: 'about-resources',
  },
  'contenu/pourquoi-nous': {
    title: 'Pourquoi nous choisir',
    description: 'Section d\'accueil « Pourquoi nous choisir » et ses cartes.',
    apiResource: 'why-us-sections',
  },
  'contenu/pourquoi-nous/nouveau': {
    title: 'Nouvelle carte',
    description: 'Ajouter une carte à la section Pourquoi nous choisir.',
    apiResource: 'why-us-items',
  },
  'contenu/clients-satisfaits': {
    title: 'Clients satisfaits',
    description: 'Section d\'accueil « Clients satisfaits » et ses statistiques.',
    apiResource: 'happy-customers-sections',
  },
  'contenu/clients-satisfaits/nouveau': {
    title: 'Nouvelle statistique',
    description: 'Ajouter une barre de satisfaction.',
    apiResource: 'happy-customers-stats',
  },
  'contenu/hero': {
    title: 'Carousel hero',
    description: 'Diapositives du bandeau principal de la page d\'accueil.',
    apiResource: 'hero-slides',
  },
  'contenu/hero/nouveau': {
    title: 'Nouvelle diapositive',
    description: 'Ajouter une diapositive au carousel hero.',
    apiResource: 'hero-slides',
  },
  'gap/parametres': {
    title: 'Paramètres site GAP',
    description: 'Titre, sous-titre et bannière du programme Gorilla Ambassadors.',
    apiResource: 'gap-site-settings',
  },
  'gap/pages': {
    title: 'Pages GAP',
    description: 'Pages institutionnelles du programme GAP.',
    apiResource: 'gap-pages',
  },
  'gap/pages/nouveau': {
    title: 'Nouvelle page GAP',
    description: 'Créer une page institutionnelle GAP.',
    apiResource: 'gap-pages',
  },
  'gap/activites': {
    title: 'Activités GAP',
    description: 'Activités et initiatives du programme.',
    apiResource: 'gap-activities',
  },
  'gap/activites/nouveau': {
    title: 'Nouvelle activité GAP',
    description: 'Ajouter une activité au programme.',
    apiResource: 'gap-activities',
  },
  'gap/impact': {
    title: 'Impact GAP',
    description: 'Statistiques d\'impact du programme.',
    apiResource: 'gap-impact-stats',
  },
  'gap/impact/nouveau': {
    title: 'Nouvelle statistique d\'impact',
    description: 'Ajouter une statistique d\'impact.',
    apiResource: 'gap-impact-stats',
  },
  'gap/medias': {
    title: 'Médias GAP',
    description: 'Galerie photos et vidéos du programme.',
    apiResource: 'gap-media-items',
  },
  'gap/medias/nouveau': {
    title: 'Nouveau média GAP',
    description: 'Ajouter une image ou une vidéo.',
    apiResource: 'gap-media-items',
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
