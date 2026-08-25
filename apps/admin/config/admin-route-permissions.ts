export type RouteAccessRule = {
  prefix: string;
  permission?: string;
  anyOf?: string[];
  superAdminOnly?: boolean;
  /** Always visible to authenticated users (no permission check). */
  authenticatedOnly?: boolean;
};

/**
 * Longest matching prefix wins. Order entries from most specific to least specific.
 */
export const ADMIN_ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { prefix: '/systeme/audit', superAdminOnly: true },
  { prefix: '/utilisateurs/employes', permission: 'employees.read' },
  { prefix: '/utilisateurs/departements', permission: 'departments.read' },
  { prefix: '/utilisateurs', permission: 'users.read' },
  { prefix: '/fidelite', permission: 'users.read' },
  { prefix: '/hebergements', permission: 'properties.read' },
  { prefix: '/produits/vols', permission: 'flights.read' },
  { prefix: '/produits/locations', permission: 'vehicles.read' },
  { prefix: '/produits/croisieres', permission: 'cruises.read' },
  { prefix: '/produits/activites', permission: 'activities.read' },
  { prefix: '/produits/forfaits', permission: 'packages.read' },
  { prefix: '/produits/destinations', permission: 'destinations.read' },
  { prefix: '/reservations', permission: 'bookings.read' },
  { prefix: '/guides', permission: 'guides.read' },
  { prefix: '/paiements/codes-promo', permission: 'promo_codes.read' },
  { prefix: '/paiements/promotions', permission: 'promotions.read' },
  { prefix: '/paiements', permission: 'payments.read' },
  { prefix: '/gap', permission: 'gap.read' },
  { prefix: '/contenu/blog', permission: 'blog.read' },
  { prefix: '/contenu/site', permission: 'content.read' },
  { prefix: '/contenu/support', permission: 'support_tickets.read' },
  { prefix: '/contenu/a-propos', permission: 'content.read' },
  { prefix: '/contenu/pourquoi-nous', permission: 'content.read' },
  { prefix: '/contenu/hero', permission: 'content.read' },
  { prefix: '/contenu/clients-satisfaits', permission: 'content.read' },
  { prefix: '/contenu/avis', permission: 'reviews.read' },
  { prefix: '/contenu/tickets', permission: 'support_tickets.read' },
  { prefix: '/contenu/messages', permission: 'support_tickets.write' },
  { prefix: '/parametres/comptes', permission: 'organization_bank_accounts.read' },
  { prefix: '/parametres/emails', permission: 'organization_settings.read' },
  { prefix: '/parametres', permission: 'organization_settings.read' },
  { prefix: '/organisations', authenticatedOnly: true },
  { prefix: '/systeme/roles', authenticatedOnly: true },
  { prefix: '/dashboard', authenticatedOnly: true },
];

export type RouteAccess = {
  allowed: boolean;
  superAdminOnly: boolean;
};

export type RouteAccessContext = {
  permissions: string[];
  isSuperAdmin: boolean;
};

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery;
}

export function resolveRouteAccessRule(pathname: string): RouteAccessRule | null {
  const normalized = normalizePathname(pathname);
  let best: RouteAccessRule | null = null;
  let bestLength = -1;

  for (const rule of ADMIN_ROUTE_ACCESS_RULES) {
    if (normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`)) {
      if (rule.prefix.length > bestLength) {
        best = rule;
        bestLength = rule.prefix.length;
      }
    }
  }

  return best;
}

export function isRouteAllowed(
  pathname: string,
  context: RouteAccessContext,
): RouteAccess {
  const rule = resolveRouteAccessRule(pathname);
  if (!rule) {
    return { allowed: true, superAdminOnly: false };
  }

  if (rule.superAdminOnly) {
    return { allowed: context.isSuperAdmin, superAdminOnly: true };
  }

  if (rule.authenticatedOnly) {
    return { allowed: true, superAdminOnly: false };
  }

  if (context.isSuperAdmin) {
    return { allowed: true, superAdminOnly: false };
  }

  if (rule.anyOf?.length) {
    const allowed = rule.anyOf.some((code) => context.permissions.includes(code));
    return { allowed, superAdminOnly: false };
  }

  if (rule.permission) {
    return {
      allowed: context.permissions.includes(rule.permission),
      superAdminOnly: false,
    };
  }

  return { allowed: true, superAdminOnly: false };
}

export function isHrefAllowed(
  href: string,
  context: RouteAccessContext,
): boolean {
  return isRouteAllowed(href, context).allowed;
}
