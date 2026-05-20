import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles, Users, UserRoleAssignments } from '../../../../entities/generated';

export class AssignmentUserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class AssignmentRoleSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class UserRoleAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ format: 'uuid' })
  roleId!: string;

  @ApiProperty({ enum: ['global', 'property', 'agency', 'support_queue'] })
  scopeType!: 'global' | 'property' | 'agency' | 'support_queue';

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  scopeId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  assignedByUserId!: string | null;

  @ApiProperty()
  assignedAt!: string;

  @ApiPropertyOptional({ nullable: true })
  expiresAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  revokedAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  revokedByUserId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  revokeReason!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;

  @ApiPropertyOptional({ type: AssignmentUserSummaryDto })
  user?: AssignmentUserSummaryDto;

  @ApiPropertyOptional({ type: AssignmentRoleSummaryDto })
  role?: AssignmentRoleSummaryDto;
}

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toUserRoleAssignmentDto(
  row: UserRoleAssignments,
  user?: Users | null,
  role?: Roles | null,
): UserRoleAssignmentDto {
  return {
    id: row.id,
    userId: row.userId,
    roleId: row.roleId,
    scopeType: row.scopeType,
    scopeId: row.scopeId ?? null,
    assignedByUserId: row.assignedByUserId ?? null,
    assignedAt: formatTimestamp(row.assignedAt) ?? '',
    expiresAt: formatTimestamp(row.expiresAt),
    revokedAt: formatTimestamp(row.revokedAt),
    revokedByUserId: row.revokedByUserId ?? null,
    revokeReason: row.revokeReason ?? null,
    createdAt: formatTimestamp(row.createdAt) ?? '',
    updatedAt: formatTimestamp(row.updatedAt),
    ...(user
      ? {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        }
      : {}),
    ...(role
      ? {
          role: {
            id: role.id,
            code: role.code,
            name: role.name,
          },
        }
      : {}),
  };
}
