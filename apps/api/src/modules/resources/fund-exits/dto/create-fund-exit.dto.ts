import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const TREASURY_PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'mobile_money',
  'stripe',
  'cheque',
  'other',
] as const;

export class CreateFundExitDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Must reference an authorized expense request',
  })
  @IsUUID('4')
  expenseRequestId!: string;

  @ApiProperty({ example: 50000, description: 'Amount in minor units (cents)' })
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty({ example: 'XOF', minLength: 3, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code' })
  currency!: string;

  @ApiProperty({ example: '2026-09-26', description: 'Disbursement date (YYYY-MM-DD)' })
  @IsDateString()
  operationDate!: string;

  @ApiProperty({ enum: TREASURY_PAYMENT_METHODS })
  @IsIn(TREASURY_PAYMENT_METHODS)
  paymentMethod!: (typeof TREASURY_PAYMENT_METHODS)[number];

  @ApiPropertyOptional({ example: 'VIR-OUT-001', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Linked booking ids (0,N)',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  bookingIds?: string[];
}
