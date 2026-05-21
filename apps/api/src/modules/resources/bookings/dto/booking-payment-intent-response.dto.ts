import { ApiProperty } from '@nestjs/swagger';

export class BookingPaymentIntentResponseDto {
  @ApiProperty({ format: 'uuid' })
  paymentId!: string;

  @ApiProperty({ example: 'pi_3Pxxxx' })
  paymentIntentId!: string;

  @ApiProperty({ description: 'Client secret for Stripe.js / mobile SDK' })
  clientSecret!: string;

  @ApiProperty()
  amountCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}
