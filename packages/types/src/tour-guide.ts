export type BookingMode = 'immediate' | 'assisted';

export type BookingItemTypeKey =
  | 'room'
  | 'flight_class'
  | 'vehicle'
  | 'cabin'
  | 'activity_schedule'
  | 'package';

/** Per vertical booking mode — stored in `organization_settings` (group `booking`, key `item_type_modes`). */
export type BookingItemTypeModes = Partial<Record<BookingItemTypeKey, BookingMode>>;

export type ResolvedBookingItemTypeModes = Record<BookingItemTypeKey, BookingMode>;

export const BOOKING_ITEM_TYPE_KEYS = [
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
  'package',
] as const satisfies readonly BookingItemTypeKey[];

export const DEFAULT_BOOKING_ITEM_TYPE_MODES: ResolvedBookingItemTypeModes = {
  room: 'immediate',
  flight_class: 'immediate',
  vehicle: 'immediate',
  cabin: 'immediate',
  activity_schedule: 'assisted',
  package: 'assisted',
};

const BOOKING_MODE_VALUES = new Set<BookingMode>(['immediate', 'assisted']);

export function isBookingMode(value: unknown): value is BookingMode {
  return typeof value === 'string' && BOOKING_MODE_VALUES.has(value as BookingMode);
}

export function normalizeBookingItemTypeModes(
  raw: Partial<Record<BookingItemTypeKey, unknown>> | null | undefined,
): ResolvedBookingItemTypeModes {
  const result = { ...DEFAULT_BOOKING_ITEM_TYPE_MODES };
  if (!raw || typeof raw !== 'object') {
    return result;
  }
  for (const key of BOOKING_ITEM_TYPE_KEYS) {
    const value = raw[key];
    if (isBookingMode(value)) {
      result[key] = value;
    }
  }
  return result;
}

export function resolveBookingModeForItemType(
  itemType: BookingItemTypeKey | string,
  modes: ResolvedBookingItemTypeModes = DEFAULT_BOOKING_ITEM_TYPE_MODES,
): BookingMode {
  if (itemType === 'package') {
    return modes.package;
  }
  if (BOOKING_ITEM_TYPE_KEYS.includes(itemType as BookingItemTypeKey)) {
    return modes[itemType as BookingItemTypeKey];
  }
  return 'immediate';
}

export function resolveCheckoutBookingMode(input: {
  packageId?: string | null;
  itemTypes: string[];
  modes?: ResolvedBookingItemTypeModes;
}): BookingMode {
  const modes = input.modes ?? DEFAULT_BOOKING_ITEM_TYPE_MODES;
  if (input.packageId) {
    return modes.package;
  }
  if (input.itemTypes.length === 0) {
    return 'immediate';
  }
  const resolved = input.itemTypes.map((itemType) => resolveBookingModeForItemType(itemType, modes));
  if (resolved.every((mode) => mode === 'immediate')) {
    return 'immediate';
  }
  if (resolved.every((mode) => mode === 'assisted')) {
    return 'assisted';
  }
  return 'assisted';
}

import type { BookingStatus } from './booking.js';

export type TourGuideType = 'internal' | 'external';

export type TourGuideStatus = 'active' | 'inactive';

export type BookingGuideRole = 'primary' | 'secondary';

export interface TourGuide {
  id: string;
  type: TourGuideType;
  userId: string | null;
  organizationId: string | null;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  contactEmail: string | null;
  languages: string[];
  destinations: string[];
  status: TourGuideStatus;
  user?: TourGuideUserSummary;
  createdAt: string;
  updatedAt: string | null;
}

export interface TourGuideUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface TourGuidesListQuery {
  page?: number;
  limit?: number;
  type?: TourGuideType;
  status?: TourGuideStatus;
  destinationId?: string;
  organizationId?: string;
  search?: string;
}

export interface CreateTourGuideRequest {
  type: TourGuideType;
  userId?: string;
  organizationId?: string;
  displayName: string;
  bio?: string;
  photoUrl?: string;
  contactEmail?: string;
  languages: string[];
  destinations: string[];
  status?: TourGuideStatus;
}

export interface UpdateTourGuideRequest {
  type?: TourGuideType;
  userId?: string | null;
  organizationId?: string | null;
  displayName?: string;
  bio?: string | null;
  photoUrl?: string | null;
  contactEmail?: string | null;
  languages?: string[];
  destinations?: string[];
  status?: TourGuideStatus;
}

export interface AssignBookingGuideItem {
  guideId: string;
  role?: BookingGuideRole;
  startDatetime: string;
  endDatetime: string;
  notes?: string;
}

export interface AssignBookingGuidesRequest {
  guides: AssignBookingGuideItem[];
}

export interface UpdateBookingGuideAssignmentRequest {
  role?: BookingGuideRole;
  startDatetime?: string;
  endDatetime?: string;
  notes?: string | null;
}

export interface RemoveBookingGuideRequest {
  comment?: string;
}

export interface GuideScheduleConflict {
  kind: 'assignment' | 'unavailability';
  id: string;
  guideId: string;
  bookingId?: string;
  startDatetime: string;
  endDatetime: string;
}

export interface BookingGuideAssignment {
  id: string;
  bookingId: string;
  guideId: string;
  role: BookingGuideRole;
  startDatetime: string;
  endDatetime: string;
  notes: string | null;
  assignedAt: string;
  assignedByUserId: string | null;
}

export interface TourGuideBookingListItem {
  assignmentId: string;
  role: BookingGuideRole;
  startDatetime: string;
  endDatetime: string;
  assignedAt: string;
  bookingId: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  createdAt: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  organizationId: string | null;
}

export interface TourGuideBookingsListQuery {
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export type GuideCalendarDayStatus = 'available' | 'occupied' | 'unavailable';

export type GuideAvailabilityStatus = 'available' | 'unavailable';

export interface TourGuideCalendarSummaryDay {
  date: string;
  available: number;
  occupied: number;
  unavailable: number;
  totalActive: number;
}

export interface TourGuideCalendarSummary {
  month: string;
  days: TourGuideCalendarSummaryDay[];
}

export interface TourGuideCalendarDayGuide {
  guideId: string;
  displayName: string;
  photoUrl: string | null;
  status: GuideCalendarDayStatus;
  bookingId?: string;
  assignmentId?: string;
  role?: BookingGuideRole;
  slots: GuideCalendarScheduleSlot[];
}

export interface GuideCalendarScheduleSlot {
  type: 'assignment' | 'unavailable';
  startDatetime: string;
  endDatetime: string;
  assignmentId?: string;
  bookingId?: string;
  role?: BookingGuideRole;
  availabilityId?: string;
}

export interface TourGuideCalendarDayDetail {
  date: string;
  guides: TourGuideCalendarDayGuide[];
}

export interface TourGuideAvailableQuery {
  from: string;
  to: string;
  destinationId?: string;
  organizationId?: string;
}

export interface TourGuideAvailableItem {
  id: string;
  displayName: string;
  photoUrl: string | null;
  type: TourGuideType;
  languages: string[];
  destinations: string[];
}

export interface TourGuideCalendarSummaryQuery {
  month: string;
  destinationId?: string;
  organizationId?: string;
}

export interface TourGuideCalendarDayQuery {
  date: string;
  destinationId?: string;
  organizationId?: string;
}

export interface UpsertGuideAvailabilityRequest {
  date?: string;
  startDatetime?: string;
  endDatetime?: string;
  availabilityId?: string;
  status: GuideAvailabilityStatus;
}

export interface GuideAvailabilitySlot {
  guideId: string;
  date?: string;
  startDatetime: string;
  endDatetime: string;
  status: GuideAvailabilityStatus;
}

export type BookingGuideAssignmentHistoryAction = 'created' | 'updated' | 'deleted';

export interface BookingGuideAssignmentHistorySnapshot {
  bookingId: string;
  guideId: string;
  role: BookingGuideRole;
  startDatetime: string;
  endDatetime: string;
  notes: string | null;
}

export interface BookingGuideAssignmentHistoryItem {
  id: string;
  assignmentId: string;
  bookingId: string;
  guideId: string;
  action: BookingGuideAssignmentHistoryAction;
  snapshot: BookingGuideAssignmentHistorySnapshot;
  actorUserId: string | null;
  actorDisplayName: string | null;
  guideDisplayName: string | null;
  createdAt: string;
}
