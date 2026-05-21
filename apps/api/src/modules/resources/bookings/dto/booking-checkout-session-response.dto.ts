import { ApiProperty } from '@nestjs/swagger';

export class BookingCheckoutSessionResponseDto {
  @ApiProperty({ format: 'uuid' })
  paymentId!: string;

  @ApiProperty({ example: 'cs_test_xxx' })
  sessionId!: string;

  @ApiProperty({ description: 'Hosted Checkout URL' })
  url!: string;

  @ApiProperty()
  amountCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}
