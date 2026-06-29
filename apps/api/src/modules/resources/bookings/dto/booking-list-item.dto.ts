import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Bookings } from '../../../../entities/generated';

export class BookingListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  status!: Bookings['status'];

  @ApiProperty()
  totalCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  promoCodeId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: Date | null;

  @ApiProperty()
  clientEmail!: string;

  @ApiProperty()
  clientFirstName!: string;

  @ApiProperty()
  clientLastName!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;

  @ApiPropertyOptional({
    description: 'Customer account list: payment invite or unread staff message.',
  })
  actionRequired?: boolean;
}
