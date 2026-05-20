import type {
  Amenity,
  AmenitiesListQuery,
  AuthMe,
  AuthResponse,
  AuthTokens,
  CreateAmenityRequest,
  CreateDestinationRequest,
  CreateEmployeeRequest,
  CreateOrganizationRequest,
  CreatePointOfInterestRequest,
  CreatePropertyImageRequest,
  CreatePropertyRequest,
  CreateRoomAvailabilityRequest,
  CreateRoomRequest,
  BulkUpsertRoomAvailabilityRequest,
  BulkUpsertRoomAvailabilityResponse,
  CreateRoleRequest,
  CreateUserRequest,
  CreateUserRoleAssignmentRequest,
  Employee,
  EmployeesListQuery,
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
  RoomsListQuery,
  Destination,
  DestinationsListQuery,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutResponse,
  Organization,
  Property,
  PropertyAmenitiesListQuery,
  PropertyAmenitiesPayload,
  PropertyImage,
  PropertyImagesListQuery,
  PropertiesListQuery,
  PointOfInterest,
  PointsOfInterestListQuery,
  PaginatedResponse,
  PaginationQuery,
  PaymentListItem,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SucceededPaymentsRevenue,
  UpdateAmenityRequest,
  UpdateDestinationRequest,
  UpdateEmployeeRequest,
  UpdatePropertyImageRequest,
  UpdatePropertyRequest,
  UpdateRoomAvailabilityRequest,
  UpdateRoomRequest,
  UpdatePointOfInterestRequest,
  BulkUpsertOrganizationSettingsRequest,
  CreateOrganizationBankAccountRequest,
  OrganizationBankAccount,
  OrganizationBankAccountsListQuery,
  OrganizationSetting,
  OrganizationSettingsListQuery,
  UpdateOrganizationBankAccountRequest,
  UpdateOrganizationRequest,
  UpdateRoleRequest,
  UpdateUserRequest,
  UserRoleAssignment,
  UserRoleAssignmentsListQuery,
  User,
  UsersListQuery,
} from '@africatourismgate/types';
import { ApiHttpError, parseApiErrorMessage } from './http-error';
import {
  fetchPaginated,
  fetchTotal,
  sumSucceededPaymentsRevenue,
} from './pagination';

export { ApiHttpError, parseApiErrorMessage } from './http-error';

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
  PaginationQuery,
  PaymentListItem,
  PaymentStatus,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SucceededPaymentsRevenue,
  UserStatus,
  Organization,
  OrganizationStatus,
  Destination,
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
  UserRoleAssignment,
  UserRoleAssignmentsListQuery,
  Amenity,
  AmenitiesListQuery,
  CreateAmenityRequest,
  CreatePropertyImageRequest,
  CreatePropertyRequest,
  CreateRoomRequest,
  Property,
  PropertyAmenitiesListQuery,
  PropertyAmenitiesPayload,
  PropertyImage,
  PropertyImagesListQuery,
  PropertiesListQuery,
  PropertyType,
  ReplacePropertyAmenitiesRequest,
  Room,
  RoomsListQuery,
  UpdateAmenityRequest,
  UpdatePropertyImageRequest,
  UpdatePropertyRequest,
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

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
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

  getAuthMe(): Promise<AuthMe> {
    return this.request<AuthMe>('/auth/me');
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

  listBookings(query?: PaginationQuery): Promise<PaginatedResponse<unknown>> {
    return fetchPaginated(this, '/bookings', query);
  }

  listProperties(
    query?: PropertiesListQuery,
  ): Promise<PaginatedResponse<Property>> {
    return fetchPaginated<Property>(this, '/properties', query);
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

  listPayments(query?: PaginationQuery): Promise<PaginatedResponse<PaymentListItem>> {
    return fetchPaginated<PaymentListItem>(this, '/payments', query);
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
    query?: PaginationQuery,
  ): Promise<PaginatedResponse<Organization>> {
    return fetchPaginated<Organization>(this, '/organizations', query);
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
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options.baseUrl, options.accessToken);
}
