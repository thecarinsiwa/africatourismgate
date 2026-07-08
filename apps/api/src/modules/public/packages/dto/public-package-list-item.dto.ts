import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicPackagePricingDto {
  @ApiProperty({ example: 9000 })
  subtotalCents!: number;

  @ApiProperty({ example: 10 })
  discountPercent!: number;

  @ApiProperty({ example: 900 })
  discountAmountCents!: number;

  @ApiProperty({ example: 8100 })
  totalCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class PublicPackageListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Kinshasa Duo' })
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ example: 10 })
  discountPercent!: number;

  @ApiProperty({ example: 2 })
  itemCount!: number;

  @ApiProperty({ type: PublicPackagePricingDto })
  pricing!: PublicPackagePricingDto;

  @ApiPropertyOptional({ nullable: true, description: 'Cover image URL or first gallery photo' })
  imageUrl!: string | null;
}
