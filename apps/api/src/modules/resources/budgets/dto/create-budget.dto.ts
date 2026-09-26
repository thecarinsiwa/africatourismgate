import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const PERIOD_TYPES = ['monthly', 'annual'] as const;
const SCOPE_TYPES = ['general', 'activity', 'product'] as const;
const PRODUCT_TYPES = [
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
  'package',
] as const;

export class CreateBudgetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({ example: 'Budget trésorerie 2026' })
  @IsString()
  @MaxLength(255)
  label!: string;

  @ApiProperty({ enum: PERIOD_TYPES, example: 'monthly' })
  @IsIn(PERIOD_TYPES)
  periodType!: (typeof PERIOD_TYPES)[number];

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 2100 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    maximum: 12,
    description: 'Required when periodType=monthly; must be null/omitted for annual',
  })
  @ValidateIf((o: CreateBudgetDto) => o.periodType === 'monthly')
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number | null;

  @ApiProperty({ example: 5_000_000, description: 'Amount in minor units (cents)' })
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty({ example: 'XOF', minLength: 3, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code' })
  currency!: string;

  @ApiPropertyOptional({
    enum: SCOPE_TYPES,
    default: 'general',
    description:
      'general | activity (requires activityId) | product (requires productType + productId)',
  })
  @IsOptional()
  @IsIn(SCOPE_TYPES)
  scopeType?: (typeof SCOPE_TYPES)[number];

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Required when scopeType=activity',
  })
  @ValidateIf((o: CreateBudgetDto) => (o.scopeType ?? 'general') === 'activity')
  @IsUUID('4')
  activityId?: string | null;

  @ApiPropertyOptional({
    enum: PRODUCT_TYPES,
    description: 'Required when scopeType=product',
  })
  @ValidateIf((o: CreateBudgetDto) => (o.scopeType ?? 'general') === 'product')
  @IsIn(PRODUCT_TYPES)
  productType?: (typeof PRODUCT_TYPES)[number] | null;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Polymorphic product id (required when scopeType=product)',
  })
  @ValidateIf((o: CreateBudgetDto) => (o.scopeType ?? 'general') === 'product')
  @IsUUID('4')
  productId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;
}
