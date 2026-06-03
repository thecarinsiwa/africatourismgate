import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { PromoCodes } from '../../../../entities/generated';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsNotEmpty({ message: 'Le code est obligatoire.' })
  @IsString()
  @MaxLength(64)
  code!: string;

  @ApiProperty({ enum: ['percent', 'fixed_amount'] })
  @IsIn(['percent', 'fixed_amount'])
  discountType!: PromoCodes['discountType'];

  @ApiProperty({ example: 20, description: 'Percent (0–100) or fixed amount in currency units' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  discountValue!: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  validFrom!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  validUntil!: string;

  @ApiPropertyOptional({ nullable: true, description: 'Omit or null for unlimited uses' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number | null;

  @ApiProperty({ example: 1, description: '1 = active, 0 = inactive' })
  @IsInt()
  @IsIn([0, 1])
  active!: number;
}
