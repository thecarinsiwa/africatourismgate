export type AdminNavLinkConfig = {
  href: string;
  label: string;
  iconKey: string;
};

export type AdminNavGroupConfig = {
  id: string;
  label: string;
  iconKey: string;
  children: AdminNavLinkConfig[];
  defaultOpen?: boolean;
};

export type AdminNavLinkEntryConfig = {
  type: 'link';
  href: string;
  label: string;
  iconKey: string;
};

export type AdminNavGroupEntryConfig = {
  type: 'group';
} & AdminNavGroupConfig;

export type AdminNavEntryConfig = AdminNavLinkEntryConfig | AdminNavGroupEntryConfig;

/** Structure du menu admin (sans JSX). Groupes EN, sous-menus FR. */
export const adminDashboardNavConfig: AdminNavEntryConfig[] = [
  {
    type: 'link',
    href: '/dashboard',
    label: 'Dashboard',
    iconKey: 'dashboard',
  },
  {
    type: 'group',
    id: 'users-auth',
    label: 'Users & Authentication',
    iconKey: 'users',
    defaultOpen: true,
    children: [
      { href: '/utilisateurs', label: 'Utilisateurs', iconKey: 'users' },
      { href: '/utilisateurs/employes', label: 'Employés', iconKey: 'userCircle' },
      { href: '/utilisateurs/adresses', label: 'Adresses', iconKey: 'mapPin' },
      { href: '/utilisateurs/moyens-paiement', label: 'Moyens de paiement', iconKey: 'creditCard' },
      { href: '/utilisateurs/sessions', label: 'Sessions', iconKey: 'shield' },
      { href: '/utilisateurs/journaux-securite', label: 'Journaux de sécurité', iconKey: 'document' },
    ],
  },
  {
    type: 'group',
    id: 'loyalty',
    label: 'Loyalty (OneKey)',
    iconKey: 'gift',
    children: [{ href: '/fidelite/comptes', label: 'Comptes fidélité', iconKey: 'gift' }],
  },
  {
    type: 'group',
    id: 'travel-products',
    label: 'Travel Products',
    iconKey: 'package',
    children: [
      { href: '/hebergements', label: 'Hébergements', iconKey: 'properties' },
      { href: '/hebergements/equipements', label: 'Équipements', iconKey: 'properties' },
      { href: '/produits/vols', label: 'Vols', iconKey: 'plane' },
      { href: '/produits/locations', label: 'Locations véhicules', iconKey: 'car' },
      { href: '/produits/croisieres', label: 'Croisières', iconKey: 'ship' },
      { href: '/produits/activites', label: 'Activités', iconKey: 'activity' },
      { href: '/produits/forfaits', label: 'Forfaits', iconKey: 'package' },
      { href: '/produits/destinations', label: 'Destinations', iconKey: 'globe' },
    ],
  },
  {
    type: 'group',
    id: 'bookings',
    label: 'Bookings',
    iconKey: 'bookings',
    children: [
      { href: '/reservations', label: 'Réservations', iconKey: 'bookings' },
      { href: '/reservations/lignes', label: 'Lignes de réservation', iconKey: 'list' },
    ],
  },
  {
    type: 'group',
    id: 'payments',
    label: 'Payments',
    iconKey: 'payments',
    children: [
      { href: '/paiements', label: 'Paiements', iconKey: 'payments' },
      { href: '/paiements/codes-promo', label: 'Codes promo', iconKey: 'ticket' },
      { href: '/paiements/promotions', label: 'Promotions', iconKey: 'star' },
    ],
  },
  {
    type: 'group',
    id: 'content-support',
    label: 'Content & Customer Care',
    iconKey: 'headset',
    children: [
      { href: '/contenu/avis', label: 'Avis', iconKey: 'star' },
      { href: '/contenu/tickets', label: 'Tickets support', iconKey: 'ticket' },
      { href: '/contenu/messages', label: 'Messages support', iconKey: 'chat' },
    ],
  },
  {
    type: 'group',
    id: 'system',
    label: 'System & Analytics',
    iconKey: 'settings',
    children: [
      { href: '/organisations', label: 'Organisations', iconKey: 'organisations' },
      { href: '/systeme/roles', label: 'Rôles et permissions', iconKey: 'roles' },
      { href: '/parametres', label: 'Paramètres', iconKey: 'settings' },
      { href: '/systeme/audit', label: 'Audit RBAC', iconKey: 'document' },
    ],
  },
];

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

/** Segments racine uniques pour le matcher middleware Next.js. */
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

/** @deprecated Prefer the literal `adminMiddlewareMatcher` in middleware.ts (Next.js static analysis). */
export function buildAdminMiddlewareMatcher(entries: AdminNavEntryConfig[]): string[] {
  const matchers = new Set<string>(['/login', '/register']);
  for (const root of getAdminRouteRootSegments(entries)) {
    matchers.add(`/${root}`);
    matchers.add(`/${root}/:path*`);
  }
  return Array.from(matchers).sort();
}
