import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { RBAC_AUDIT_EVENT_TYPES } from '../../../rbac/rbac.constants';

export class RbacAuditLogsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RBAC_AUDIT_EVENT_TYPES })
  @IsOptional()
  @IsIn([...RBAC_AUDIT_EVENT_TYPES])
  eventType?: (typeof RBAC_AUDIT_EVENT_TYPES)[number];

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by actor user id' })
  @IsOptional()
  @IsUUID('4')
  actorUserId?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Inclusive start date (created_at)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Inclusive end date (created_at)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
