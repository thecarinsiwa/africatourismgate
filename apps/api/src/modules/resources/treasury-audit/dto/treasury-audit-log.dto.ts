import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TreasuryAuditAction,
  TreasuryAuditActorType,
  TreasuryAuditEntityType,
  TreasuryAuditLogs,
} from '../../../../entities/treasury-audit-log.entity';

export class TreasuryAuditLogDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty()
  entityType!: TreasuryAuditEntityType;

  @ApiProperty({ format: 'uuid' })
  entityId!: string;

  @ApiProperty()
  action!: TreasuryAuditAction;

  @ApiProperty()
  actorType!: TreasuryAuditActorType;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  actorId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true })
  oldJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true })
  newJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  correlationId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  ipAddress!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userAgent!: string | null;

  @ApiProperty()
  createdAt!: string;
}

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toTreasuryAuditLogDto(log: TreasuryAuditLogs): TreasuryAuditLogDto {
  return {
    id: log.id,
    organizationId: log.organizationId,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    actorType: log.actorType,
    actorId: log.actorId ?? null,
    oldJson: log.oldJson ?? null,
    newJson: log.newJson ?? null,
    correlationId: log.correlationId ?? null,
    ipAddress: log.ipAddress ?? null,
    userAgent: log.userAgent ?? null,
    createdAt: formatTimestamp(log.createdAt) ?? '',
  };
}
