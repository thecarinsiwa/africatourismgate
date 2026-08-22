import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { Payments } from '../../../../entities/generated';

const PAYMENT_STATUSES = [
  'pending',
  'succeeded',
  'failed',
  'refunded',
] as const satisfies readonly Payments['status'][];

export class PaymentsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PAYMENT_STATUSES })
  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  status?: Payments['status'];

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by client organization' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Inclusive start (created_at)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Inclusive end (created_at)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Search by client email, name or booking id' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
