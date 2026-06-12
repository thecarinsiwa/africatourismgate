import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BookingItems, Bookings } from '../../../../entities/generated';

export class BookingItemListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiProperty()
  itemType!: BookingItems['itemType'];

  @ApiProperty({ format: 'uuid' })
  referenceId!: string;

  @ApiProperty()
  titleSnapshot!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPriceCents!: number;

  @ApiProperty()
  lineTotalCents!: number;

  @ApiPropertyOptional({ nullable: true })
  startDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  endDate!: string | null;

  @ApiProperty()
  bookingStatus!: Bookings['status'];

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  createdAt!: Date;
}
