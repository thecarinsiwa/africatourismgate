import type { BreadcrumbItem } from '@africatourismgate/ui';

const CRUISE_LINES_HREF = '/produits/croisieres/lignes';

export type CruiseBreadcrumbOptions = {
  lineName: string;
  shipName?: string;
  shipId?: string;
  itineraryName?: string;
  itineraryId?: string;
  departureLabel?: string;
};

/** Segments dynamiques après le préfixe « Croisières » (shell). */
export function buildCruiseBreadcrumbTail(options: CruiseBreadcrumbOptions): BreadcrumbItem[] {
  const tail: BreadcrumbItem[] = [{ label: options.lineName, href: CRUISE_LINES_HREF }];

  if (options.shipName && options.shipId) {
    tail.push({
      label: options.shipName,
      href: `/produits/croisieres/navires/${options.shipId}`,
    });
  } else if (options.shipName) {
    tail.push({ label: options.shipName });
  }

  if (options.itineraryName) {
    if (options.itineraryId && options.shipId) {
      tail.push({
        label: options.itineraryName,
        href: `/produits/croisieres/navires/${options.shipId}/itineraires/${options.itineraryId}`,
      });
    } else {
      tail.push({ label: options.itineraryName });
    }
  }

  if (options.departureLabel) {
    tail.push({ label: options.departureLabel });
  }

  return tail;
}
