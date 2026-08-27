import type {
  Activity,
  BookingCheckoutItem,
  Cabin,
  Flight,
  FlightClass,
  Room,
  Vehicle,
} from '@africatourismgate/types';

export type SaleCatalogFilter =
  | 'all'
  | 'activity'
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin';

/** Catalog search kind (activities map to checkout `activity_schedule`). */
export type SaleCatalogKind =
  | 'activity'
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin';

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

export type SaleCatalogHit =
  | ActivityCatalogHit
  | RoomCatalogHit
  | FlightClassCatalogHit
  | VehicleCatalogHit
  | CabinCatalogHit;

export type SaleCartLine = {
  id: string;
  label: string;
  item: BookingCheckoutItem;
};

/** Client nominatif sélectionné (null = client de passage). */
export type SaleCartCustomer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
