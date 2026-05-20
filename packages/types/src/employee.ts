import type { PaginationQuery } from './pagination.js';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export interface EmployeeUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Employee {
  id: string;
  userId: string;
  organizationId: string | null;
  employeeCode: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  salary: string | null;
  currency: string | null;
  managerId: string | null;
  status: EmployeeStatus;
  user?: EmployeeUserSummary;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateEmployeeRequest {
  userId: string;
  organizationId?: string;
  employeeCode?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  terminationDate?: string;
  salary?: number;
  currency?: string;
  managerId?: string;
  status?: EmployeeStatus;
}

export type UpdateEmployeeRequest = Partial<{
  userId: string;
  organizationId: string | null;
  employeeCode: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  salary: number | null;
  currency: string | null;
  managerId: string | null;
  status: EmployeeStatus;
}>;

export interface EmployeesListQuery extends PaginationQuery {
  organizationId?: string;
  status?: EmployeeStatus;
  search?: string;
}
