export type AdminNavBadgeKey = 'pendingReviews' | 'openSupportTickets';

export type AdminNavLinkConfig = {
  href: string;
  labelKey: string;
  iconKey: string;
  /** Compteur nav (voir useNavBadgeCounts). */
  badgeKey?: AdminNavBadgeKey;
};

export type AdminNavGroupConfig = {
  id: string;
  iconKey: string;
  children: AdminNavLinkConfig[];
  defaultOpen?: boolean;
};

export type AdminNavLinkEntryConfig = {
  type: 'link';
  href: string;
  labelKey: string;
  iconKey: string;
};

export type AdminNavGroupEntryConfig = {
  type: 'group';
} & AdminNavGroupConfig;

export type AdminNavEntryConfig = AdminNavLinkEntryConfig | AdminNavGroupEntryConfig;

export const adminDashboardNavConfig: AdminNavEntryConfig[] = [
  {
    type: 'link',
    href: '/dashboard',
    labelKey: 'dashboard',
    iconKey: 'dashboard',
  },
  {
    type: 'group',
    id: 'users-auth',
    iconKey: 'users',
    children: [
      { href: '/utilisateurs', labelKey: 'users', iconKey: 'users' },
      { href: '/utilisateurs/employes', labelKey: 'employees', iconKey: 'userCircle' },
      { href: '/utilisateurs/departements', labelKey: 'departments', iconKey: 'list' },
      { href: '/utilisateurs/adresses', labelKey: 'addresses', iconKey: 'mapPin' },
      { href: '/utilisateurs/moyens-paiement', labelKey: 'paymentMethods', iconKey: 'creditCard' },
      { href: '/utilisateurs/sessions', labelKey: 'sessions', iconKey: 'shield' },
      { href: '/utilisateurs/journaux-securite', labelKey: 'securityLogs', iconKey: 'document' },
    ],
  },
  {
    type: 'group',
    id: 'loyalty',
    iconKey: 'gift',
    children: [{ href: '/fidelite/comptes', labelKey: 'loyaltyAccounts', iconKey: 'gift' }],
  },
  {
    type: 'group',
    id: 'travel-products',
    iconKey: 'package',
    children: [
      { href: '/hebergements', labelKey: 'accommodations', iconKey: 'properties' },
      { href: '/produits/vols', labelKey: 'flights', iconKey: 'plane' },
      { href: '/produits/locations', labelKey: 'vehicles', iconKey: 'car' },
      { href: '/produits/croisieres', labelKey: 'cruises', iconKey: 'ship' },
      { href: '/produits/activites', labelKey: 'activities', iconKey: 'activity' },
      { href: '/produits/forfaits', labelKey: 'packages', iconKey: 'package' },
      { href: '/produits/destinations', labelKey: 'destinations', iconKey: 'globe' },
    ],
  },
  {
    type: 'group',
    id: 'bookings',
    iconKey: 'bookings',
    children: [
      { href: '/reservations', labelKey: 'bookings', iconKey: 'bookings' },
      { href: '/reservations/lignes', labelKey: 'bookingLines', iconKey: 'list' },
      { href: '/guides', labelKey: 'tourGuides', iconKey: 'userCircle' },
    ],
  },
  {
    type: 'group',
    id: 'payments',
    iconKey: 'payments',
    children: [
      { href: '/paiements', labelKey: 'payments', iconKey: 'payments' },
      { href: '/paiements/codes-promo', labelKey: 'promoCodes', iconKey: 'ticket' },
      { href: '/paiements/promotions', labelKey: 'promotions', iconKey: 'star' },
    ],
  },
  {
    type: 'group',
    id: 'gap',
    iconKey: 'globe',
    children: [
      { href: '/gap/parametres', labelKey: 'gapParametres', iconKey: 'settings' },
      { href: '/gap/pages', labelKey: 'gapPages', iconKey: 'document' },
      { href: '/gap/activites', labelKey: 'gapActivites', iconKey: 'activity' },
      { href: '/gap/impact', labelKey: 'gapImpact', iconKey: 'star' },
      { href: '/gap/medias', labelKey: 'gapMedias', iconKey: 'document' },
    ],
  },
  {
    type: 'group',
    id: 'content-support',
    iconKey: 'headset',
    children: [
      { href: '/contenu/blog', labelKey: 'blog', iconKey: 'document' },
      { href: '/contenu/a-propos/pages', labelKey: 'aboutPages', iconKey: 'document' },
      { href: '/contenu/a-propos/equipe', labelKey: 'aboutTeam', iconKey: 'users' },
      { href: '/contenu/a-propos/timeline', labelKey: 'aboutTimeline', iconKey: 'document' },
      { href: '/contenu/a-propos/ressources', labelKey: 'aboutResources', iconKey: 'document' },
      { href: '/contenu/pourquoi-nous', labelKey: 'whyUs', iconKey: 'document' },
      { href: '/contenu/hero', labelKey: 'heroSlides', iconKey: 'document' },
      { href: '/contenu/clients-satisfaits', labelKey: 'happyCustomers', iconKey: 'document' },
      { href: '/contenu/avis', labelKey: 'reviews', iconKey: 'star', badgeKey: 'pendingReviews' },
      { href: '/contenu/tickets', labelKey: 'supportTickets', iconKey: 'ticket', badgeKey: 'openSupportTickets' },
      { href: '/contenu/messages', labelKey: 'supportMessages', iconKey: 'chat' },
    ],
  },
  {
    type: 'group',
    id: 'system',
    iconKey: 'settings',
    children: [
      { href: '/organisations', labelKey: 'organizations', iconKey: 'organisations' },
      { href: '/systeme/roles', labelKey: 'roles', iconKey: 'roles' },
      { href: '/parametres', labelKey: 'settings', iconKey: 'settings' },
      { href: '/parametres/emails', labelKey: 'emails', iconKey: 'document' },
      { href: '/systeme/audit', labelKey: 'rbacAudit', iconKey: 'document' },
    ],
  },
];

/** Routes imbriquées hors menu latéral — clés i18n `nav.links.*` ou `nav.breadcrumb.*`. */
export type AdminBreadcrumbRouteConfig = {
  href: string;
  labelKey: string;
};

export const adminBreadcrumbExtraRoutes: AdminBreadcrumbRouteConfig[] = [
  { href: '/produits/croisieres/navires', labelKey: 'ships' },
  { href: '/produits/croisieres/navires/nouveau', labelKey: 'newShip' },
  { href: '/produits/croisieres/lignes', labelKey: 'cruiseLines' },
  { href: '/produits/croisieres/ports', labelKey: 'cruisePorts' },
  { href: '/produits/croisieres/nouveau', labelKey: 'newSailing' },
  { href: '/hebergements/nouveau', labelKey: 'newAccommodation' },
  { href: '/produits/vols/aeroports', labelKey: 'airports' },
  { href: '/produits/vols/compagnies', labelKey: 'airlines' },
  { href: '/produits/vols/nouveau', labelKey: 'newFlight' },
  { href: '/produits/locations/agences', labelKey: 'rentalAgencies' },
  { href: '/produits/locations/categories', labelKey: 'vehicleCategories' },
  { href: '/produits/locations/nouveau', labelKey: 'newVehicle' },
  { href: '/produits/activites/fournisseurs', labelKey: 'activityProviders' },
  { href: '/produits/activites/nouveau', labelKey: 'newActivity' },
  { href: '/produits/destinations/nouveau', labelKey: 'newDestination' },
  { href: '/produits/forfaits/nouveau', labelKey: 'newPackage' },
  { href: '/utilisateurs/nouveau', labelKey: 'newUser' },
  { href: '/utilisateurs/employes/nouveau', labelKey: 'newEmployee' },
  { href: '/organisations/nouveau', labelKey: 'newOrganization' },
  { href: '/systeme/roles/nouveau', labelKey: 'newRole' },
  { href: '/systeme/roles/assignations', labelKey: 'roleAssignments' },
  { href: '/systeme/roles/permissions', labelKey: 'permissions' },
  { href: '/paiements/promotions/nouveau', labelKey: 'newPromotion' },
  { href: '/contenu/blog/nouveau', labelKey: 'newBlogPost' },
  { href: '/contenu/a-propos/pages/nouveau', labelKey: 'newAboutPage' },
  { href: '/contenu/a-propos/equipe/nouveau', labelKey: 'newTeamMember' },
  { href: '/contenu/a-propos/timeline/nouveau', labelKey: 'newTimelineMilestone' },
  { href: '/contenu/a-propos/ressources/nouveau', labelKey: 'newAboutResource' },
  { href: '/contenu/pourquoi-nous/nouveau', labelKey: 'newWhyUsItem' },
  { href: '/contenu/hero/nouveau', labelKey: 'newHeroSlide' },
  { href: '/contenu/clients-satisfaits/nouveau', labelKey: 'newHappyCustomersStat' },
  { href: '/gap/pages/nouveau', labelKey: 'newGapPage' },
  { href: '/gap/activites/nouveau', labelKey: 'newGapActivity' },
  { href: '/gap/impact/nouveau', labelKey: 'newGapImpactStat' },
  { href: '/gap/medias/nouveau', labelKey: 'newGapMediaItem' },
  { href: '/paiements/codes-promo/nouveau', labelKey: 'newPromoCode' },
  { href: '/guides/nouveau', labelKey: 'newTourGuide' },
  { href: '/parametres/comptes', labelKey: 'bankAccounts' },
];

export function navGroupMessageKey(groupId: string): string {
  return groupId.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function flattenAdminNavHrefs(entries: AdminNavEntryConfig[]): string[] {
  const hrefs: string[] = [];
  for (const entry of entries) {
    if (entry.type === 'link') {
      hrefs.push(entry.href);
    } else {
      for (const child of entry.children) {
        hrefs.push(child.href);
      }
    }
  }
  return hrefs;
}

export function getAdminRouteRootSegments(entries: AdminNavEntryConfig[]): string[] {
  const roots = new Set<string>();
  for (const href of flattenAdminNavHrefs(entries)) {
    const segment = href.split('/').filter(Boolean)[0];
    if (segment) {
      roots.add(segment);
    }
  }
  return Array.from(roots).sort();
}

export function buildAdminMiddlewareMatcher(entries: AdminNavEntryConfig[]): string[] {
  const matchers = new Set<string>(['/login', '/register']);
  for (const root of getAdminRouteRootSegments(entries)) {
    matchers.add(`/${root}`);
    matchers.add(`/${root}/:path*`);
  }
  return Array.from(matchers).sort();
}
