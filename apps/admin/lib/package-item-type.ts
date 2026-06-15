import {
  SidebarActivityIcon,
  SidebarCarIcon,
  SidebarPlaneIcon,
  SidebarPropertiesIcon,
  SidebarShipIcon,
} from '@africatourismgate/ui';
import type { PackageItemType } from '@africatourismgate/types';
import type { ComponentType } from 'react';

type PackageItemTypeIconProps = { className?: string };

export const PACKAGE_ITEM_TYPE_LABELS: Record<PackageItemType, string> = {
  property: 'Hébergement',
  flight: 'Vol',
  vehicle: 'Véhicule',
  cruise: 'Cabine (croisière)',
  activity: 'Activité',
};

const PACKAGE_ITEM_TYPE_ICONS: Record<
  PackageItemType,
  ComponentType<PackageItemTypeIconProps>
> = {
  property: SidebarPropertiesIcon,
  flight: SidebarPlaneIcon,
  vehicle: SidebarCarIcon,
  cruise: SidebarShipIcon,
  activity: SidebarActivityIcon,
};

export const PACKAGE_ITEM_TYPES = Object.keys(
  PACKAGE_ITEM_TYPE_LABELS,
) as PackageItemType[];

export function getPackageItemTypeLabel(itemType: PackageItemType): string {
  return PACKAGE_ITEM_TYPE_LABELS[itemType];
}

export function getPackageItemTypeIcon(
  itemType: PackageItemType,
): ComponentType<PackageItemTypeIconProps> {
  return PACKAGE_ITEM_TYPE_ICONS[itemType];
}
