import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import {
  TreasuryAuditAction,
  TreasuryAuditEntityType,
} from '../../../../entities/treasury-audit-log.entity';

const ENTITY_TYPES: TreasuryAuditEntityType[] = [
  'fund_entry',
  'fund_exit',
  'expense_request',
  'budget',
  'external_collaborator',
  'access_token',
  'accounting_link',
];

const ACTIONS: TreasuryAuditAction[] = [
  'create',
  'update',
  'transition',
  'void',
  'attach',
  'detach',
  'invite',
  'activate',
  'deactivate',
  'revoke_token',
];

export class TreasuryAuditLogsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ enum: ENTITY_TYPES })
  @IsOptional()
  @IsIn(ENTITY_TYPES)
  entityType?: TreasuryAuditEntityType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  entityId?: string;

  @ApiPropertyOptional({ enum: ACTIONS })
  @IsOptional()
  @IsIn(ACTIONS)
  action?: TreasuryAuditAction;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filter by actor id (user or external collaborator)',
  })
  @IsOptional()
  @IsUUID('4')
  actorId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Inclusive start date (created_at)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Inclusive end date (created_at)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
