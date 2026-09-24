import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min, ValidateIf } from 'class-validator';
import type { BookingItems, Bookings } from '../../../../entities/generated';

const ITEM_TYPES = [
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
  'package',
] as const satisfies readonly BookingItems['itemType'][];

const BOOKING_STATUSES = [
  'draft',
  'pending_approval',
  'pending_payment',
  'confirmed',
  'cancelled',
  'refunded',
] as const satisfies readonly Bookings['status'][];

/**
 * Standalone query DTO (does not extend PaginationQueryDto) so class-validator
 * whitelist metadata is always attached to this constructor under forbidNonWhitelisted.
 */
export class BookingItemsListQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ITEM_TYPES })
  @IsOptional()
  @IsIn([...ITEM_TYPES])
  itemType?: BookingItems['itemType'];

  @ApiPropertyOptional({
    enum: BOOKING_STATUSES,
    description: 'Filter by parent booking status',
  })
  @IsOptional()
  @IsIn([...BOOKING_STATUSES])
  status?: Bookings['status'];

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by booking' })
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID('4')
  bookingId?: string;
}
