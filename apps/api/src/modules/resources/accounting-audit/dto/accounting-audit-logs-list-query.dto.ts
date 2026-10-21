import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import {
  AccountingAuditAction,
  AccountingAuditEntityType,
} from '../../../../entities/accounting-audit-log.entity';

const ENTITY_TYPES: AccountingAuditEntityType[] = [
  'journal_entry',
  'journal_line',
  'chart_account',
  'exercise',
  'period',
  'mapping_rule',
  'accounting_link',
  'journal',
];

const ACTIONS: AccountingAuditAction[] = [
  'create',
  'update',
  'post',
  'reverse',
  'lock',
  'unlock',
  'close',
  'skip',
  'delete',
];

export class AccountingAuditLogsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ enum: ENTITY_TYPES })
  @IsOptional()
  @IsIn(ENTITY_TYPES)
  entityType?: AccountingAuditEntityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ enum: ACTIONS })
  @IsOptional()
  @IsIn(ACTIONS)
  action?: AccountingAuditAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dateTo?: string;
}
