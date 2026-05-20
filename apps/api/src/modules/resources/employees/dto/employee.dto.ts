import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Employees, Users } from '../../../../entities/generated';

export class EmployeeUserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class EmployeeDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  employeeCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  jobTitle!: string | null;

  @ApiPropertyOptional({ nullable: true })
  department!: string | null;

  @ApiPropertyOptional({ nullable: true })
  hireDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminationDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  salary!: string | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  managerId!: string | null;

  @ApiProperty({ enum: ['active', 'on_leave', 'terminated'] })
  status!: 'active' | 'on_leave' | 'terminated';

  @ApiPropertyOptional({ type: EmployeeUserSummaryDto })
  user?: EmployeeUserSummaryDto;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

function formatDate(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toEmployeeUserSummary(user: Users): EmployeeUserSummaryDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export function toEmployeeDto(
  employee: Employees,
  user?: Users | null,
): EmployeeDto {
  return {
    id: employee.id,
    userId: employee.userId,
    organizationId: employee.organizationId ?? null,
    employeeCode: employee.employeeCode ?? null,
    jobTitle: employee.jobTitle ?? null,
    department: employee.department ?? null,
    hireDate: formatDate(employee.hireDate),
    terminationDate: formatDate(employee.terminationDate),
    salary: employee.salary != null ? String(employee.salary) : null,
    currency: employee.currency ?? null,
    managerId: employee.managerId ?? null,
    status: employee.status,
    ...(user ? { user: toEmployeeUserSummary(user) } : {}),
    createdAt: formatTimestamp(employee.createdAt) ?? '',
    updatedAt: formatTimestamp(employee.updatedAt),
  };
}
