import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RbacAuditLogs } from '../../../../entities/generated';
import { Users } from '../../../../entities/generated';
import { RbacAuditEventType } from '../../../rbac/rbac.constants';

export class RbacAuditActorDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class RbacAuditLogDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  eventType!: RbacAuditEventType;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  actorUserId!: string | null;

  @ApiPropertyOptional({ type: RbacAuditActorDto, nullable: true })
  actor!: RbacAuditActorDto | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  targetUserId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  roleId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  permissionId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  assignmentId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  correlationId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  ipAddress!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent!: string | null;

  @ApiPropertyOptional({ nullable: true })
  payload!: Record<string, unknown> | null;
}

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toRbacAuditLogDto(
  log: RbacAuditLogs,
  actor: Users | null,
): RbacAuditLogDto {
  return {
    id: log.id,
    eventType: log.eventType as RbacAuditEventType,
    createdAt: formatTimestamp(log.createdAt) ?? '',
    actorUserId: log.actorUserId ?? null,
    actor: actor
      ? {
          id: actor.id,
          email: actor.email,
          firstName: actor.firstName,
          lastName: actor.lastName,
        }
      : null,
    targetUserId: log.targetUserId ?? null,
    roleId: log.roleId ?? null,
    permissionId: log.permissionId ?? null,
    assignmentId: log.assignmentId ?? null,
    correlationId: log.correlationId ?? null,
    ipAddress: log.ipAddress ?? null,
    userAgent: log.userAgent ?? null,
    payload: (log.payload as Record<string, unknown> | null) ?? null,
  };
}
