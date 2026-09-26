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
    description: 'Expériences, partenaires et créneaux par destination.',
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
  tresorerie: {
    title: 'Trésorerie',
    description: 'Hub du module Trésorerie (entrées, sorties, budgets, audit).',
    apiResource: 'treasury',
  },
  'tresorerie/entrees': {
    title: 'Entrées de fonds',
    description: 'Enregistrement et suivi des entrées de fonds.',
    apiResource: 'fund-entries',
  },
  'tresorerie/entrees/nouveau': {
    title: 'Nouvelle entrée de fonds',
    description: 'Créer une entrée de fonds.',
    apiResource: 'fund-entries',
  },
  'tresorerie/entrees/id': {
    title: 'Modifier entrée de fonds',
    description: 'Éditer une entrée de fonds.',
    apiResource: 'fund-entries',
  },
  'tresorerie/entrees/id/voir': {
    title: 'Voir entrée de fonds',
    description: 'Fiche détail d’une entrée de fonds.',
    apiResource: 'fund-entries',
  },
  'tresorerie/sorties': {
    title: 'Sorties de fonds',
    description: 'Décaissements liés à un état de besoin.',
    apiResource: 'fund-exits',
  },
  'tresorerie/sorties/nouveau': {
    title: 'Nouvelle sortie de fonds',
    description: 'Créer une sortie liée à un besoin autorisé.',
    apiResource: 'fund-exits',
  },
  'tresorerie/sorties/id': {
    title: 'Modifier sortie de fonds',
    description: 'Éditer une sortie de fonds.',
    apiResource: 'fund-exits',
  },
  'tresorerie/sorties/id/voir': {
    title: 'Voir sortie de fonds',
    description: 'Fiche détail d’une sortie de fonds.',
    apiResource: 'fund-exits',
  },
  'tresorerie/besoins': {
    title: 'États de besoin',
    description: 'Demandes de dépense et circuit de validation.',
    apiResource: 'expense-requests',
  },
  'tresorerie/besoins/nouveau': {
    title: 'Nouvel état de besoin',
    description: 'Créer une demande de dépense.',
    apiResource: 'expense-requests',
  },
  'tresorerie/besoins/id': {
    title: 'Modifier état de besoin',
    description: 'Éditer une demande de dépense.',
    apiResource: 'expense-requests',
  },
  'tresorerie/besoins/id/voir': {
    title: 'Voir état de besoin',
    description: 'Fiche détail d’un état de besoin.',
    apiResource: 'expense-requests',
  },
  'tresorerie/budgets': {
    title: 'Budgets',
    description: 'Budgétisation mensuelle, annuelle et par activité/produit.',
    apiResource: 'budgets',
  },
  'tresorerie/budgets/nouveau': {
    title: 'Nouveau budget',
    description: 'Créer un budget.',
    apiResource: 'budgets',
  },
  'tresorerie/budgets/suivi': {
    title: 'Budget vs réalisé',
    description: 'Écarts prévu / réalisé par période.',
    apiResource: 'budgets',
  },
  'tresorerie/budgets/id': {
    title: 'Modifier budget',
    description: 'Éditer un budget.',
    apiResource: 'budgets',
  },
  'tresorerie/budgets/id/voir': {
    title: 'Voir budget',
    description: 'Fiche détail d’un budget.',
    apiResource: 'budgets',
  },
  'tresorerie/rapports': {
    title: 'Rapports trésorerie',
    description: 'Agrégats et exports des opérations financières.',
    apiResource: 'treasury-reports',
  },
  'tresorerie/externes': {
    title: 'Collaborateurs externes',
    description: 'Accès externes (e-mail, jetons, permissions).',
    apiResource: 'treasury-external-collaborators',
  },
  'tresorerie/audit': {
    title: 'Audit trésorerie',
    description: 'Journal append-only des opérations sensibles.',
    apiResource: 'treasury-audit-logs',
  },
  'tresorerie/comptabilite': {
    title: 'Comptabilité',
    description: 'Pont accounting_links + livres SYSCOHADA (journal, grand livre, balance).',
    apiResource: 'accounting-links',
  },
  'tresorerie/comptabilite/journal': {
    title: 'Journal',
    description: 'Écritures comptables filtrées par journal et période.',
    apiResource: 'journal-entries',
  },
  'tresorerie/comptabilite/journal/id': {
    title: 'Détail écriture',
    description: 'Lignes débit/crédit d’une pièce comptable.',
    apiResource: 'journal-entries',
  },
  'tresorerie/comptabilite/grand-livre': {
    title: 'Grand livre',
    description: 'Mouvements par compte (écritures postées).',
    apiResource: 'journal-lines',
  },
  'tresorerie/comptabilite/balance': {
    title: 'Balance générale',
    description: 'Totaux débit/crédit par compte pour la période.',
    apiResource: 'accounting-balance',
  },
  'paiements/codes-promo': {
    title: 'Codes promo',
    description: 'Codes promotionnels.',
    apiResource: 'promo-codes',
  },
  'paiements/codes-promo/id/voir': {
    title: 'Voir le code promo',
    description: 'Aperçu lecture seule d’un code promotionnel.',
    apiResource: 'promo-codes',
  },
  'paiements/promotions': {
    title: 'Promotions',
    description: 'Campagnes et offres.',
    apiResource: 'promotions',
  },
  'paiements/promotions/id/voir': {
    title: 'Voir la promotion',
    description: 'Aperçu lecture seule d’une campagne marketing.',
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
  'contenu/site': {
    title: 'Site & présentation',
    description: 'Contenu institutionnel et vitrine du site public.',
    apiResource: 'about-pages',
  },
  'contenu/legal': {
    title: 'Pages légales',
    description: 'Conditions d\'utilisation et textes légaux (WYSIWYG).',
    apiResource: 'legal-pages',
  },
  'contenu/legal/nouveau': {
    title: 'Nouvelle page légale',
    description: 'Créer une page légale (CGU, etc.).',
    apiResource: 'legal-pages',
  },
  'contenu/support': {
    title: 'Support',
    description: 'Tickets d’assistance et messages clients.',
    apiResource: 'support-tickets',
  },
  'contenu/avis': {
    title: 'Avis',
    description: 'Notes et commentaires clients.',
    apiResource: 'reviews',
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
  'guides/id': {
    title: 'Modifier le guide',
    description: 'Édition du profil, couverture et statut du guide.',
    apiResource: 'tour-guides',
  },
  'guides/id/voir': {
    title: 'Voir le guide',
    description: 'Profil guide, destinations couvertes et missions assignées.',
    apiResource: 'tour-guides',
  },
  'guides/calendrier': {
    title: 'Calendrier guides',
    description: 'Disponibilité mensuelle des guides actifs.',
    apiResource: 'tour-guides',
  },
  organisations: {
    title: 'Organisations',
    description: 'Partenaires et entités.',
    apiResource: 'organizations',
  },
  'organisations/id': {
    title: "Modifier l'organisation",
    description: "Infos, employés et paramètres de l'organisation.",
    apiResource: 'organizations',
  },
  'organisations/id/voir': {
    title: "Voir l'organisation",
    description: "Profil organisation, contact et employés.",
    apiResource: 'organizations',
  },
  'systeme/roles': {
    title: 'Rôles et permissions',
    description: 'Contrôle d’accès (RBAC).',
    apiResource: 'roles',
  },
  'systeme/roles/nouveau': {
    title: 'Nouveau rôle',
    description: 'Créer un rôle personnalisé et définir ses permissions.',
    apiResource: 'roles',
  },
  'systeme/roles/assignations': {
    title: 'Assignations de rôles',
    description: 'Attribuer ou révoquer des rôles pour les utilisateurs.',
    apiResource: 'user-role-assignments',
  },
  'systeme/roles/permissions': {
    title: 'Catalogue des permissions',
    description: 'Liste en lecture seule des permissions disponibles.',
    apiResource: 'permissions',
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
