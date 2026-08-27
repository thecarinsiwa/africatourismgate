import type {
  Activity,
  BookingCheckoutItem,
  Cabin,
  Flight,
  FlightClass,
  Package,
  PackagePricing,
  Room,
  Vehicle,
} from '@africatourismgate/types';

export type SaleCatalogFilter =
  | 'all'
  | 'activity'
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin'
  | 'package';

/** Catalog search kind (activities map to checkout `activity_schedule`). */
export type SaleCatalogKind =
  | 'activity'
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin'
  | 'package';

export type SaleCatalogHitBase = {
  hitId: string;
  kind: SaleCatalogKind;
  title: string;
  subtitle: string;
  priceCents: number;
  currency: string;
};

export type ActivityCatalogHit = SaleCatalogHitBase & {
  kind: 'activity';
  activity: Activity;
};

export type RoomCatalogHit = SaleCatalogHitBase & {
  kind: 'room';
  room: Room;
  propertyName: string;
};

export type FlightClassCatalogHit = SaleCatalogHitBase & {
  kind: 'flight_class';
  flightClass: FlightClass;
  flight: Flight | null;
  flightLabel: string;
};

export type VehicleCatalogHit = SaleCatalogHitBase & {
  kind: 'vehicle';
  vehicle: Vehicle;
};

export type CabinCatalogHit = SaleCatalogHitBase & {
  kind: 'cabin';
  cabin: Cabin;
};

export type PackageCatalogHit = SaleCatalogHitBase & {
  kind: 'package';
  package: Package;
  pricing: PackagePricing;
};

export type SaleCatalogHit =
  | ActivityCatalogHit
  | RoomCatalogHit
  | FlightClassCatalogHit
  | VehicleCatalogHit
  | CabinCatalogHit
  | PackageCatalogHit;

export type SaleCartLine = {
  id: string;
  label: string;
  item: BookingCheckoutItem;
};

export function isPackageCheckoutItem(item: BookingCheckoutItem): boolean {
  return item.itemType === 'package';
}

export function cartHasPackage(lines: SaleCartLine[]): boolean {
  return lines.some((line) => isPackageCheckoutItem(line.item));
}

export function cartHasNonPackage(lines: SaleCartLine[]): boolean {
  return lines.some((line) => !isPackageCheckoutItem(line.item));
}

/** `packageId` pour checkout-preview / createBooking (ligne forfait unique). */
export function getCartPackageId(lines: SaleCartLine[]): string | undefined {
  const pkgLine = lines.find((line) => isPackageCheckoutItem(line.item));
  return pkgLine?.item.referenceId;
}

/** Client nominatif sélectionné (null = client de passage). */
export type SaleCartCustomer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
