export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  preferredLanguage?: string | null;
  organizationId?: string | null;
  status: UserStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
  requiresVerification?: boolean;
  verificationId?: string;
  bookingId?: string;
}

export interface AuthMe {
  user: AuthUser;
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface LogoutResponse {
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredLanguage?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyOperationRequest {
  verificationId: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}
