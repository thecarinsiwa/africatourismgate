import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BookingItems } from '../../../../entities/generated';

export type BookingCheckoutLineDto = {
  itemType: BookingItems['itemType'];
  referenceId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  titleSnapshot: string;
  currency: string;
  startDate: string | null;
  endDate: string | null;
};

export class AppliedCheckoutDiscountDto {
  @ApiProperty({ enum: ['promo_code', 'promotion'] })
  kind!: 'promo_code' | 'promotion';

  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'SUMMER20' })
  label!: string;

  @ApiProperty({ enum: ['percent', 'fixed_amount'] })
  discountType!: 'percent' | 'fixed_amount';

  @ApiProperty({ example: 20 })
  discountValue!: number;

  @ApiProperty({ example: 1800 })
  discountCents!: number;
}

export type BookingCheckoutPreviewResponseDto = {
  lines: BookingCheckoutLineDto[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  appliedDiscount: AppliedCheckoutDiscountDto | null;
};
