import type { SidebarNavEntry } from '@africatourismgate/ui';
import {
  SidebarActivityIcon,
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
  SidebarStarIcon,
  SidebarTicketIcon,
  SidebarUserCircleIcon,
  SidebarUsersIcon,
} from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import {
  adminDashboardNavConfig,
  navGroupMessageKey,
  type AdminNavLinkConfig,
} from './dashboard-nav.config';

export {
  adminDashboardNavConfig,
  buildAdminMiddlewareMatcher,
  flattenAdminNavHrefs,
  getAdminRouteRootSegments,
  navGroupMessageKey,
} from './dashboard-nav.config';

const iconMap: Record<string, ReactNode> = {
  dashboard: <SidebarDashboardIcon />,
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
};

function resolveIcon(key: string): ReactNode | undefined {
  return iconMap[key];
}

function resolveLinkLabel(link: AdminNavLinkConfig, tNav: (key: string) => string): string {
  if (link.labelKey === 'dashboard') {
    return tNav('dashboard');
  }
  return tNav(`links.${link.labelKey}`);
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
        label: tNav(`links.${child.labelKey}`),
        icon: resolveIcon(child.iconKey),
      })),
    };
  });
}
