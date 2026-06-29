export type BookingMode = 'immediate' | 'assisted';
export type BookingItemTypeKey = 'room' | 'flight_class' | 'vehicle' | 'cabin' | 'activity_schedule' | 'package';
export type BookingItemTypeModes = Partial<Record<BookingItemTypeKey, BookingMode>>;
export type ResolvedBookingItemTypeModes = Record<BookingItemTypeKey, BookingMode>;
export declare const BOOKING_ITEM_TYPE_KEYS: readonly ["room", "flight_class", "vehicle", "cabin", "activity_schedule", "package"];
export declare const DEFAULT_BOOKING_ITEM_TYPE_MODES: ResolvedBookingItemTypeModes;
export declare function isBookingMode(value: unknown): value is BookingMode;
export declare function normalizeBookingItemTypeModes(raw: Partial<Record<BookingItemTypeKey, unknown>> | null | undefined): ResolvedBookingItemTypeModes;
export declare function resolveBookingModeForItemType(itemType: BookingItemTypeKey | string, modes?: ResolvedBookingItemTypeModes): BookingMode;
export declare function resolveCheckoutBookingMode(input: {
    packageId?: string | null;
    itemTypes: string[];
    modes?: ResolvedBookingItemTypeModes;
}): BookingMode;
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
    languages?: string[];
    destinations?: string[];
    status?: TourGuideStatus;
}
export interface AssignBookingGuideItem {
    guideId: string;
    role?: BookingGuideRole;
}
export interface AssignBookingGuidesRequest {
    guides: AssignBookingGuideItem[];
}
export interface BookingGuideAssignment {
    id: string;
    bookingId: string;
    guideId: string;
    role: BookingGuideRole;
    assignedAt: string;
    assignedByUserId: string | null;
}
