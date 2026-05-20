import type {
  AuthResponse,
  AuthTokens,
  CreateEmployeeRequest,
  CreateOrganizationRequest,
  CreateUserRequest,
  Employee,
  EmployeesListQuery,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutResponse,
  Organization,
  PaginatedResponse,
  PaginationQuery,
  PaymentListItem,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SucceededPaymentsRevenue,
  UpdateEmployeeRequest,
  UpdateOrganizationRequest,
  UpdateUserRequest,
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
  CreateEmployeeRequest,
  CreateOrganizationRequest,
  UpdateEmployeeRequest,
  UpdateOrganizationRequest,
  CreateUserRequest,
  UpdateUserRequest,
  Employee,
  EmployeesListQuery,
  User,
  UsersListQuery,
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

  listProperties(query?: PaginationQuery): Promise<PaginatedResponse<unknown>> {
    return fetchPaginated(this, '/properties', query);
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
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options.baseUrl, options.accessToken);
}
