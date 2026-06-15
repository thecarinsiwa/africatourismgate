import type { BreadcrumbItem, SidebarNavEntry } from '@africatourismgate/ui';

export type AdminBreadcrumbRoute = {
  href: string;
  label: string;
};

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

/** Construit la map href → label depuis la nav sidebar + routes imbriquées hors menu. */
export function buildAdminBreadcrumbHrefLabels(
  navEntries: SidebarNavEntry[],
  extraRoutes: AdminBreadcrumbRoute[] = [],
): Map<string, string> {
  const map = new Map<string, string>();

  for (const entry of navEntries) {
    if (entry.type === 'link') {
      map.set(normalizePath(entry.href), entry.label);
    } else {
      for (const child of entry.children) {
        map.set(normalizePath(child.href), child.label);
      }
    }
  }

  for (const route of extraRoutes) {
    map.set(normalizePath(route.href), route.label);
  }

  return map;
}

export type BreadcrumbFromPathOptions = {
  hrefLabels: Map<string, string>;
  /** Segments finaux (ex. nom d'entité) ajoutés après les préfixes reconnus. */
  tail?: BreadcrumbItem[];
};

/**
 * Génère un fil d'Ariane à partir du pathname et des hrefs connus (nav + routes extra).
 * Les segments dynamiques ([id], UUID…) sont ignorés tant qu'ils ne sont pas dans la map.
 */
export function breadcrumbFromPath(
  pathname: string,
  { hrefLabels, tail = [] }: BreadcrumbFromPathOptions,
): BreadcrumbItem[] {
  const path = normalizePath(pathname);
  if (!path || path === '/') return [...tail];

  const segments = path.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];

  let cumulative = '';
  for (const segment of segments) {
    cumulative += `/${segment}`;
    const normalized = normalizePath(cumulative);
    const label = hrefLabels.get(normalized);
    if (label) {
      crumbs.push({ label, href: normalized });
    }
  }

  for (const item of tail) {
    const last = crumbs[crumbs.length - 1];
    if (!last || last.label !== item.label) {
      crumbs.push(item);
    }
  }

  return crumbs;
}

/** Dernier libellé connu sur le pathname — titre par défaut des pages liste. */
export function resolveAdminPageTitle(
  pathname: string,
  hrefLabels: Map<string, string>,
): string | undefined {
  const crumbs = breadcrumbFromPath(pathname, { hrefLabels });
  return crumbs[crumbs.length - 1]?.label;
}
