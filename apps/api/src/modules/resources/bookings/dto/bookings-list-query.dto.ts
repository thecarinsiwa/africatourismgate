import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { Bookings } from '../../../../entities/generated';

const BOOKING_STATUSES = [
  'draft',
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

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;
}
