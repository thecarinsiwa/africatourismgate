import type { UserStatus } from './auth.js';
import type { PaginationQuery } from './pagination.js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  preferredLanguage?: string | null;
  organizationId?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredLanguage?: string;
  organizationId?: string;
  status?: 'active' | 'suspended';
}

export type UpdateUserRequest = Partial<
  Omit<CreateUserRequest, 'password' | 'organizationId'> & {
    password?: string;
    organizationId?: string | null;
  }
>;

export interface UsersListQuery extends PaginationQuery {
  status?: 'active' | 'suspended';
  organizationId?: string;
  search?: string;
}
