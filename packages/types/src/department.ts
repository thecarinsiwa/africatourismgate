import type { PaginationQuery } from './pagination.js';

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDepartmentRequest {
  organizationId: string;
  name: string;
  description?: string;
}

export type UpdateDepartmentRequest = Partial<{
  name: string;
  description: string | null;
}>;

export interface DepartmentsListQuery extends PaginationQuery {
  organizationId?: string;
  search?: string;
}
