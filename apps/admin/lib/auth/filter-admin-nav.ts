import type { SidebarNavEntry } from '@africatourismgate/ui';
import { adminDashboardNavConfig } from '../../config/dashboard-nav.config';
import { isHrefAllowed, type RouteAccessContext } from '../../config/admin-route-permissions';

export function filterAdminNav(
  entries: SidebarNavEntry[],
  context: RouteAccessContext,
): SidebarNavEntry[] {
  const filtered: SidebarNavEntry[] = [];

  for (const entry of entries) {
    if (entry.type === 'link') {
      if (isHrefAllowed(entry.href, context)) {
        filtered.push(entry);
      }
      continue;
    }

    const children = entry.children.filter((child) =>
      isHrefAllowed(child.href, context),
    );

    if (children.length > 0) {
      filtered.push({ ...entry, children });
    }
  }

  return filtered;
}

export function filterNavHrefs(hrefs: string[], context: RouteAccessContext): string[] {
  return hrefs.filter((href) => isHrefAllowed(href, context));
}

export function getAllAdminNavHrefs(): string[] {
  const hrefs: string[] = [];
  for (const entry of adminDashboardNavConfig) {
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
