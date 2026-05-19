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
