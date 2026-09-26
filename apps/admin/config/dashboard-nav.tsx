import type { SidebarNavEntry } from '@africatourismgate/ui';
import {
  SidebarActivityIcon,
  SidebarBellIcon,
  SidebarBookingsIcon,
  SidebarCarIcon,
  SidebarChatIcon,
  SidebarCreditCardIcon,
  SidebarDashboardIcon,
  SidebarDocumentIcon,
  SidebarGiftIcon,
  SidebarGlobeIcon,
  SidebarHeadsetIcon,
  SidebarListIcon,
  SidebarMailIcon,
  SidebarMapPinIcon,
  SidebarOrganisationsIcon,
  SidebarPackageIcon,
  SidebarPaymentsIcon,
  SidebarPlaneIcon,
  SidebarPropertiesIcon,
  SidebarRolesIcon,
  SidebarSettingsIcon,
  SidebarShipIcon,
  SidebarShieldIcon,
  SidebarSlidersIcon,
  SidebarStarIcon,
  SidebarTicketIcon,
  SidebarUserCircleIcon,
  SidebarUsersIcon,
  cn,
} from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import {
  adminDashboardNavConfig,
  adminBreadcrumbExtraRoutes,
  navGroupMessageKey,
  type AdminNavBadgeKey,
  type AdminNavLinkConfig,
} from './dashboard-nav.config';

export {
  adminDashboardNavConfig,
  adminBreadcrumbExtraRoutes,
  buildAdminMiddlewareMatcher,
  flattenAdminNavHrefs,
  getAdminRouteRootSegments,
  navGroupMessageKey,
  type AdminNavBadgeKey,
} from './dashboard-nav.config';

function SidebarHelpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function SidebarChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

const iconMap: Record<string, ReactNode> = {
  dashboard: <SidebarDashboardIcon />,
  chart: <SidebarChartIcon />,
  bell: <SidebarBellIcon />,
  users: <SidebarUsersIcon />,
  userCircle: <SidebarUserCircleIcon />,
  mapPin: <SidebarMapPinIcon />,
  creditCard: <SidebarCreditCardIcon />,
  shield: <SidebarShieldIcon />,
  document: <SidebarDocumentIcon />,
  gift: <SidebarGiftIcon />,
  package: <SidebarPackageIcon />,
  properties: <SidebarPropertiesIcon />,
  plane: <SidebarPlaneIcon />,
  car: <SidebarCarIcon />,
  ship: <SidebarShipIcon />,
  activity: <SidebarActivityIcon />,
  globe: <SidebarGlobeIcon />,
  bookings: <SidebarBookingsIcon />,
  list: <SidebarListIcon />,
  payments: <SidebarPaymentsIcon />,
  ticket: <SidebarTicketIcon />,
  star: <SidebarStarIcon />,
  headset: <SidebarHeadsetIcon />,
  chat: <SidebarChatIcon />,
  organisations: <SidebarOrganisationsIcon />,
  roles: <SidebarRolesIcon />,
  settings: <SidebarSettingsIcon />,
  mail: <SidebarMailIcon />,
  sliders: <SidebarSlidersIcon />,
  help: <SidebarHelpIcon />,
};

function resolveIcon(key: string): ReactNode | undefined {
  return iconMap[key];
}

function resolveLinkLabel(link: AdminNavLinkConfig, tNav: (key: string) => string): string {
  if (link.labelKey === 'dashboard' || link.labelKey === 'analytics') {
    return tNav(link.labelKey);
  }
  return tNav(`links.${link.labelKey}`);
}

function translateNavLinkLabel(tNav: (key: string) => string, labelKey: string): string {
  const messageKey = `links.${labelKey}`;
  const value = tNav(messageKey);
  // next-intl renvoie le chemin complet si la clé est absente du bundle messages.
  if (value === `nav.${messageKey}` || value === messageKey) {
    if (labelKey === 'support' || labelKey === 'supportHub') {
      return 'Support';
    }
  }
  return value;
}

export function buildAdminBreadcrumbRoutes(
  tNav: (key: string) => string,
): { href: string; label: string }[] {
  return adminBreadcrumbExtraRoutes.map((route) => ({
    href: route.href,
    label: tNav(`links.${route.labelKey}`),
  }));
}

export function buildAdminDashboardNav(tNav: (key: string) => string): SidebarNavEntry[] {
  return adminDashboardNavConfig.map((entry) => {
    if (entry.type === 'link') {
      return {
        type: 'link',
        href: entry.href,
        label: resolveLinkLabel(entry, tNav),
        icon: resolveIcon(entry.iconKey),
      };
    }
    return {
      type: 'group',
      id: entry.id,
      label: tNav(`groups.${navGroupMessageKey(entry.id)}`),
      icon: resolveIcon(entry.iconKey),
      defaultOpen: entry.defaultOpen,
      children: entry.children.map((child) => ({
        href: child.href,
        label: translateNavLinkLabel(tNav, child.labelKey),
        icon: resolveIcon(child.iconKey),
      })),
    };
  });
}

const navBadgeHrefMap = (() => {
  const map = new Map<string, AdminNavBadgeKey>();
  for (const entry of adminDashboardNavConfig) {
    if (entry.type !== 'group') continue;
    for (const child of entry.children) {
      if (child.badgeKey) {
        map.set(child.href, child.badgeKey);
      }
    }
  }
  return map;
})();

/** Applique les compteurs nav aux entrées sidebar (après filtrage RBAC). */
export function applyNavBadgeCounts(
  navItems: SidebarNavEntry[],
  counts: Partial<Record<AdminNavBadgeKey, number>>,
): SidebarNavEntry[] {
  if (navBadgeHrefMap.size === 0) {
    return navItems;
  }

  return navItems.map((entry) => {
    if (entry.type !== 'group') {
      return entry;
    }

    let changed = false;
    const children = entry.children.map((child) => {
      const badgeKey = navBadgeHrefMap.get(child.href);
      if (!badgeKey) {
        return child;
      }
      const count = counts[badgeKey];
      if (count == null || count <= 0) {
        if (child.badge != null) {
          changed = true;
          return { ...child, badge: undefined };
        }
        return child;
      }
      if (child.badge === count) {
        return child;
      }
      changed = true;
      return { ...child, badge: count };
    });

    return changed ? { ...entry, children } : entry;
  });
}
