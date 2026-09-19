import { ApiProperty } from '@nestjs/swagger';
import type { ResolvedWebPaymentMethods } from '@africatourismgate/types';

export class PublicPaymentMethodsDto implements ResolvedWebPaymentMethods {
  @ApiProperty({ description: 'Card (Stripe) enabled on public web checkout' })
  stripe!: boolean;

  @ApiProperty({ description: 'Cash on site enabled on public web checkout' })
  cash!: boolean;

  @ApiProperty({ description: 'Bank transfer enabled on public web checkout' })
  bank_transfer!: boolean;

  @ApiProperty({ description: 'Mobile Money enabled on public web checkout' })
  mobile_money!: boolean;
}
