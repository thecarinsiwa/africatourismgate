import type { SidebarNavEntry } from '@africatourismgate/ui';
import {
  SidebarDashboardIcon,
  SidebarPaymentsIcon,
} from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import { posNavConfig } from './nav.config';

const iconMap: Record<string, ReactNode> = {
  dashboard: <SidebarDashboardIcon />,
  payments: <SidebarPaymentsIcon />,
};

export const posNavItems: SidebarNavEntry[] = posNavConfig.map((item) => ({
  type: 'link' as const,
  href: item.href,
  label: item.label,
  icon: iconMap[item.iconKey],
}));
