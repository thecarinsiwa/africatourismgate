import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { Bookings } from '../../../../entities/generated';

const BOOKING_STATUSES = [
  'draft',
  'pending_approval',
  'pending_payment',
  'confirmed',
  'cancelled',
  'refunded',
] as const satisfies readonly Bookings['status'][];

export class BookingsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: BOOKING_STATUSES })
  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  status?: Bookings['status'];

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by client (booking owner)' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

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

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort by created_at (default desc)' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Search by client email, name or booking id prefix',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
