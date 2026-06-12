import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
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
  'pending_payment',
  'confirmed',
  'cancelled',
  'refunded',
] as const satisfies readonly Bookings['status'][];

export class BookingItemsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ITEM_TYPES })
  @IsOptional()
  @IsIn(ITEM_TYPES)
  itemType?: BookingItems['itemType'];

  @ApiPropertyOptional({
    enum: BOOKING_STATUSES,
    description: 'Filter by parent booking status',
  })
  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  status?: Bookings['status'];

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by booking' })
  @IsOptional()
  @IsUUID('4')
  bookingId?: string;
}
