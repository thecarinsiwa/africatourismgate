import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AccountingAuditAction,
  AccountingAuditActorType,
  AccountingAuditEntityType,
  AccountingAuditLogs,
} from '../../../../entities/accounting-audit-log.entity';

export class AccountingAuditLogDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty({ enum: ['journal_entry', 'journal_line', 'chart_account', 'exercise', 'period', 'mapping_rule', 'accounting_link', 'journal'] })
  entityType!: AccountingAuditEntityType;

  @ApiProperty()
  entityId!: string;

  @ApiProperty({ enum: ['create', 'update', 'post', 'reverse', 'lock', 'unlock', 'close', 'skip', 'delete'] })
  action!: AccountingAuditAction;

  @ApiProperty({ enum: ['user', 'system'] })
  actorType!: AccountingAuditActorType;

  @ApiPropertyOptional({ nullable: true })
  actorId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true })
  oldJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true })
  newJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  correlationTreasuryAuditId!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export function toAccountingAuditLogDto(
  log: AccountingAuditLogs,
): AccountingAuditLogDto {
  return {
    id: log.id,
    organizationId: log.organizationId,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    actorType: log.actorType,
    actorId: log.actorId,
    oldJson: log.oldJson,
    newJson: log.newJson,
    correlationTreasuryAuditId: log.correlationTreasuryAuditId,
    createdAt: log.createdAt.toISOString(),
  };
}
