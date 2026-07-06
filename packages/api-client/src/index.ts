import type {
  Airline,
  AirlinesListQuery,
  Airport,
  AirportsListQuery,
  Amenity,
  AmenitiesListQuery,
  AuthMe,
  AuthResponse,
  AuthTokens,
  AuthUser,
  CreateAmenityRequest,
  CreateDestinationRequest,
  CreateEmployeeRequest,
  CreateOrganizationRequest,
  CreatePointOfInterestRequest,
  CreatePropertyImageRequest,
  CreatePropertyRequest,
  CreateRoomAvailabilityRequest,
  CreateRoomImageRequest,
  CreateRoomRequest,
  BulkUpsertRoomAvailabilityRequest,
  BulkUpsertRoomAvailabilityResponse,
  BulkUpsertFlightClassAvailabilityRequest,
  BulkUpsertFlightClassAvailabilityResponse,
  CreateRentalAgencyRequest,
  CreateVehicleAvailabilityRequest,
  CreateVehicleCategoryRequest,
  CreateVehicleImageRequest,
  CreateVehicleRequest,
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
  CreateShipImageRequest,
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
  ShipImage,
  ShipImagesListQuery,
  ShipsListQuery,
  UpdateCabinAvailabilityRequest,
  UpdateCabinRequest,
  UpdateCruiseLineRequest,
  UpdateCruisePortRequest,
  UpdateCruiseSailingRequest,
  UpdateItineraryPortRequest,
  UpdateItineraryRequest,
  UpdateShipRequest,
  UpdateShipImageRequest,
  Activity,
  ActivitiesListQuery,
  ActivityImage,
  ActivityImagesListQuery,
  ActivityProvider,
  ActivityProvidersListQuery,
  ActivitySchedule,
  ActivitySchedulesListQuery,
  CreateActivityProviderRequest,
  CreateActivityImageRequest,
  CreateActivityRequest,
  CreateActivityScheduleRequest,
  UpdateActivityProviderRequest,
  UpdateActivityImageRequest,
  UpdateActivityRequest,
  UpdateActivityScheduleRequest,
  ApproveBookingRequest,
  UpdateBookingPricingRequest,
  UpdateBookingVisitDatesRequest,
  RejectBookingRequest,
  BookingAdminDetail,
  BookingCheckoutPreview,
  BookingCheckoutRequest,
  BookingCheckoutSessionResponse,
  BookingDetail,
  BookingIdentityDocument,
  ReviewBookingIdentityDocumentRequest,
  BookingManifestEntry,
  CreateBookingManifestEntryRequest,
  UpdateBookingManifestEntryRequest,
  CreateBookingResponse,
  BookingRequestResponse,
  BookingMessage,
  BookingMessagesList,
  CreateBookingMessageRequest,
  BookingPaymentIntentResponse,
  BookingItemListItem,
  BookingItemsListQuery,
  BookingGuideAssignment,
  AssignBookingGuidesRequest,
  BookingListItem,
  BookingsListQuery,
  AdminReviewDetail,
  AdminReviewListItem,
  CreateBookingReviewRequest,
  ReviewsListQuery,
  UpdateReviewStatusRequest,
  CreateSupportMessageRequest,
  CreateSupportMessageResponse,
  CreateSupportTicketRequest,
  AdminSupportTicketDetail,
  AdminSupportTicketListItem,
  SupportTicketCreated,
  SupportTicketsListQuery,
  UpdateSupportTicketRequest,
  PropertyDetail,
  PropertyDetailQuery,
  PropertyReviewsListQuery,
  Review,
  CancelBookingRequest,
  RecordCashPaymentRequest,
  UpdateBookingStatusRequest,
  CreatePackageImageRequest,
  CreatePackageItemRequest,
  CreatePackageRequest,
  Package,
  PackageDetail,
  PackageImage,
  PackageImagesListQuery,
  PackageItem,
  PackageItemsListQuery,
  PackageSuggestedImageGroup,
  PackagesListQuery,
  UpdatePackageImageRequest,
  UpdatePackageItemRequest,
  UpdatePackageRequest,
  CreateAirlineRequest,
  CreateAirportRequest,
  CreateFlightClassAvailabilityRequest,
  CreateFlightClassRequest,
  CreateFlightImageRequest,
  CreateFlightRequest,
  CreateRoleRequest,
  CreateUserRequest,
  CreateUserRoleAssignmentRequest,
  CreateUserAddressRequest,
  CreateUserPaymentMethodRequest,
  LoyaltyAccount,
  AdminLoyaltyAccountListItem,
  AdjustLoyaltyPointsRequest,
  AdjustLoyaltyPointsResponse,
  LoyaltyAccountsListQuery,
  Employee,
  EmployeesListQuery,
  TourGuide,
  TourGuidesListQuery,
  CreateTourGuideRequest,
  UpdateTourGuideRequest,
  BlogPost,
  BlogPostsListQuery,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  AboutPage,
  AboutPagesListQuery,
  CreateAboutPageRequest,
  UpdateAboutPageRequest,
  TeamMember,
  TeamMembersListQuery,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  AboutResource,
  AboutResourcesListQuery,
  CreateAboutResourceRequest,
  UpdateAboutResourceRequest,
  Permission,
  PermissionsListQuery,
  RbacAuditLog,
  RbacAuditLogsListQuery,
  ReplacePropertyAmenitiesRequest,
  ReplaceRolePermissionsRequest,
  Role,
  RolePermissionsPayload,
  RolesListQuery,
  Room,
  RoomAvailability,
  RoomAvailabilityListQuery,
  RoomImage,
  RoomImagesListQuery,
  RoomsListQuery,
  Destination,
  DestinationRelatedCounts,
  DestinationsListQuery,
  PublicDestination,
  PublicDestinationHighlight,
  Flight,
  FlightClass,
  FlightClassAvailability,
  FlightClassAvailabilityListQuery,
  FlightClassesListQuery,
  FlightImage,
  FlightImagesListQuery,
  FlightsListQuery,
  RentalAgenciesListQuery,
  RentalAgency,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutResponse,
  Organization,
  OrganizationListItem,
  OrganizationsListQuery,
  Property,
  PropertySearchQuery,
  PropertySearchResult,
  PropertyAmenitiesListQuery,
  PropertyAmenitiesPayload,
  PropertyImage,
  PropertyImagesListQuery,
  PropertiesListQuery,
  PointOfInterest,
  PointsOfInterestListQuery,
  PaginatedResponse,
  PaymentAdminDetail,
  PaymentListItem,
  PaymentsListQuery,
  CreatePromoCodeRequest,
  CreatePromotionRequest,
  PromoCode,
  PromoCodesListQuery,
  Promotion,
  PromotionsListQuery,
  UpdatePromotionRequest,
  RefundPaymentRequest,
  RefundPaymentResponse,
  UpdatePromoCodeRequest,
  RegisterRequest,
  VerifyOperationRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SucceededPaymentsRevenue,
  UpdateAmenityRequest,
  UpdateAirlineRequest,
  UpdateAirportRequest,
  UpdateDestinationRequest,
  UpdateEmployeeRequest,
  UpdateFlightClassAvailabilityRequest,
  UpdateFlightClassRequest,
  UpdateFlightImageRequest,
  UpdateFlightRequest,
  UpdateRentalAgencyRequest,
  UpdateVehicleAvailabilityRequest,
  UpdateVehicleCategoryRequest,
  UpdateVehicleImageRequest,
  UpdateVehicleRequest,
  Vehicle,
  VehicleAvailability,
  VehicleAvailabilityListQuery,
  VehicleCategoriesListQuery,
  VehicleCategory,
  VehicleImage,
  VehicleImagesListQuery,
  VehiclesListQuery,
  UpdatePropertyImageRequest,
  UpdatePropertyRequest,
  UpdateRoomAvailabilityRequest,
  UpdateRoomImageRequest,
  UpdateRoomRequest,
  UpdatePointOfInterestRequest,
  BulkUpsertOrganizationSettingsRequest,
  CreateOrganizationBankAccountRequest,
  EmailPreviewRequest,
  EmailPreviewResponse,
  OrganizationBankAccount,
  OrganizationBankAccountsListQuery,
  OrganizationSetting,
  OrganizationSettingsListQuery,
  UpdateOrganizationBankAccountRequest,
  UpdateOrganizationRequest,
  UpdateProfileRequest,
  UpdateRoleRequest,
  UpdateUserRequest,
  UpdateUserAddressRequest,
  UpdateUserPaymentMethodRequest,
  UserAddress,
  UserAddressesListQuery,
  UserPaymentMethod,
  UserPaymentMethodsListQuery,
  UserSession,
  UserSessionsListQuery,
  UserRoleAssignment,
  UserRoleAssignmentsListQuery,
  User,
  UsersListQuery,
} from '@africatourismgate/types';
export type { PaginationQuery } from '@africatourismgate/types';
import { ApiHttpError, parseApiErrorMessage } from './http-error';
import {
  fetchPaginated,
  fetchTotal,
  sumSucceededPaymentsRevenue,
} from './pagination';

export { ApiHttpError, parseApiErrorMessage } from './http-error';

/** OpenAPI-generated types and typed fetch client (see `pnpm codegen:api`). */
export {
  createOpenApiClient,
  openApiBaseUrl,
  openApiLogin,
  type AuthMeResponseBody,
  type AuthResponseDto,
  type AuthTokensResponseDto,
  type AuthUserDto,
  type LoginRequestBody,
  type LoginResponseBody,
  type OpenApiClient,
  type OpenApiClientOptions,
  type OpenApiPaths,
  type paths,
  type components,
} from './generated';

export type {
  AuthMe,
  AuthResponse,
  AuthTokens,
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutResponse,
  PaginatedResponse,
  PaginationMeta,
  PaymentListItem,
  PaymentStatus,
  RefreshTokenRequest,
  RegisterRequest,
  VerifyOperationRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SucceededPaymentsRevenue,
  UserStatus,
  Organization,
  OrganizationListItem,
  OrganizationsListQuery,
  OrganizationStatus,
  Destination,
  DestinationRelatedCounts,
  DestinationsListQuery,
  CreateDestinationRequest,
  CreateEmployeeRequest,
  CreateOrganizationRequest,
  CreatePointOfInterestRequest,
  PointOfInterest,
  PointsOfInterestListQuery,
  UpdateDestinationRequest,
  UpdatePointOfInterestRequest,
  CreateRoleRequest,
  CreateUserRoleAssignmentRequest,
  UpdateEmployeeRequest,
  BulkUpsertOrganizationSettingsRequest,
  CreateOrganizationBankAccountRequest,
  EmailBrandingValue,
  EmailPreviewRequest,
  EmailPreviewResponse,
  EmailPreviewTemplate,
  OrganizationBankAccount,
  OrganizationBankAccountsListQuery,
  OrganizationSetting,
  OrganizationSettingsListQuery,
  UpdateOrganizationBankAccountRequest,
  UpdateOrganizationRequest,
  UpdateRoleRequest,
  CreateUserRequest,
  UpdateUserRequest,
  Employee,
  EmployeesListQuery,
  Permission,
  PermissionsListQuery,
  RbacAuditLog,
  RbacAuditLogsListQuery,
  ReplaceRolePermissionsRequest,
  Role,
  RolePermissionsPayload,
  RolesListQuery,
  User,
  UsersListQuery,
  UserAddress,
  UserAddressesListQuery,
  UserPaymentMethod,
  UserPaymentMethodsListQuery,
  UserPaymentMethodType,
  UserSession,
  UserSessionsListQuery,
  UserRoleAssignment,
  UserRoleAssignmentsListQuery,
  Amenity,
  AmenitiesListQuery,
  CreateAmenityRequest,
  CreatePropertyImageRequest,
  CreatePropertyRequest,
  CreateRoomImageRequest,
  CreateRoomRequest,
  Property,
  PropertyAmenitiesListQuery,
  PropertyAmenitiesPayload,
  PropertyImage,
  PropertyImagesListQuery,
  PropertiesListQuery,
  PropertySearchQuery,
  PropertySearchResult,
  PropertyDetail,
  PropertyDetailQuery,
  PropertyReviewsListQuery,
  Review,
  AdminReviewDetail,
  AdminReviewListItem,
  CreateBookingReviewRequest,
  ReviewsListQuery,
  UpdateReviewStatusRequest,
  PropertyType,
  PublicDestination,
  PublicDestinationHighlight,
  ReplacePropertyAmenitiesRequest,
  Room,
  RoomImage,
  RoomImagesListQuery,
  RoomsListQuery,
  UpdateAmenityRequest,
  UpdatePropertyImageRequest,
  UpdatePropertyRequest,
  UpdateRoomImageRequest,
  UpdateRoomRequest,
} from '@africatourismgate/types';

export { fetchPaginated, fetchTotal, sumSucceededPaymentsRevenue } from './pagination';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientOptions {
  baseUrl: string;
  /** When set, sent as `Authorization: Bearer <token>` on every request (overridable per call). */
  accessToken?: string | null;
}

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, omit Authorization even if an access token is configured on the client. */
  skipAuth?: boolean;
}

export class ApiClient {
  private accessToken: string | null;

  constructor(
    private readonly baseUrl: string,
    accessToken?: string | null,
  ) {
    this.accessToken = accessToken ?? null;
  }

  static fromEnv(accessToken?: string | null): ApiClient {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error(
        'NEXT_PUBLIC_API_URL is not set. Define it in .env (see .env.example).',
      );
    }
    return new ApiClient(baseUrl, accessToken);
  }

  /** Update or clear the bearer token used for authenticated requests. */
  setAccessToken(accessToken: string | null | undefined): void {
    this.accessToken = accessToken ?? null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (!options.skipAuth && this.accessToken && !headers.Authorization) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = undefined;
      }
      const apiMessage = parseApiErrorMessage(body);
      throw new ApiHttpError(res.status, res.statusText, body, apiMessage);
    }

    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    const text = await res.text();
    if (!text.trim()) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  health(): Promise<{ status: string; service: string }> {
    return this.request('/health');
  }

  login(body: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body,
      skipAuth: true,
    });
  }

  register(body: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body,
      skipAuth: true,
    });
  }

  verifyOperation(body: VerifyOperationRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify-operation', {
      method: 'POST',
      body,
      skipAuth: true,
    });
  }

  registerCustomer(body: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register/customer', {
      method: 'POST',
      body,
      skipAuth: true,
    });
  }

  getAuthMe(): Promise<AuthMe> {
    return this.request<AuthMe>('/auth/me');
  }

  listAuthOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>('/auth/me/organizations');
  }

  updateAuthProfile(body: UpdateProfileRequest): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/me', {
      method: 'PATCH',
      body,
    });
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    });
  }

  logout(refreshToken: string): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    });
  }

  forgotPassword(body: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body,
      skipAuth: true,
    });
  }

  resetPassword(body: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body,
      skipAuth: true,
    });
  }

  listUsers(query?: UsersListQuery): Promise<PaginatedResponse<User>> {
    return fetchPaginated<User>(this, '/users', query);
  }

  getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  createUser(body: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body,
    });
  }

  updateUser(id: string, body: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  listUserAddresses(
    query?: UserAddressesListQuery,
  ): Promise<PaginatedResponse<UserAddress>> {
    return fetchPaginated<UserAddress>(this, '/user-addresses', query);
  }

  getUserAddress(id: string): Promise<UserAddress> {
    return this.request<UserAddress>(`/user-addresses/${id}`);
  }

  createUserAddress(body: CreateUserAddressRequest): Promise<UserAddress> {
    return this.request<UserAddress>('/user-addresses', {
      method: 'POST',
      body,
    });
  }

  updateUserAddress(
    id: string,
    body: UpdateUserAddressRequest,
  ): Promise<UserAddress> {
    return this.request<UserAddress>(`/user-addresses/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteUserAddress(id: string): Promise<void> {
    return this.request<void>(`/user-addresses/${id}`, { method: 'DELETE' });
  }

  listLoyaltyAccounts(
    query?: LoyaltyAccountsListQuery,
  ): Promise<PaginatedResponse<LoyaltyAccount | AdminLoyaltyAccountListItem>> {
    return fetchPaginated<LoyaltyAccount | AdminLoyaltyAccountListItem>(
      this,
      '/loyalty-accounts',
      query,
    );
  }

  adjustLoyaltyPoints(
    id: string,
    body: AdjustLoyaltyPointsRequest,
  ): Promise<AdjustLoyaltyPointsResponse> {
    return this.request<AdjustLoyaltyPointsResponse>(
      `/loyalty-accounts/${id}/adjust-points`,
      {
        method: 'POST',
        body,
      },
    );
  }

  listUserPaymentMethods(
    query?: UserPaymentMethodsListQuery,
  ): Promise<PaginatedResponse<UserPaymentMethod>> {
    return fetchPaginated<UserPaymentMethod>(this, '/user-payment-methods', query);
  }

  getUserPaymentMethod(id: string): Promise<UserPaymentMethod> {
    return this.request<UserPaymentMethod>(`/user-payment-methods/${id}`);
  }

  createUserPaymentMethod(
    body: CreateUserPaymentMethodRequest,
  ): Promise<UserPaymentMethod> {
    return this.request<UserPaymentMethod>('/user-payment-methods', {
      method: 'POST',
      body,
    });
  }

  updateUserPaymentMethod(
    id: string,
    body: UpdateUserPaymentMethodRequest,
  ): Promise<UserPaymentMethod> {
    return this.request<UserPaymentMethod>(`/user-payment-methods/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteUserPaymentMethod(id: string): Promise<void> {
    return this.request<void>(`/user-payment-methods/${id}`, { method: 'DELETE' });
  }

  listUserSessions(
    query?: UserSessionsListQuery,
  ): Promise<PaginatedResponse<UserSession>> {
    return fetchPaginated<UserSession>(this, '/user-sessions', query);
  }

  getUserSession(id: string): Promise<UserSession> {
    return this.request<UserSession>(`/user-sessions/${id}`);
  }

  revokeUserSession(id: string): Promise<void> {
    return this.request<void>(`/user-sessions/${id}`, { method: 'DELETE' });
  }

  listProperties(
    query?: PropertiesListQuery,
  ): Promise<PaginatedResponse<Property>> {
    return fetchPaginated<Property>(this, '/properties', query);
  }

  listPublicDestinations(): Promise<PublicDestination[]> {
    return this.request<PublicDestination[]>('/public/destinations', {
      skipAuth: true,
    });
  }

  listFeaturedDestinations(limit = 4): Promise<PublicDestinationHighlight[]> {
    const qs = new URLSearchParams({ limit: String(limit) }).toString();
    return this.request<PublicDestinationHighlight[]>(
      `/public/destinations/featured?${qs}`,
      { skipAuth: true },
    );
  }

  searchAccommodations(
    query?: PropertySearchQuery,
  ): Promise<PaginatedResponse<PropertySearchResult>> {
    return fetchPaginated<PropertySearchResult>(
      this,
      '/public/accommodations/search',
      query,
      { skipAuth: true },
    );
  }

  getAccommodationDetail(
    id: string,
    query?: PropertyDetailQuery,
  ): Promise<PropertyDetail> {
    const qs = new URLSearchParams();
    if (query?.checkIn) qs.set('checkIn', query.checkIn);
    if (query?.checkOut) qs.set('checkOut', query.checkOut);
    if (query?.guests !== undefined) qs.set('guests', String(query.guests));
    if (query?.month) qs.set('month', query.month);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<PropertyDetail>(
      `/public/accommodations/${encodeURIComponent(id)}${suffix}`,
      { skipAuth: true },
    );
  }

  getPropertyReviews(
    propertyId: string,
    query?: PropertyReviewsListQuery,
  ): Promise<PaginatedResponse<Review>> {
    return fetchPaginated<Review>(
      this,
      `/public/accommodations/${encodeURIComponent(propertyId)}/reviews`,
      query,
      { skipAuth: true },
    );
  }

  getProperty(id: string): Promise<Property> {
    return this.request<Property>(`/properties/${id}`);
  }

  createProperty(body: CreatePropertyRequest): Promise<Property> {
    return this.request<Property>('/properties', { method: 'POST', body });
  }

  updateProperty(id: string, body: UpdatePropertyRequest): Promise<Property> {
    return this.request<Property>(`/properties/${id}`, { method: 'PATCH', body });
  }

  deleteProperty(id: string): Promise<void> {
    return this.request<void>(`/properties/${id}`, { method: 'DELETE' });
  }

  listPropertyImages(
    query?: PropertyImagesListQuery,
  ): Promise<PaginatedResponse<PropertyImage>> {
    return fetchPaginated<PropertyImage>(this, '/property-images', query);
  }

  getPropertyImage(id: string): Promise<PropertyImage> {
    return this.request<PropertyImage>(`/property-images/${id}`);
  }

  createPropertyImage(body: CreatePropertyImageRequest): Promise<PropertyImage> {
    return this.request<PropertyImage>('/property-images', { method: 'POST', body });
  }

  updatePropertyImage(
    id: string,
    body: UpdatePropertyImageRequest,
  ): Promise<PropertyImage> {
    return this.request<PropertyImage>(`/property-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deletePropertyImage(id: string): Promise<void> {
    return this.request<void>(`/property-images/${id}`, { method: 'DELETE' });
  }

  listRoomImages(query?: RoomImagesListQuery): Promise<PaginatedResponse<RoomImage>> {
    return fetchPaginated<RoomImage>(this, '/room-images', query);
  }

  getRoomImage(id: string): Promise<RoomImage> {
    return this.request<RoomImage>(`/room-images/${id}`);
  }

  createRoomImage(body: CreateRoomImageRequest): Promise<RoomImage> {
    return this.request<RoomImage>('/room-images', { method: 'POST', body });
  }

  updateRoomImage(id: string, body: UpdateRoomImageRequest): Promise<RoomImage> {
    return this.request<RoomImage>(`/room-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteRoomImage(id: string): Promise<void> {
    return this.request<void>(`/room-images/${id}`, { method: 'DELETE' });
  }

  listRooms(query?: RoomsListQuery): Promise<PaginatedResponse<Room>> {
    return fetchPaginated<Room>(this, '/rooms', query);
  }

  getRoom(id: string): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`);
  }

  createRoom(body: CreateRoomRequest): Promise<Room> {
    return this.request<Room>('/rooms', { method: 'POST', body });
  }

  updateRoom(id: string, body: UpdateRoomRequest): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`, { method: 'PATCH', body });
  }

  deleteRoom(id: string): Promise<void> {
    return this.request<void>(`/rooms/${id}`, { method: 'DELETE' });
  }

  listRoomAvailability(
    query: RoomAvailabilityListQuery,
  ): Promise<PaginatedResponse<RoomAvailability>> {
    return fetchPaginated<RoomAvailability>(this, '/room-availability', query);
  }

  getRoomAvailability(id: string): Promise<RoomAvailability> {
    return this.request<RoomAvailability>(`/room-availability/${id}`);
  }

  createRoomAvailability(
    body: CreateRoomAvailabilityRequest,
  ): Promise<RoomAvailability> {
    return this.request<RoomAvailability>('/room-availability', {
      method: 'POST',
      body,
    });
  }

  updateRoomAvailability(
    id: string,
    body: UpdateRoomAvailabilityRequest,
  ): Promise<RoomAvailability> {
    return this.request<RoomAvailability>(`/room-availability/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteRoomAvailability(id: string): Promise<void> {
    return this.request<void>(`/room-availability/${id}`, { method: 'DELETE' });
  }

  bulkUpsertRoomAvailability(
    body: BulkUpsertRoomAvailabilityRequest,
  ): Promise<BulkUpsertRoomAvailabilityResponse> {
    return this.request<BulkUpsertRoomAvailabilityResponse>(
      '/room-availability/bulk',
      { method: 'PUT', body },
    );
  }

  listAmenities(query?: AmenitiesListQuery): Promise<PaginatedResponse<Amenity>> {
    return fetchPaginated<Amenity>(this, '/amenities', query);
  }

  getAmenity(id: string): Promise<Amenity> {
    return this.request<Amenity>(`/amenities/${id}`);
  }

  createAmenity(body: CreateAmenityRequest): Promise<Amenity> {
    return this.request<Amenity>('/amenities', { method: 'POST', body });
  }

  updateAmenity(id: string, body: UpdateAmenityRequest): Promise<Amenity> {
    return this.request<Amenity>(`/amenities/${id}`, { method: 'PATCH', body });
  }

  deleteAmenity(id: string): Promise<void> {
    return this.request<void>(`/amenities/${id}`, { method: 'DELETE' });
  }

  listPropertyAmenities(
    query?: PropertyAmenitiesListQuery,
  ): Promise<PaginatedResponse<{ propertyId: string; amenityId: string }>> {
    return fetchPaginated(this, '/property-amenities', query);
  }

  replacePropertyAmenities(
    body: ReplacePropertyAmenitiesRequest,
  ): Promise<PropertyAmenitiesPayload> {
    return this.request<PropertyAmenitiesPayload>('/property-amenities/sync', {
      method: 'PUT',
      body,
    });
  }

  listPayments(query?: PaymentsListQuery): Promise<PaginatedResponse<PaymentListItem>> {
    return fetchPaginated<PaymentListItem>(this, '/payments', query);
  }

  getPayment(id: string): Promise<PaymentAdminDetail> {
    return this.request<PaymentAdminDetail>(`/payments/${id}`);
  }

  refundPayment(id: string, body?: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    return this.request<RefundPaymentResponse>(`/payments/${id}/refund`, {
      method: 'POST',
      body: body ?? {},
    });
  }

  listPromoCodes(query?: PromoCodesListQuery): Promise<PaginatedResponse<PromoCode>> {
    return fetchPaginated<PromoCode>(this, '/promo-codes', query);
  }

  getPromoCode(id: string): Promise<PromoCode> {
    return this.request<PromoCode>(`/promo-codes/${id}`);
  }

  createPromoCode(body: CreatePromoCodeRequest): Promise<PromoCode> {
    return this.request<PromoCode>('/promo-codes', { method: 'POST', body });
  }

  updatePromoCode(id: string, body: UpdatePromoCodeRequest): Promise<PromoCode> {
    return this.request<PromoCode>(`/promo-codes/${id}`, { method: 'PATCH', body });
  }

  deletePromoCode(id: string): Promise<void> {
    return this.request<void>(`/promo-codes/${id}`, { method: 'DELETE' });
  }

  listPromotions(query?: PromotionsListQuery): Promise<PaginatedResponse<Promotion>> {
    return fetchPaginated<Promotion>(this, '/promotions', query);
  }

  getPromotion(id: string): Promise<Promotion> {
    return this.request<Promotion>(`/promotions/${id}`);
  }

  createPromotion(body: CreatePromotionRequest): Promise<Promotion> {
    return this.request<Promotion>('/promotions', { method: 'POST', body });
  }

  updatePromotion(id: string, body: UpdatePromotionRequest): Promise<Promotion> {
    return this.request<Promotion>(`/promotions/${id}`, { method: 'PATCH', body });
  }

  deletePromotion(id: string): Promise<void> {
    return this.request<void>(`/promotions/${id}`, { method: 'DELETE' });
  }

  countUsers(): Promise<number> {
    return fetchTotal(this, '/users');
  }

  countBookings(): Promise<number> {
    return fetchTotal(this, '/bookings');
  }

  countProperties(): Promise<number> {
    return fetchTotal(this, '/properties');
  }

  listOrganizations(
    query?: OrganizationsListQuery,
  ): Promise<PaginatedResponse<OrganizationListItem>> {
    return fetchPaginated<OrganizationListItem>(this, '/organizations', query);
  }

  getOrganization(id: string): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`);
  }

  createOrganization(body: CreateOrganizationRequest): Promise<Organization> {
    return this.request<Organization>('/organizations', {
      method: 'POST',
      body,
    });
  }

  updateOrganization(
    id: string,
    body: UpdateOrganizationRequest,
  ): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteOrganization(id: string): Promise<void> {
    return this.request<void>(`/organizations/${id}`, { method: 'DELETE' });
  }

  listOrganizationSettings(
    query?: OrganizationSettingsListQuery,
  ): Promise<PaginatedResponse<OrganizationSetting>> {
    return fetchPaginated<OrganizationSetting>(this, '/organization-settings', query);
  }

  bulkUpsertOrganizationSettings(
    body: BulkUpsertOrganizationSettingsRequest,
  ): Promise<OrganizationSetting[]> {
    return this.request<OrganizationSetting[]>('/organization-settings/bulk', {
      method: 'PUT',
      body,
    });
  }

  previewEmail(body: EmailPreviewRequest): Promise<EmailPreviewResponse> {
    return this.request<EmailPreviewResponse>('/email/preview', {
      method: 'POST',
      body,
    });
  }

  listOrganizationBankAccounts(
    query?: OrganizationBankAccountsListQuery,
  ): Promise<PaginatedResponse<OrganizationBankAccount>> {
    return fetchPaginated<OrganizationBankAccount>(
      this,
      '/organization-bank-accounts',
      query,
    );
  }

  getOrganizationBankAccount(
    id: string,
    organizationId?: string,
  ): Promise<OrganizationBankAccount> {
    const qs = organizationId
      ? `?organizationId=${encodeURIComponent(organizationId)}`
      : '';
    return this.request<OrganizationBankAccount>(
      `/organization-bank-accounts/${id}${qs}`,
    );
  }

  createOrganizationBankAccount(
    body: CreateOrganizationBankAccountRequest,
  ): Promise<OrganizationBankAccount> {
    return this.request<OrganizationBankAccount>('/organization-bank-accounts', {
      method: 'POST',
      body,
    });
  }

  updateOrganizationBankAccount(
    id: string,
    body: UpdateOrganizationBankAccountRequest,
    organizationId?: string,
  ): Promise<OrganizationBankAccount> {
    const qs = organizationId
      ? `?organizationId=${encodeURIComponent(organizationId)}`
      : '';
    return this.request<OrganizationBankAccount>(
      `/organization-bank-accounts/${id}${qs}`,
      { method: 'PATCH', body },
    );
  }

  deleteOrganizationBankAccount(
    id: string,
    organizationId?: string,
  ): Promise<void> {
    const qs = organizationId
      ? `?organizationId=${encodeURIComponent(organizationId)}`
      : '';
    return this.request<void>(`/organization-bank-accounts/${id}${qs}`, {
      method: 'DELETE',
    });
  }

  countOrganizations(): Promise<number> {
    return fetchTotal(this, '/organizations');
  }

  listEmployees(
    query?: EmployeesListQuery,
  ): Promise<PaginatedResponse<Employee>> {
    return fetchPaginated<Employee>(this, '/employees', query);
  }

  getEmployee(id: string): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`);
  }

  createEmployee(body: CreateEmployeeRequest): Promise<Employee> {
    return this.request<Employee>('/employees', {
      method: 'POST',
      body,
    });
  }

  updateEmployee(id: string, body: UpdateEmployeeRequest): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteEmployee(id: string): Promise<void> {
    return this.request<void>(`/employees/${id}`, { method: 'DELETE' });
  }

  listTourGuides(
    query?: TourGuidesListQuery,
  ): Promise<PaginatedResponse<TourGuide>> {
    return fetchPaginated<TourGuide>(this, '/tour-guides', query);
  }

  getTourGuide(id: string): Promise<TourGuide> {
    return this.request<TourGuide>(`/tour-guides/${id}`);
  }

  createTourGuide(body: CreateTourGuideRequest): Promise<TourGuide> {
    return this.request<TourGuide>('/tour-guides', {
      method: 'POST',
      body,
    });
  }

  updateTourGuide(id: string, body: UpdateTourGuideRequest): Promise<TourGuide> {
    return this.request<TourGuide>(`/tour-guides/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteTourGuide(id: string): Promise<void> {
    return this.request<void>(`/tour-guides/${id}`, { method: 'DELETE' });
  }

  listBlogPosts(
    query?: BlogPostsListQuery,
  ): Promise<PaginatedResponse<BlogPost>> {
    return fetchPaginated<BlogPost>(this, '/blog-posts', query);
  }

  getBlogPost(id: string): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog-posts/${id}`);
  }

  createBlogPost(body: CreateBlogPostRequest): Promise<BlogPost> {
    return this.request<BlogPost>('/blog-posts', {
      method: 'POST',
      body,
    });
  }

  updateBlogPost(id: string, body: UpdateBlogPostRequest): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog-posts/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteBlogPost(id: string): Promise<void> {
    return this.request<void>(`/blog-posts/${id}`, { method: 'DELETE' });
  }

  listAboutPages(
    query?: AboutPagesListQuery,
  ): Promise<PaginatedResponse<AboutPage>> {
    return fetchPaginated<AboutPage>(this, '/about-pages', query);
  }

  getAboutPage(id: string): Promise<AboutPage> {
    return this.request<AboutPage>(`/about-pages/${id}`);
  }

  createAboutPage(body: CreateAboutPageRequest): Promise<AboutPage> {
    return this.request<AboutPage>('/about-pages', {
      method: 'POST',
      body,
    });
  }

  updateAboutPage(id: string, body: UpdateAboutPageRequest): Promise<AboutPage> {
    return this.request<AboutPage>(`/about-pages/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteAboutPage(id: string): Promise<void> {
    return this.request<void>(`/about-pages/${id}`, { method: 'DELETE' });
  }

  listTeamMembers(
    query?: TeamMembersListQuery,
  ): Promise<PaginatedResponse<TeamMember>> {
    return fetchPaginated<TeamMember>(this, '/team-members', query);
  }

  getTeamMember(id: string): Promise<TeamMember> {
    return this.request<TeamMember>(`/team-members/${id}`);
  }

  createTeamMember(body: CreateTeamMemberRequest): Promise<TeamMember> {
    return this.request<TeamMember>('/team-members', {
      method: 'POST',
      body,
    });
  }

  updateTeamMember(id: string, body: UpdateTeamMemberRequest): Promise<TeamMember> {
    return this.request<TeamMember>(`/team-members/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteTeamMember(id: string): Promise<void> {
    return this.request<void>(`/team-members/${id}`, { method: 'DELETE' });
  }

  listAboutResources(
    query?: AboutResourcesListQuery,
  ): Promise<PaginatedResponse<AboutResource>> {
    return fetchPaginated<AboutResource>(this, '/about-resources', query);
  }

  getAboutResource(id: string): Promise<AboutResource> {
    return this.request<AboutResource>(`/about-resources/${id}`);
  }

  createAboutResource(body: CreateAboutResourceRequest): Promise<AboutResource> {
    return this.request<AboutResource>('/about-resources', {
      method: 'POST',
      body,
    });
  }

  updateAboutResource(
    id: string,
    body: UpdateAboutResourceRequest,
  ): Promise<AboutResource> {
    return this.request<AboutResource>(`/about-resources/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteAboutResource(id: string): Promise<void> {
    return this.request<void>(`/about-resources/${id}`, { method: 'DELETE' });
  }

  getSucceededPaymentsRevenue(): Promise<SucceededPaymentsRevenue> {
    return sumSucceededPaymentsRevenue(this);
  }

  listRoles(query?: RolesListQuery): Promise<PaginatedResponse<Role>> {
    return fetchPaginated<Role>(this, '/roles', query);
  }

  getRole(id: string): Promise<Role> {
    return this.request<Role>(`/roles/${id}`);
  }

  createRole(body: CreateRoleRequest): Promise<Role> {
    return this.request<Role>('/roles', { method: 'POST', body });
  }

  updateRole(id: string, body: UpdateRoleRequest): Promise<Role> {
    return this.request<Role>(`/roles/${id}`, { method: 'PATCH', body });
  }

  deleteRole(id: string): Promise<void> {
    return this.request<void>(`/roles/${id}`, { method: 'DELETE' });
  }

  getRolePermissions(roleId: string): Promise<RolePermissionsPayload> {
    return this.request<RolePermissionsPayload>(`/roles/${roleId}/permissions`);
  }

  replaceRolePermissions(
    roleId: string,
    body: ReplaceRolePermissionsRequest,
  ): Promise<RolePermissionsPayload> {
    return this.request<RolePermissionsPayload>(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body,
    });
  }

  listPermissions(
    query?: PermissionsListQuery,
  ): Promise<PaginatedResponse<Permission>> {
    return fetchPaginated<Permission>(this, '/permissions', query);
  }

  getPermission(id: string): Promise<Permission> {
    return this.request<Permission>(`/permissions/${id}`);
  }

  listUserRoleAssignments(
    query?: UserRoleAssignmentsListQuery,
  ): Promise<PaginatedResponse<UserRoleAssignment>> {
    return fetchPaginated<UserRoleAssignment>(this, '/user-role-assignments', query);
  }

  getUserRoleAssignment(id: string): Promise<UserRoleAssignment> {
    return this.request<UserRoleAssignment>(`/user-role-assignments/${id}`);
  }

  createUserRoleAssignment(
    body: CreateUserRoleAssignmentRequest,
  ): Promise<UserRoleAssignment> {
    return this.request<UserRoleAssignment>('/user-role-assignments', {
      method: 'POST',
      body,
    });
  }

  revokeUserRoleAssignment(id: string): Promise<UserRoleAssignment> {
    return this.request<UserRoleAssignment>(`/user-role-assignments/${id}/revoke`, {
      method: 'PATCH',
    });
  }

  listRbacAuditLogs(
    query?: RbacAuditLogsListQuery,
  ): Promise<PaginatedResponse<RbacAuditLog>> {
    return fetchPaginated<RbacAuditLog>(this, '/rbac-audit-logs', query);
  }

  getRbacAuditLog(id: string): Promise<RbacAuditLog> {
    return this.request<RbacAuditLog>(`/rbac-audit-logs/${id}`);
  }

  listDestinations(
    query?: DestinationsListQuery,
  ): Promise<PaginatedResponse<Destination>> {
    return fetchPaginated<Destination>(this, '/destinations', query);
  }

  getDestination(id: string): Promise<Destination> {
    return this.request<Destination>(`/destinations/${id}`);
  }

  getDestinationRelatedCounts(id: string): Promise<DestinationRelatedCounts> {
    return this.request<DestinationRelatedCounts>(`/destinations/${id}/related-counts`);
  }

  createDestination(body: CreateDestinationRequest): Promise<Destination> {
    return this.request<Destination>('/destinations', {
      method: 'POST',
      body,
    });
  }

  updateDestination(
    id: string,
    body: UpdateDestinationRequest,
  ): Promise<Destination> {
    return this.request<Destination>(`/destinations/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteDestination(id: string): Promise<void> {
    return this.request<void>(`/destinations/${id}`, { method: 'DELETE' });
  }

  listPointsOfInterest(
    query?: PointsOfInterestListQuery,
  ): Promise<PaginatedResponse<PointOfInterest>> {
    return fetchPaginated<PointOfInterest>(this, '/points-of-interest', query);
  }

  getPointOfInterest(id: string): Promise<PointOfInterest> {
    return this.request<PointOfInterest>(`/points-of-interest/${id}`);
  }

  createPointOfInterest(
    body: CreatePointOfInterestRequest,
  ): Promise<PointOfInterest> {
    return this.request<PointOfInterest>('/points-of-interest', {
      method: 'POST',
      body,
    });
  }

  updatePointOfInterest(
    id: string,
    body: UpdatePointOfInterestRequest,
  ): Promise<PointOfInterest> {
    return this.request<PointOfInterest>(`/points-of-interest/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deletePointOfInterest(id: string): Promise<void> {
    return this.request<void>(`/points-of-interest/${id}`, { method: 'DELETE' });
  }

  listActivityProviders(
    query?: ActivityProvidersListQuery,
  ): Promise<PaginatedResponse<ActivityProvider>> {
    return fetchPaginated<ActivityProvider>(this, '/activity-providers', query);
  }

  getActivityProvider(id: string): Promise<ActivityProvider> {
    return this.request<ActivityProvider>(`/activity-providers/${id}`);
  }

  createActivityProvider(
    body: CreateActivityProviderRequest,
  ): Promise<ActivityProvider> {
    return this.request<ActivityProvider>('/activity-providers', {
      method: 'POST',
      body,
    });
  }

  updateActivityProvider(
    id: string,
    body: UpdateActivityProviderRequest,
  ): Promise<ActivityProvider> {
    return this.request<ActivityProvider>(`/activity-providers/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteActivityProvider(id: string): Promise<void> {
    return this.request<void>(`/activity-providers/${id}`, { method: 'DELETE' });
  }

  listActivities(query?: ActivitiesListQuery): Promise<PaginatedResponse<Activity>> {
    return fetchPaginated<Activity>(this, '/activities', query);
  }

  getActivity(id: string): Promise<Activity> {
    return this.request<Activity>(`/activities/${id}`);
  }

  createActivity(body: CreateActivityRequest): Promise<Activity> {
    return this.request<Activity>('/activities', { method: 'POST', body });
  }

  updateActivity(id: string, body: UpdateActivityRequest): Promise<Activity> {
    return this.request<Activity>(`/activities/${id}`, { method: 'PATCH', body });
  }

  deleteActivity(id: string): Promise<void> {
    return this.request<void>(`/activities/${id}`, { method: 'DELETE' });
  }

  listActivitySchedules(
    query?: ActivitySchedulesListQuery,
  ): Promise<PaginatedResponse<ActivitySchedule>> {
    return fetchPaginated<ActivitySchedule>(this, '/activity-schedules', query);
  }

  getActivitySchedule(id: string): Promise<ActivitySchedule> {
    return this.request<ActivitySchedule>(`/activity-schedules/${id}`);
  }

  createActivitySchedule(
    body: CreateActivityScheduleRequest,
  ): Promise<ActivitySchedule> {
    return this.request<ActivitySchedule>('/activity-schedules', {
      method: 'POST',
      body,
    });
  }

  updateActivitySchedule(
    id: string,
    body: UpdateActivityScheduleRequest,
  ): Promise<ActivitySchedule> {
    return this.request<ActivitySchedule>(`/activity-schedules/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteActivitySchedule(id: string): Promise<void> {
    return this.request<void>(`/activity-schedules/${id}`, { method: 'DELETE' });
  }

  listActivityImages(
    query?: ActivityImagesListQuery,
  ): Promise<PaginatedResponse<ActivityImage>> {
    return fetchPaginated<ActivityImage>(this, '/activity-images', query);
  }

  getActivityImage(id: string): Promise<ActivityImage> {
    return this.request<ActivityImage>(`/activity-images/${id}`);
  }

  createActivityImage(body: CreateActivityImageRequest): Promise<ActivityImage> {
    return this.request<ActivityImage>('/activity-images', { method: 'POST', body });
  }

  updateActivityImage(id: string, body: UpdateActivityImageRequest): Promise<ActivityImage> {
    return this.request<ActivityImage>(`/activity-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteActivityImage(id: string): Promise<void> {
    return this.request<void>(`/activity-images/${id}`, { method: 'DELETE' });
  }

  listPackages(query?: PackagesListQuery): Promise<PaginatedResponse<Package>> {
    return fetchPaginated<Package>(this, '/packages', query);
  }

  getPackage(id: string): Promise<PackageDetail> {
    return this.request<PackageDetail>(`/packages/${id}`);
  }

  createPackage(body: CreatePackageRequest): Promise<Package> {
    return this.request<Package>('/packages', { method: 'POST', body });
  }

  updatePackage(id: string, body: UpdatePackageRequest): Promise<Package> {
    return this.request<Package>(`/packages/${id}`, { method: 'PATCH', body });
  }

  deletePackage(id: string): Promise<void> {
    return this.request<void>(`/packages/${id}`, { method: 'DELETE' });
  }

  listPackageItems(
    query?: PackageItemsListQuery,
  ): Promise<PaginatedResponse<PackageItem>> {
    return fetchPaginated<PackageItem>(this, '/package-items', query);
  }

  getPackageItem(id: string): Promise<PackageItem> {
    return this.request<PackageItem>(`/package-items/${id}`);
  }

  createPackageItem(body: CreatePackageItemRequest): Promise<PackageItem> {
    return this.request<PackageItem>('/package-items', { method: 'POST', body });
  }

  updatePackageItem(
    id: string,
    body: UpdatePackageItemRequest,
  ): Promise<PackageItem> {
    return this.request<PackageItem>(`/package-items/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deletePackageItem(id: string): Promise<void> {
    return this.request<void>(`/package-items/${id}`, { method: 'DELETE' });
  }

  listPackageImages(
    query?: PackageImagesListQuery,
  ): Promise<PaginatedResponse<PackageImage>> {
    return fetchPaginated<PackageImage>(this, '/package-images', query);
  }

  getPackageImage(id: string): Promise<PackageImage> {
    return this.request<PackageImage>(`/package-images/${id}`);
  }

  createPackageImage(body: CreatePackageImageRequest): Promise<PackageImage> {
    return this.request<PackageImage>('/package-images', { method: 'POST', body });
  }

  updatePackageImage(id: string, body: UpdatePackageImageRequest): Promise<PackageImage> {
    return this.request<PackageImage>(`/package-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deletePackageImage(id: string): Promise<void> {
    return this.request<void>(`/package-images/${id}`, { method: 'DELETE' });
  }

  listPackageSuggestedImages(packageId: string): Promise<PackageSuggestedImageGroup[]> {
    return this.request<PackageSuggestedImageGroup[]>(
      `/packages/${packageId}/suggested-images`,
    );
  }

  previewBookingCheckout(
    body: BookingCheckoutRequest,
  ): Promise<BookingCheckoutPreview> {
    return this.request<BookingCheckoutPreview>('/bookings/checkout-preview', {
      method: 'POST',
      body,
    });
  }

  createBooking(body: BookingCheckoutRequest): Promise<CreateBookingResponse> {
    return this.request<BookingDetail>('/bookings', { method: 'POST', body });
  }

  requestBooking(body: BookingCheckoutRequest): Promise<BookingRequestResponse> {
    return this.request<BookingRequestResponse>('/bookings/request', {
      method: 'POST',
      body,
    });
  }

  listBookingMessages(
    bookingId: string,
    query?: { chatToken?: string; markRead?: boolean },
  ): Promise<BookingMessagesList> {
    const params = new URLSearchParams();
    if (query?.chatToken) {
      params.set('chatToken', query.chatToken);
    }
    if (query?.markRead === false) {
      params.set('markRead', 'false');
    }
    const qs = params.toString();
    return this.request<BookingMessagesList>(
      `/bookings/${bookingId}/messages${qs ? `?${qs}` : ''}`,
    );
  }

  getBookingUnreadMessageCount(bookingId: string): Promise<{ count: number }> {
    return this.request<{ count: number }>(`/bookings/${bookingId}/messages/unread-count`);
  }

  createBookingMessage(
    bookingId: string,
    body: CreateBookingMessageRequest,
    query?: { chatToken?: string },
  ): Promise<BookingMessage> {
    const params = new URLSearchParams();
    if (query?.chatToken) {
      params.set('chatToken', query.chatToken);
    }
    const qs = params.toString();
    return this.request<BookingMessage>(
      `/bookings/${bookingId}/messages${qs ? `?${qs}` : ''}`,
      { method: 'POST', body },
    );
  }

  touchBookingThreadPresence(bookingId: string): Promise<void> {
    return this.request<void>(`/bookings/${bookingId}/thread-presence`, {
      method: 'POST',
    });
  }

  listBookings(query?: BookingsListQuery): Promise<PaginatedResponse<BookingListItem>> {
    return fetchPaginated<BookingListItem>(this, '/bookings', query);
  }

  listBookingItems(
    query?: BookingItemsListQuery,
  ): Promise<PaginatedResponse<BookingItemListItem>> {
    return fetchPaginated<BookingItemListItem>(this, '/booking-items', query);
  }

  getBooking(id: string): Promise<BookingAdminDetail> {
    return this.request<BookingAdminDetail>(`/bookings/${id}`);
  }

  getBookingReview(id: string): Promise<Review | null> {
    return this.request<Review | null>(`/bookings/${id}/reviews`);
  }

  createBookingReview(
    id: string,
    body: CreateBookingReviewRequest,
  ): Promise<Review> {
    return this.request<Review>(`/bookings/${id}/reviews`, {
      method: 'POST',
      body,
    });
  }

  createGuideReview(
    bookingId: string,
    guideId: string,
    body: CreateBookingReviewRequest,
  ): Promise<Review> {
    return this.request<Review>(`/bookings/${bookingId}/guides/${guideId}/reviews`, {
      method: 'POST',
      body,
    });
  }

  listBookingGuides(bookingId: string): Promise<BookingGuideAssignment[]> {
    return this.request<BookingGuideAssignment[]>(`/bookings/${bookingId}/guides`);
  }

  assignBookingGuides(
    bookingId: string,
    body: AssignBookingGuidesRequest,
  ): Promise<BookingGuideAssignment[]> {
    return this.request<BookingGuideAssignment[]>(`/bookings/${bookingId}/guides`, {
      method: 'POST',
      body,
    });
  }

  removeBookingGuide(bookingId: string, guideId: string): Promise<void> {
    return this.request<void>(`/bookings/${bookingId}/guides/${guideId}`, {
      method: 'DELETE',
    });
  }

  listReviews(
    query?: ReviewsListQuery,
  ): Promise<PaginatedResponse<AdminReviewListItem>> {
    return fetchPaginated<AdminReviewListItem>(this, '/reviews', query);
  }

  getReview(id: string): Promise<AdminReviewDetail> {
    return this.request<AdminReviewDetail>(`/reviews/${id}`);
  }

  updateReviewStatus(
    id: string,
    body: UpdateReviewStatusRequest,
  ): Promise<AdminReviewDetail> {
    return this.request<AdminReviewDetail>(`/reviews/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteReview(id: string): Promise<void> {
    return this.request<void>(`/reviews/${id}`, { method: 'DELETE' });
  }

  listSupportTickets(
    query?: SupportTicketsListQuery,
  ): Promise<PaginatedResponse<AdminSupportTicketListItem>> {
    return fetchPaginated<AdminSupportTicketListItem>(this, '/support-tickets', query);
  }

  getSupportTicket(id: string): Promise<AdminSupportTicketDetail> {
    return this.request<AdminSupportTicketDetail>(`/support-tickets/${id}`);
  }

  createSupportTicket(
    body: CreateSupportTicketRequest,
  ): Promise<SupportTicketCreated> {
    return this.request<SupportTicketCreated>('/support-tickets', {
      method: 'POST',
      body,
    });
  }

  updateSupportTicket(
    id: string,
    body: UpdateSupportTicketRequest,
  ): Promise<AdminSupportTicketDetail> {
    return this.request<AdminSupportTicketDetail>(`/support-tickets/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  createSupportMessage(
    body: CreateSupportMessageRequest,
  ): Promise<CreateSupportMessageResponse> {
    return this.request<CreateSupportMessageResponse>('/support-messages', {
      method: 'POST',
      body,
    });
  }

  updateBookingStatus(
    id: string,
    body: UpdateBookingStatusRequest,
  ): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body,
    });
  }

  confirmBooking(id: string): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${id}/confirm`, {
      method: 'POST',
    });
  }

  cancelBooking(id: string, body?: CancelBookingRequest): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: body ?? {},
    });
  }

  approveBooking(id: string, body?: ApproveBookingRequest): Promise<BookingAdminDetail> {
    return this.request<BookingAdminDetail>(`/bookings/${id}/approve`, {
      method: 'POST',
      body: body ?? {},
    });
  }

  rejectBooking(id: string, body?: RejectBookingRequest): Promise<BookingAdminDetail> {
    return this.request<BookingAdminDetail>(`/bookings/${id}/reject`, {
      method: 'POST',
      body: body ?? {},
    });
  }

  inviteBookingPayment(id: string): Promise<BookingCheckoutSessionResponse> {
    return this.request<BookingCheckoutSessionResponse>(`/bookings/${id}/invite-payment`, {
      method: 'POST',
    });
  }

  updateBookingPricing(
    id: string,
    body: UpdateBookingPricingRequest,
  ): Promise<BookingAdminDetail> {
    return this.request<BookingAdminDetail>(`/bookings/${id}/pricing`, {
      method: 'PUT',
      body,
    });
  }

  updateBookingVisitDates(
    id: string,
    body: UpdateBookingVisitDatesRequest,
  ): Promise<BookingAdminDetail> {
    return this.request<BookingAdminDetail>(`/bookings/${id}/visit-dates`, {
      method: 'PUT',
      body,
    });
  }

  approveBookingIdentityDocument(
    bookingId: string,
    documentId: string,
    body?: ReviewBookingIdentityDocumentRequest,
  ): Promise<BookingIdentityDocument> {
    return this.request<BookingIdentityDocument>(
      `/bookings/${bookingId}/identity-documents/${documentId}/approve`,
      { method: 'POST', body: body ?? {} },
    );
  }

  requestBookingIdentityDocumentResubmit(
    bookingId: string,
    documentId: string,
    body: ReviewBookingIdentityDocumentRequest,
  ): Promise<BookingIdentityDocument> {
    return this.request<BookingIdentityDocument>(
      `/bookings/${bookingId}/identity-documents/${documentId}/request-resubmit`,
      { method: 'POST', body },
    );
  }

  rejectBookingIdentityDocument(
    bookingId: string,
    documentId: string,
    body?: ReviewBookingIdentityDocumentRequest,
  ): Promise<BookingIdentityDocument> {
    return this.request<BookingIdentityDocument>(
      `/bookings/${bookingId}/identity-documents/${documentId}/reject`,
      { method: 'POST', body: body ?? {} },
    );
  }

  listBookingManifestEntries(bookingId: string): Promise<BookingManifestEntry[]> {
    return this.request<BookingManifestEntry[]>(
      `/bookings/${bookingId}/manifest-entries`,
    );
  }

  createBookingManifestEntry(
    bookingId: string,
    body: CreateBookingManifestEntryRequest,
  ): Promise<BookingManifestEntry> {
    return this.request<BookingManifestEntry>(
      `/bookings/${bookingId}/manifest-entries`,
      { method: 'POST', body },
    );
  }

  updateBookingManifestEntry(
    bookingId: string,
    entryId: string,
    body: UpdateBookingManifestEntryRequest,
  ): Promise<BookingManifestEntry> {
    return this.request<BookingManifestEntry>(
      `/bookings/${bookingId}/manifest-entries/${entryId}`,
      { method: 'PATCH', body },
    );
  }

  removeBookingManifestEntry(bookingId: string, entryId: string): Promise<void> {
    return this.request<void>(
      `/bookings/${bookingId}/manifest-entries/${entryId}`,
      { method: 'DELETE' },
    );
  }

  recordBookingCashPayment(
    id: string,
    body?: RecordCashPaymentRequest,
  ): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${id}/cash-payment`, {
      method: 'POST',
      body: body ?? {},
    });
  }

  createBookingPaymentIntent(id: string): Promise<BookingPaymentIntentResponse> {
    return this.request<BookingPaymentIntentResponse>(`/bookings/${id}/payment-intent`, {
      method: 'POST',
    });
  }

  createBookingCheckoutSession(id: string): Promise<BookingCheckoutSessionResponse> {
    return this.request<BookingCheckoutSessionResponse>(`/bookings/${id}/checkout-session`, {
      method: 'POST',
    });
  }

  syncBookingPayment(id: string): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${id}/sync-payment`, {
      method: 'POST',
    });
  }

  listAirlines(query?: AirlinesListQuery): Promise<PaginatedResponse<Airline>> {
    return fetchPaginated<Airline>(this, '/airlines', query);
  }

  getAirline(id: string): Promise<Airline> {
    return this.request<Airline>(`/airlines/${id}`);
  }

  createAirline(body: CreateAirlineRequest): Promise<Airline> {
    return this.request<Airline>('/airlines', { method: 'POST', body });
  }

  updateAirline(id: string, body: UpdateAirlineRequest): Promise<Airline> {
    return this.request<Airline>(`/airlines/${id}`, { method: 'PATCH', body });
  }

  deleteAirline(id: string): Promise<void> {
    return this.request<void>(`/airlines/${id}`, { method: 'DELETE' });
  }

  listAirports(query?: AirportsListQuery): Promise<PaginatedResponse<Airport>> {
    return fetchPaginated<Airport>(this, '/airports', query);
  }

  getAirport(id: string): Promise<Airport> {
    return this.request<Airport>(`/airports/${id}`);
  }

  createAirport(body: CreateAirportRequest): Promise<Airport> {
    return this.request<Airport>('/airports', { method: 'POST', body });
  }

  updateAirport(id: string, body: UpdateAirportRequest): Promise<Airport> {
    return this.request<Airport>(`/airports/${id}`, { method: 'PATCH', body });
  }

  deleteAirport(id: string): Promise<void> {
    return this.request<void>(`/airports/${id}`, { method: 'DELETE' });
  }

  listFlights(query?: FlightsListQuery): Promise<PaginatedResponse<Flight>> {
    return fetchPaginated<Flight>(this, '/flights', query);
  }

  getFlight(id: string): Promise<Flight> {
    return this.request<Flight>(`/flights/${id}`);
  }

  createFlight(body: CreateFlightRequest): Promise<Flight> {
    return this.request<Flight>('/flights', { method: 'POST', body });
  }

  updateFlight(id: string, body: UpdateFlightRequest): Promise<Flight> {
    return this.request<Flight>(`/flights/${id}`, { method: 'PATCH', body });
  }

  deleteFlight(id: string): Promise<void> {
    return this.request<void>(`/flights/${id}`, { method: 'DELETE' });
  }

  listFlightImages(
    query?: FlightImagesListQuery,
  ): Promise<PaginatedResponse<FlightImage>> {
    return fetchPaginated<FlightImage>(this, '/flight-images', query);
  }

  getFlightImage(id: string): Promise<FlightImage> {
    return this.request<FlightImage>(`/flight-images/${id}`);
  }

  createFlightImage(body: CreateFlightImageRequest): Promise<FlightImage> {
    return this.request<FlightImage>('/flight-images', { method: 'POST', body });
  }

  updateFlightImage(id: string, body: UpdateFlightImageRequest): Promise<FlightImage> {
    return this.request<FlightImage>(`/flight-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteFlightImage(id: string): Promise<void> {
    return this.request<void>(`/flight-images/${id}`, { method: 'DELETE' });
  }

  listFlightClasses(
    query?: FlightClassesListQuery,
  ): Promise<PaginatedResponse<FlightClass>> {
    return fetchPaginated<FlightClass>(this, '/flight-classes', query);
  }

  getFlightClass(id: string): Promise<FlightClass> {
    return this.request<FlightClass>(`/flight-classes/${id}`);
  }

  createFlightClass(body: CreateFlightClassRequest): Promise<FlightClass> {
    return this.request<FlightClass>('/flight-classes', { method: 'POST', body });
  }

  updateFlightClass(id: string, body: UpdateFlightClassRequest): Promise<FlightClass> {
    return this.request<FlightClass>(`/flight-classes/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteFlightClass(id: string): Promise<void> {
    return this.request<void>(`/flight-classes/${id}`, { method: 'DELETE' });
  }

  listFlightClassAvailability(
    query: FlightClassAvailabilityListQuery,
  ): Promise<PaginatedResponse<FlightClassAvailability>> {
    return fetchPaginated<FlightClassAvailability>(
      this,
      '/flight-class-availability',
      query,
    );
  }

  createFlightClassAvailability(
    body: CreateFlightClassAvailabilityRequest,
  ): Promise<FlightClassAvailability> {
    return this.request<FlightClassAvailability>('/flight-class-availability', {
      method: 'POST',
      body,
    });
  }

  updateFlightClassAvailability(
    id: string,
    body: UpdateFlightClassAvailabilityRequest,
  ): Promise<FlightClassAvailability> {
    return this.request<FlightClassAvailability>(`/flight-class-availability/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteFlightClassAvailability(id: string): Promise<void> {
    return this.request<void>(`/flight-class-availability/${id}`, {
      method: 'DELETE',
    });
  }

  bulkUpsertFlightClassAvailability(
    body: BulkUpsertFlightClassAvailabilityRequest,
  ): Promise<BulkUpsertFlightClassAvailabilityResponse> {
    return this.request<BulkUpsertFlightClassAvailabilityResponse>(
      '/flight-class-availability/bulk',
      { method: 'PUT', body },
    );
  }

  listRentalAgencies(
    query?: RentalAgenciesListQuery,
  ): Promise<PaginatedResponse<RentalAgency>> {
    return fetchPaginated<RentalAgency>(this, '/rental-agencies', query);
  }

  getRentalAgency(id: string): Promise<RentalAgency> {
    return this.request<RentalAgency>(`/rental-agencies/${id}`);
  }

  createRentalAgency(body: CreateRentalAgencyRequest): Promise<RentalAgency> {
    return this.request<RentalAgency>('/rental-agencies', { method: 'POST', body });
  }

  updateRentalAgency(
    id: string,
    body: UpdateRentalAgencyRequest,
  ): Promise<RentalAgency> {
    return this.request<RentalAgency>(`/rental-agencies/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteRentalAgency(id: string): Promise<void> {
    return this.request<void>(`/rental-agencies/${id}`, { method: 'DELETE' });
  }

  listVehicleCategories(
    query?: VehicleCategoriesListQuery,
  ): Promise<PaginatedResponse<VehicleCategory>> {
    return fetchPaginated<VehicleCategory>(this, '/vehicle-categories', query);
  }

  getVehicleCategory(id: string): Promise<VehicleCategory> {
    return this.request<VehicleCategory>(`/vehicle-categories/${id}`);
  }

  createVehicleCategory(
    body: CreateVehicleCategoryRequest,
  ): Promise<VehicleCategory> {
    return this.request<VehicleCategory>('/vehicle-categories', {
      method: 'POST',
      body,
    });
  }

  updateVehicleCategory(
    id: string,
    body: UpdateVehicleCategoryRequest,
  ): Promise<VehicleCategory> {
    return this.request<VehicleCategory>(`/vehicle-categories/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteVehicleCategory(id: string): Promise<void> {
    return this.request<void>(`/vehicle-categories/${id}`, { method: 'DELETE' });
  }

  listVehicles(query?: VehiclesListQuery): Promise<PaginatedResponse<Vehicle>> {
    return fetchPaginated<Vehicle>(this, '/vehicles', query);
  }

  getVehicle(id: string): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}`);
  }

  createVehicle(body: CreateVehicleRequest): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicles', { method: 'POST', body });
  }

  updateVehicle(id: string, body: UpdateVehicleRequest): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body });
  }

  deleteVehicle(id: string): Promise<void> {
    return this.request<void>(`/vehicles/${id}`, { method: 'DELETE' });
  }

  listVehicleImages(
    query?: VehicleImagesListQuery,
  ): Promise<PaginatedResponse<VehicleImage>> {
    return fetchPaginated<VehicleImage>(this, '/vehicle-images', query);
  }

  getVehicleImage(id: string): Promise<VehicleImage> {
    return this.request<VehicleImage>(`/vehicle-images/${id}`);
  }

  createVehicleImage(body: CreateVehicleImageRequest): Promise<VehicleImage> {
    return this.request<VehicleImage>('/vehicle-images', { method: 'POST', body });
  }

  updateVehicleImage(id: string, body: UpdateVehicleImageRequest): Promise<VehicleImage> {
    return this.request<VehicleImage>(`/vehicle-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteVehicleImage(id: string): Promise<void> {
    return this.request<void>(`/vehicle-images/${id}`, { method: 'DELETE' });
  }

  listVehicleAvailability(
    query: VehicleAvailabilityListQuery,
  ): Promise<PaginatedResponse<VehicleAvailability>> {
    return fetchPaginated<VehicleAvailability>(this, '/vehicle-availability', query);
  }

  createVehicleAvailability(
    body: CreateVehicleAvailabilityRequest,
  ): Promise<VehicleAvailability> {
    return this.request<VehicleAvailability>('/vehicle-availability', {
      method: 'POST',
      body,
    });
  }

  updateVehicleAvailability(
    id: string,
    body: UpdateVehicleAvailabilityRequest,
  ): Promise<VehicleAvailability> {
    return this.request<VehicleAvailability>(`/vehicle-availability/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteVehicleAvailability(id: string): Promise<void> {
    return this.request<void>(`/vehicle-availability/${id}`, { method: 'DELETE' });
  }

  listCruiseLines(
    query?: CruiseLinesListQuery,
  ): Promise<PaginatedResponse<CruiseLine>> {
    return fetchPaginated<CruiseLine>(this, '/cruise-lines', query);
  }

  getCruiseLine(id: string): Promise<CruiseLine> {
    return this.request<CruiseLine>(`/cruise-lines/${id}`);
  }

  createCruiseLine(body: CreateCruiseLineRequest): Promise<CruiseLine> {
    return this.request<CruiseLine>('/cruise-lines', { method: 'POST', body });
  }

  updateCruiseLine(id: string, body: UpdateCruiseLineRequest): Promise<CruiseLine> {
    return this.request<CruiseLine>(`/cruise-lines/${id}`, { method: 'PATCH', body });
  }

  deleteCruiseLine(id: string): Promise<void> {
    return this.request<void>(`/cruise-lines/${id}`, { method: 'DELETE' });
  }

  listCruisePorts(
    query?: CruisePortsListQuery,
  ): Promise<PaginatedResponse<CruisePort>> {
    return fetchPaginated<CruisePort>(this, '/cruise-ports', query);
  }

  getCruisePort(id: string): Promise<CruisePort> {
    return this.request<CruisePort>(`/cruise-ports/${id}`);
  }

  createCruisePort(body: CreateCruisePortRequest): Promise<CruisePort> {
    return this.request<CruisePort>('/cruise-ports', { method: 'POST', body });
  }

  updateCruisePort(id: string, body: UpdateCruisePortRequest): Promise<CruisePort> {
    return this.request<CruisePort>(`/cruise-ports/${id}`, { method: 'PATCH', body });
  }

  deleteCruisePort(id: string): Promise<void> {
    return this.request<void>(`/cruise-ports/${id}`, { method: 'DELETE' });
  }

  listShips(query?: ShipsListQuery): Promise<PaginatedResponse<Ship>> {
    return fetchPaginated<Ship>(this, '/ships', query);
  }

  getShip(id: string): Promise<Ship> {
    return this.request<Ship>(`/ships/${id}`);
  }

  createShip(body: CreateShipRequest): Promise<Ship> {
    return this.request<Ship>('/ships', { method: 'POST', body });
  }

  updateShip(id: string, body: UpdateShipRequest): Promise<Ship> {
    return this.request<Ship>(`/ships/${id}`, { method: 'PATCH', body });
  }

  deleteShip(id: string): Promise<void> {
    return this.request<void>(`/ships/${id}`, { method: 'DELETE' });
  }

  listShipImages(
    query?: ShipImagesListQuery,
  ): Promise<PaginatedResponse<ShipImage>> {
    return fetchPaginated<ShipImage>(this, '/ship-images', query);
  }

  getShipImage(id: string): Promise<ShipImage> {
    return this.request<ShipImage>(`/ship-images/${id}`);
  }

  createShipImage(body: CreateShipImageRequest): Promise<ShipImage> {
    return this.request<ShipImage>('/ship-images', { method: 'POST', body });
  }

  updateShipImage(id: string, body: UpdateShipImageRequest): Promise<ShipImage> {
    return this.request<ShipImage>(`/ship-images/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteShipImage(id: string): Promise<void> {
    return this.request<void>(`/ship-images/${id}`, { method: 'DELETE' });
  }

  listItineraries(
    query?: ItinerariesListQuery,
  ): Promise<PaginatedResponse<Itinerary>> {
    return fetchPaginated<Itinerary>(this, '/itineraries', query);
  }

  getItinerary(id: string): Promise<Itinerary> {
    return this.request<Itinerary>(`/itineraries/${id}`);
  }

  createItinerary(body: CreateItineraryRequest): Promise<Itinerary> {
    return this.request<Itinerary>('/itineraries', { method: 'POST', body });
  }

  updateItinerary(id: string, body: UpdateItineraryRequest): Promise<Itinerary> {
    return this.request<Itinerary>(`/itineraries/${id}`, { method: 'PATCH', body });
  }

  deleteItinerary(id: string): Promise<void> {
    return this.request<void>(`/itineraries/${id}`, { method: 'DELETE' });
  }

  listItineraryPorts(
    query?: ItineraryPortsListQuery,
  ): Promise<PaginatedResponse<ItineraryPort>> {
    return fetchPaginated<ItineraryPort>(this, '/itinerary-ports', query);
  }

  getItineraryPort(id: string): Promise<ItineraryPort> {
    return this.request<ItineraryPort>(`/itinerary-ports/${id}`);
  }

  createItineraryPort(body: CreateItineraryPortRequest): Promise<ItineraryPort> {
    return this.request<ItineraryPort>('/itinerary-ports', { method: 'POST', body });
  }

  updateItineraryPort(
    id: string,
    body: UpdateItineraryPortRequest,
  ): Promise<ItineraryPort> {
    return this.request<ItineraryPort>(`/itinerary-ports/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteItineraryPort(id: string): Promise<void> {
    return this.request<void>(`/itinerary-ports/${id}`, { method: 'DELETE' });
  }

  listCabins(query?: CabinsListQuery): Promise<PaginatedResponse<Cabin>> {
    return fetchPaginated<Cabin>(this, '/cabins', query);
  }

  getCabin(id: string): Promise<Cabin> {
    return this.request<Cabin>(`/cabins/${id}`);
  }

  createCabin(body: CreateCabinRequest): Promise<Cabin> {
    return this.request<Cabin>('/cabins', { method: 'POST', body });
  }

  updateCabin(id: string, body: UpdateCabinRequest): Promise<Cabin> {
    return this.request<Cabin>(`/cabins/${id}`, { method: 'PATCH', body });
  }

  deleteCabin(id: string): Promise<void> {
    return this.request<void>(`/cabins/${id}`, { method: 'DELETE' });
  }

  listCruiseSailings(
    query?: CruiseSailingsListQuery,
  ): Promise<PaginatedResponse<CruiseSailing>> {
    return fetchPaginated<CruiseSailing>(this, '/cruise-sailings', query);
  }

  getCruiseSailing(id: string): Promise<CruiseSailing> {
    return this.request<CruiseSailing>(`/cruise-sailings/${id}`);
  }

  createCruiseSailing(body: CreateCruiseSailingRequest): Promise<CruiseSailing> {
    return this.request<CruiseSailing>('/cruise-sailings', { method: 'POST', body });
  }

  updateCruiseSailing(
    id: string,
    body: UpdateCruiseSailingRequest,
  ): Promise<CruiseSailing> {
    return this.request<CruiseSailing>(`/cruise-sailings/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteCruiseSailing(id: string): Promise<void> {
    return this.request<void>(`/cruise-sailings/${id}`, { method: 'DELETE' });
  }

  listCabinAvailability(
    query: CabinAvailabilityListQuery,
  ): Promise<PaginatedResponse<CabinAvailability>> {
    return fetchPaginated<CabinAvailability>(this, '/cabin-availability', query);
  }

  getCabinAvailability(id: string): Promise<CabinAvailability> {
    return this.request<CabinAvailability>(`/cabin-availability/${id}`);
  }

  createCabinAvailability(
    body: CreateCabinAvailabilityRequest,
  ): Promise<CabinAvailability> {
    return this.request<CabinAvailability>('/cabin-availability', {
      method: 'POST',
      body,
    });
  }

  updateCabinAvailability(
    id: string,
    body: UpdateCabinAvailabilityRequest,
  ): Promise<CabinAvailability> {
    return this.request<CabinAvailability>(`/cabin-availability/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  deleteCabinAvailability(id: string): Promise<void> {
    return this.request<void>(`/cabin-availability/${id}`, { method: 'DELETE' });
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options.baseUrl, options.accessToken);
}
