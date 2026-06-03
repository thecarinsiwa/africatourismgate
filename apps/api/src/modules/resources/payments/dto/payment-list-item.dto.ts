import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Payments } from '../../../../entities/generated';

export class PaymentListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiProperty()
  amountCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  status!: Payments['status'];

  @ApiPropertyOptional({ nullable: true })
  provider!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  clientEmail!: string;

  @ApiProperty()
  clientFirstName!: string;

  @ApiProperty()
  clientLastName!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;
}
