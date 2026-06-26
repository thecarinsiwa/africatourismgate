export type TourGuideType = 'internal' | 'external';

export type TourGuideStatus = 'active' | 'inactive';

export type BookingGuideRole = 'primary' | 'secondary';

export type BookingMode = 'immediate' | 'assisted';

/** Per vertical booking mode (CE-11 will consume this from organization_settings). */
export type BookingItemTypeModes = Partial<
  Record<
    | 'room'
    | 'flight_class'
    | 'vehicle'
    | 'cabin'
    | 'activity_schedule'
    | 'package',
    BookingMode
  >
>;

export interface TourGuide {
  id: string;
  type: TourGuideType;
  userId: string | null;
  organizationId: string | null;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  languages: string[];
  destinations: string[];
  status: TourGuideStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface BookingGuideAssignment {
  id: string;
  bookingId: string;
  guideId: string;
  role: BookingGuideRole;
  assignedAt: string;
  assignedByUserId: string | null;
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  userId: string | null;
  body: string;
  isStaff: boolean;
  createdAt: string;
  updatedAt: string | null;
}
