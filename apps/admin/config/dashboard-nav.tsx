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
  type AdminNavEntryConfig,
  type AdminNavLinkConfig,
} from './dashboard-nav.config';

export {
  adminDashboardNavConfig,
  buildAdminMiddlewareMatcher,
  flattenAdminNavHrefs,
  getAdminRouteRootSegments,
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

function mapLink(link: AdminNavLinkConfig): SidebarNavEntry & { type: 'link' } {
  return {
    type: 'link',
    href: link.href,
    label: link.label,
    icon: resolveIcon(link.iconKey),
  };
}

function mapConfigToNav(entries: AdminNavEntryConfig[]): SidebarNavEntry[] {
  return entries.map((entry) => {
    if (entry.type === 'link') {
      return mapLink(entry);
    }
    return {
      type: 'group',
      id: entry.id,
      label: entry.label,
      icon: resolveIcon(entry.iconKey),
      defaultOpen: entry.defaultOpen,
      children: entry.children.map((child) => ({
        href: child.href,
        label: child.label,
        icon: resolveIcon(child.iconKey),
      })),
    };
  });
}

/** Navigation du shell dashboard admin (groupes repliables + icônes). */
export const adminDashboardNav: SidebarNavEntry[] = mapConfigToNav(adminDashboardNavConfig);
