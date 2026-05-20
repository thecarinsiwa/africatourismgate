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

export { RBAC_AUDIT_EVENT_LABELS, RBAC_AUDIT_EVENT_TYPES } from './rbac.js';
