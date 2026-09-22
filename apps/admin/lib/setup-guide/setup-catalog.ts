/**
 * Catalogue de l’assistant « Mise en route » (guidé).
 * Métadonnées structurelles uniquement — libellés i18n sous `modules.setupGuide.*`.
 * Les checks `listTotal` / `settingsFlag` seront résolus par setup-readiness (s02).
 */

export const SETUP_MODULE_IDS = [
  'platform',
  'destinations',
  'accommodations',
  'flights',
  'vehicles',
  'cruises',
  'activities',
  'packages',
  'payments',
  'content',
  'ops',
] as const;

export type SetupModuleId = (typeof SETUP_MODULE_IDS)[number];

/** Ressources listables via ApiClient (meta.total). */
export const SETUP_LIST_RESOURCES = [
  'organizations',
  'amenities',
  'vehicleCategories',
  'destinations',
  'pointsOfInterest',
  'properties',
  'rooms',
  'airlines',
  'airports',
  'flights',
  'rentalAgencies',
  'vehicles',
  'cruiseLines',
  'cruisePorts',
  'ships',
  'cruiseSailings',
  'activityProviders',
  'activities',
  'packages',
  'organizationBankAccounts',
  'mobileMoneyCountries',
  'heroSlides',
  'aboutPages',
  'legalPages',
  'blogPosts',
  'tourGuides',
  'promoCodes',
] as const;

export type SetupListResource = (typeof SETUP_LIST_RESOURCES)[number];

/**
 * Chemins settings org (résolus hors listes paginées).
 * Convention : chemin logique sous organization_settings / booking.
 */
export const SETUP_SETTINGS_PATHS = [
  /** Au moins un moyen de paiement activé. */
  'booking.payment_methods',
] as const;

export type SetupSettingsPath = (typeof SETUP_SETTINGS_PATHS)[number];

export type SetupStepCheck =
  | {
      kind: 'listTotal';
      resource: SetupListResource;
      /** Seuil pour considérer l’étape « prête ». */
      min: number;
    }
  | {
      kind: 'settingsFlag';
      path: SetupSettingsPath;
    };

export type SetupStep = {
  id: string;
  /** Clé i18n relative : `modules.setupGuide.steps.<id>.*` */
  titleKey: string;
  helpKey: string;
  listHref: string;
  createHref?: string;
  check: SetupStepCheck;
};

export type SetupModule = {
  id: SetupModuleId;
  /** Ordre d’affichage (0 = premier). */
  order: number;
  /** Modules qui doivent être « prêts » avant celui-ci. */
  dependsOnModuleIds: readonly SetupModuleId[];
  /** Clé i18n relative : `modules.setupGuide.modules.<id>.*` */
  titleKey: string;
  descriptionKey: string;
  steps: readonly SetupStep[];
};

function step(
  id: string,
  listHref: string,
  check: SetupStepCheck,
  createHref?: string,
): SetupStep {
  return {
    id,
    titleKey: `steps.${id}.title`,
    helpKey: `steps.${id}.help`,
    listHref,
    createHref,
    check,
  };
}

export const SETUP_MODULES: readonly SetupModule[] = [
  {
    id: 'platform',
    order: 0,
    dependsOnModuleIds: [],
    titleKey: 'modules.platform.title',
    descriptionKey: 'modules.platform.description',
    steps: [
      step('org-settings', '/parametres', {
        kind: 'listTotal',
        resource: 'organizations',
        min: 1,
      }),
      step(
        'amenities',
        '/hebergements/equipements',
        { kind: 'listTotal', resource: 'amenities', min: 1 },
      ),
      step(
        'vehicle-categories',
        '/produits/locations/categories',
        { kind: 'listTotal', resource: 'vehicleCategories', min: 1 },
      ),
    ],
  },
  {
    id: 'destinations',
    order: 1,
    dependsOnModuleIds: ['platform'],
    titleKey: 'modules.destinations.title',
    descriptionKey: 'modules.destinations.description',
    steps: [
      step(
        'destinations',
        '/produits/destinations',
        { kind: 'listTotal', resource: 'destinations', min: 1 },
        '/produits/destinations/nouveau',
      ),
      step('points-of-interest', '/produits/destinations', {
        kind: 'listTotal',
        resource: 'pointsOfInterest',
        min: 1,
      }),
    ],
  },
  {
    id: 'accommodations',
    order: 2,
    dependsOnModuleIds: ['destinations'],
    titleKey: 'modules.accommodations.title',
    descriptionKey: 'modules.accommodations.description',
    steps: [
      step(
        'properties',
        '/hebergements',
        { kind: 'listTotal', resource: 'properties', min: 1 },
        '/hebergements/nouveau',
      ),
      step('rooms', '/hebergements', {
        kind: 'listTotal',
        resource: 'rooms',
        min: 1,
      }),
    ],
  },
  {
    id: 'flights',
    order: 3,
    dependsOnModuleIds: ['platform'],
    titleKey: 'modules.flights.title',
    descriptionKey: 'modules.flights.description',
    steps: [
      step('airlines', '/produits/vols/compagnies', {
        kind: 'listTotal',
        resource: 'airlines',
        min: 1,
      }),
      step('airports', '/produits/vols/aeroports', {
        kind: 'listTotal',
        resource: 'airports',
        min: 1,
      }),
      step(
        'flights',
        '/produits/vols',
        { kind: 'listTotal', resource: 'flights', min: 1 },
        '/produits/vols/nouveau',
      ),
    ],
  },
  {
    id: 'vehicles',
    order: 4,
    dependsOnModuleIds: ['destinations', 'platform'],
    titleKey: 'modules.vehicles.title',
    descriptionKey: 'modules.vehicles.description',
    steps: [
      step('rental-agencies', '/produits/locations/agences', {
        kind: 'listTotal',
        resource: 'rentalAgencies',
        min: 1,
      }),
      step(
        'vehicles',
        '/produits/locations',
        { kind: 'listTotal', resource: 'vehicles', min: 1 },
        '/produits/locations/nouveau',
      ),
    ],
  },
  {
    id: 'cruises',
    order: 5,
    dependsOnModuleIds: ['platform'],
    titleKey: 'modules.cruises.title',
    descriptionKey: 'modules.cruises.description',
    steps: [
      step('cruise-lines', '/produits/croisieres/lignes', {
        kind: 'listTotal',
        resource: 'cruiseLines',
        min: 1,
      }),
      step('cruise-ports', '/produits/croisieres/ports', {
        kind: 'listTotal',
        resource: 'cruisePorts',
        min: 1,
      }),
      step(
        'ships',
        '/produits/croisieres/navires',
        { kind: 'listTotal', resource: 'ships', min: 1 },
        '/produits/croisieres/navires/nouveau',
      ),
      step(
        'cruise-sailings',
        '/produits/croisieres',
        { kind: 'listTotal', resource: 'cruiseSailings', min: 1 },
        '/produits/croisieres/nouveau',
      ),
    ],
  },
  {
    id: 'activities',
    order: 6,
    dependsOnModuleIds: ['destinations'],
    titleKey: 'modules.activities.title',
    descriptionKey: 'modules.activities.description',
    steps: [
      step('activity-providers', '/produits/activites/partenaires', {
        kind: 'listTotal',
        resource: 'activityProviders',
        min: 1,
      }),
      step(
        'activities',
        '/produits/activites',
        { kind: 'listTotal', resource: 'activities', min: 1 },
        '/produits/activites/nouveau',
      ),
    ],
  },
  {
    id: 'packages',
    order: 7,
    dependsOnModuleIds: [
      'accommodations',
      'flights',
      'vehicles',
      'cruises',
      'activities',
    ],
    titleKey: 'modules.packages.title',
    descriptionKey: 'modules.packages.description',
    steps: [
      step(
        'packages',
        '/produits/forfaits',
        { kind: 'listTotal', resource: 'packages', min: 1 },
        '/produits/forfaits/nouveau',
      ),
    ],
  },
  {
    id: 'payments',
    order: 8,
    dependsOnModuleIds: ['platform'],
    titleKey: 'modules.payments.title',
    descriptionKey: 'modules.payments.description',
    steps: [
      step('payment-methods', '/parametres', {
        kind: 'settingsFlag',
        path: 'booking.payment_methods',
      }),
      step('bank-accounts', '/parametres/comptes', {
        kind: 'listTotal',
        resource: 'organizationBankAccounts',
        min: 1,
      }),
      step('mobile-money', '/parametres/mobile-money', {
        kind: 'listTotal',
        resource: 'mobileMoneyCountries',
        min: 1,
      }),
    ],
  },
  {
    id: 'content',
    order: 9,
    dependsOnModuleIds: ['platform'],
    titleKey: 'modules.content.title',
    descriptionKey: 'modules.content.description',
    steps: [
      step(
        'hero-slides',
        '/contenu/hero',
        { kind: 'listTotal', resource: 'heroSlides', min: 1 },
        '/contenu/hero/nouveau',
      ),
      step(
        'about-pages',
        '/contenu/a-propos/pages',
        { kind: 'listTotal', resource: 'aboutPages', min: 1 },
        '/contenu/a-propos/pages/nouveau',
      ),
      step(
        'legal-pages',
        '/contenu/legal',
        { kind: 'listTotal', resource: 'legalPages', min: 1 },
        '/contenu/legal/nouveau',
      ),
      step(
        'blog-posts',
        '/contenu/blog',
        { kind: 'listTotal', resource: 'blogPosts', min: 1 },
        '/contenu/blog/nouveau',
      ),
    ],
  },
  {
    id: 'ops',
    order: 10,
    dependsOnModuleIds: ['platform'],
    titleKey: 'modules.ops.title',
    descriptionKey: 'modules.ops.description',
    steps: [
      step(
        'tour-guides',
        '/guides',
        { kind: 'listTotal', resource: 'tourGuides', min: 1 },
        '/guides/nouveau',
      ),
      step(
        'promo-codes',
        '/paiements/codes-promo',
        { kind: 'listTotal', resource: 'promoCodes', min: 1 },
        '/paiements/codes-promo/nouveau',
      ),
    ],
  },
] as const;

const modulesById = new Map(
  SETUP_MODULES.map((module) => [module.id, module]),
);

export function getSetupModules(): readonly SetupModule[] {
  return SETUP_MODULES;
}

export function getSetupModuleById(
  id: string,
): SetupModule | undefined {
  return modulesById.get(id as SetupModuleId);
}

/** Modules triés par `order` (déjà figé dans SETUP_MODULES). */
export function getSetupModulesInOrder(): readonly SetupModule[] {
  return SETUP_MODULES;
}

export function getAllSetupSteps(): readonly SetupStep[] {
  return SETUP_MODULES.flatMap((module) => [...module.steps]);
}

/** Ressources listTotal uniques (pour le fan-out readiness). */
export function getSetupListResourcesUsed(): readonly SetupListResource[] {
  const seen = new Set<SetupListResource>();
  for (const stepItem of getAllSetupSteps()) {
    if (stepItem.check.kind === 'listTotal') {
      seen.add(stepItem.check.resource);
    }
  }
  return Array.from(seen);
}
