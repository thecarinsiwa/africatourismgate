import type {
  AuthResponse,
  AuthTokens,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@africatourismgate/types';
import { ApiHttpError, parseApiErrorMessage } from './http-error';

export { ApiHttpError, parseApiErrorMessage } from './http-error';

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
} from '@africatourismgate/types';

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
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options.baseUrl, options.accessToken);
}
