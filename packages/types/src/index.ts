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
  PaginatedResponse,
  PaginationMeta,
  PaginationQuery,
  PaymentListItem,
  PaymentStatus,
  SucceededPaymentsRevenue,
} from './pagination.js';

export type {
  CreateOrganizationRequest,
  Organization,
  OrganizationStatus,
  UpdateOrganizationRequest,
} from './organization.js';

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
  CreateRoomRequest,
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
  RoomsListQuery,
  UpdateAmenityRequest,
  UpdatePropertyImageRequest,
  UpdatePropertyRequest,
  UpdateRoomRequest,
} from './accommodation.js';

export type {
  BookingDefaultsValue,
  BrandingPlatformValue,
  BulkUpsertOrganizationSettingsRequest,
  CreateOrganizationBankAccountRequest,
  LocaleSettingValue,
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
