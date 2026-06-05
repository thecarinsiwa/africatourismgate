/** Row audit fields aligned with database `*_user_id` columns */
export interface AuditFields {
  createdByUserId: string | null;
  updatedByUserId: string | null;
  deletedByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export type UUID = string;

export type {
  AuthResponse,
  AuthMe,
  AuthTokens,
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserStatus,
} from './auth.js';

export type {
  CreateUserAddressRequest,
  CreateUserPaymentMethodRequest,
  LoyaltyAccount,
  LoyaltyAccountsListQuery,
  LoyaltyTier,
  UpdateProfileRequest,
  UpdateUserAddressRequest,
  UpdateUserPaymentMethodRequest,
  UserAddress,
  UserAddressesListQuery,
  UserPaymentMethod,
  UserPaymentMethodsListQuery,
  UserPaymentMethodType,
} from './account.js';

export type {
  PaginatedResponse,
  PaginationMeta,
  PaginationQuery,
  PaymentStatus,
  SucceededPaymentsRevenue,
} from './pagination.js';

export type {
  PaymentAdminDetail,
  PaymentListItem,
  PaymentsListQuery,
  RefundPaymentRequest,
} from './payment.js';

export type {
  CreatePromoCodeRequest,
  PromoCode,
  PromoCodeDiscountType,
  PromoCodesListQuery,
  UpdatePromoCodeRequest,
} from './promo-code.js';

export type {
  CreatePromotionRequest,
  Promotion,
  PromotionsListQuery,
  UpdatePromotionRequest,
} from './promotion.js';

export type {
  CreateOrganizationRequest,
  Organization,
  OrganizationStatus,
  UpdateOrganizationRequest,
} from './organization.js';

export type {
  Airline,
  AirlinesListQuery,
  Airport,
  AirportsListQuery,
  BulkUpsertFlightClassAvailabilityRequest,
  BulkUpsertFlightClassAvailabilityResponse,
  CreateAirlineRequest,
  CreateAirportRequest,
  CreateFlightClassAvailabilityRequest,
  CreateFlightClassRequest,
  CreateFlightRequest,
  Flight,
  FlightClass,
  FlightClassAvailability,
  FlightClassAvailabilityListQuery,
  FlightClassName,
  FlightClassesListQuery,
  FlightsListQuery,
  UpdateAirlineRequest,
  UpdateAirportRequest,
  UpdateFlightClassAvailabilityRequest,
  UpdateFlightClassRequest,
  UpdateFlightRequest,
} from './flight.js';

export type {
  Cabin,
  CabinAvailability,
  CabinAvailabilityListQuery,
  CabinsListQuery,
  CreateCabinAvailabilityRequest,
  CreateCabinRequest,
  CreateCruiseLineRequest,
  CreateCruisePortRequest,
  CreateCruiseSailingRequest,
  CreateItineraryPortRequest,
  CreateItineraryRequest,
  CreateShipRequest,
  CruiseLine,
  CruiseLinesListQuery,
  CruisePort,
  CruisePortsListQuery,
  CruiseSailing,
  CruiseSailingsListQuery,
  Itinerary,
  ItinerariesListQuery,
  ItineraryPort,
  ItineraryPortsListQuery,
  Ship,
  ShipsListQuery,
  UpdateCabinAvailabilityRequest,
  UpdateCabinRequest,
  UpdateCruiseLineRequest,
  UpdateCruisePortRequest,
  UpdateCruiseSailingRequest,
  UpdateItineraryPortRequest,
  UpdateItineraryRequest,
  UpdateShipRequest,
} from './cruise.js';

export type {
  CreateRentalAgencyRequest,
  CreateVehicleAvailabilityRequest,
  CreateVehicleCategoryRequest,
  CreateVehicleRequest,
  RentalAgenciesListQuery,
  RentalAgency,
  UpdateRentalAgencyRequest,
  UpdateVehicleAvailabilityRequest,
  UpdateVehicleCategoryRequest,
  UpdateVehicleRequest,
  Vehicle,
  VehicleAvailability,
  VehicleAvailabilityListQuery,
  VehicleAvailabilityStatus,
  VehicleCategoriesListQuery,
  VehicleCategory,
  VehiclesListQuery,
} from './car-rental.js';

export type {
  Activity,
  ActivitiesListQuery,
  ActivityProvider,
  ActivityProvidersListQuery,
  ActivitySchedule,
  ActivitySchedulesListQuery,
  CreateActivityProviderRequest,
  CreateActivityRequest,
  CreateActivityScheduleRequest,
  UpdateActivityProviderRequest,
  UpdateActivityRequest,
  UpdateActivityScheduleRequest,
} from './activity.js';

export type {
  Booking,
  BookingAdminDetail,
  BookingClient,
  BookingListItem,
  BookingPayment,
  BookingStatusHistoryEntry,
  BookingCheckoutSessionResponse,
  BookingPaymentIntentResponse,
  RefundPaymentResponse,
  CancelBookingRequest,
  RecordCashPaymentRequest,
  UpdateBookingStatusRequest,
  BookingCheckoutItem,
  BookingCheckoutItemType,
  BookingCheckoutLine,
  AppliedCheckoutDiscount,
  BookingCheckoutPreview,
  BookingCheckoutRequest,
  BookingDetail,
  BookingItem,
  BookingsListQuery,
  BookingStatus,
} from './booking.js';

export type {
  AdminReviewDetail,
  AdminReviewListItem,
  CreateBookingReviewRequest,
  PropertyReviewSummary,
  PropertyReviewsListQuery,
  Review,
  ReviewStatus,
  ReviewsListQuery,
  UpdateReviewStatusRequest,
} from './review.js';

export type {
  CreateSupportTicketRequest,
  SupportTicket,
  SupportTicketCreated,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketsListQuery,
} from './support.js';

export type {
  CreatePackageItemRequest,
  CreatePackageRequest,
  Package,
  PackageDetail,
  PackageItem,
  PackageItemEnriched,
  PackageItemType,
  PackageItemsListQuery,
  PackagePricing,
  PackagesListQuery,
  UpdatePackageItemRequest,
  UpdatePackageRequest,
} from './package.js';

export type {
  CreateDestinationRequest,
  CreatePointOfInterestRequest,
  Destination,
  DestinationsListQuery,
  PointOfInterest,
  PointsOfInterestListQuery,
  UpdateDestinationRequest,
  UpdatePointOfInterestRequest,
} from './destination.js';

export type {
  Amenity,
  AmenitiesListQuery,
  CreateAmenityRequest,
  CreatePropertyImageRequest,
  CreatePropertyRequest,
  CreateRoomAvailabilityRequest,
  CreateRoomRequest,
  BulkUpsertRoomAvailabilityRequest,
  BulkUpsertRoomAvailabilityResponse,
  Property,
  PropertyAmenitiesListQuery,
  PropertyAmenitiesPayload,
  PropertyAmenity,
  PropertiesListQuery,
  PropertyImage,
  PropertyImagesListQuery,
  PropertyType,
  ReplacePropertyAmenitiesRequest,
  Room,
  RoomAvailability,
  RoomAvailabilityListQuery,
  RoomsListQuery,
  UpdateAmenityRequest,
  UpdateRoomAvailabilityRequest,
  UpdatePropertyImageRequest,
  UpdatePropertyRequest,
  UpdateRoomRequest,
  PropertySearchQuery,
  PropertySearchResult,
  PropertyDetail,
  PropertyDetailQuery,
  PropertyDetailImage,
  PropertyDetailAmenity,
  PropertyDetailRoom,
  PropertyDetailNightlyPrice,
  PropertyDetailStay,
  PropertyCalendarDay,
  PublicDestination,
} from './accommodation.js';

export type {
  BookingDefaultsValue,
  BrandingPlatformValue,
  BulkUpsertOrganizationSettingsRequest,
  CreateOrganizationBankAccountRequest,
  LocaleSettingValue,
  LoyaltyOneKeySettingValue,
  OrganizationBankAccount,
  OrganizationBankAccountsListQuery,
  OrganizationSetting,
  OrganizationSettingsListQuery,
  UpdateOrganizationBankAccountRequest,
  UpsertOrganizationSettingItem,
} from './organization-settings.js';

export type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UsersListQuery,
} from './user.js';

export type {
  CreateEmployeeRequest,
  Employee,
  EmployeeStatus,
  EmployeeUserSummary,
  EmployeesListQuery,
  UpdateEmployeeRequest,
} from './employee.js';

export type {
  CreateRoleRequest,
  CreateUserRoleAssignmentRequest,
  Permission,
  PermissionsListQuery,
  RbacAuditActor,
  RbacAuditEventType,
  RbacAuditLog,
  RbacAuditLogsListQuery,
  ReplaceRolePermissionsRequest,
  Role,
  RolePermissionsPayload,
  RolesListQuery,
  ScopeType,
  UpdateRoleRequest,
  UserRoleAssignment,
  UserRoleAssignmentsListQuery,
} from './rbac.js';
