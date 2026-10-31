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

const PACKAGE_ITEM_TYPE_ICONS: Record<
  PackageItemType,
  ComponentType<PackageItemTypeIconProps>
> = {
  property: SidebarPropertiesIcon,
  flight: SidebarPlaneIcon,
  vehicle: SidebarCarIcon,
  cruise: SidebarShipIcon,
  activity: SidebarActivityIcon,
  troncon: SidebarCarIcon,
};

export const PACKAGE_ITEM_TYPES = Object.keys(
  PACKAGE_ITEM_TYPE_ICONS,
) as PackageItemType[];

/** Types proposés à l’ajout dans un forfait (véhicule nu remplacé par tronçon). */
export const PACKAGE_ITEM_TYPES_ADDABLE = PACKAGE_ITEM_TYPES.filter(
  (type) => type !== 'vehicle',
);

export function getPackageItemTypeLabel(
  itemType: PackageItemType,
  labels: Record<PackageItemType, string>,
): string {
  return labels[itemType];
}

export function getPackageItemTypeIcon(
  itemType: PackageItemType,
): ComponentType<PackageItemTypeIconProps> {
  return PACKAGE_ITEM_TYPE_ICONS[itemType];
}
