import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const FUND_ENTRY_SOURCES = [
  'booking_payment',
  'customer_direct',
  'partner',
  'grant_donation',
  'owner_capital',
  'bank_interest',
  'other',
] as const;

const TREASURY_PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'mobile_money',
  'stripe',
  'cheque',
  'other',
] as const;

export class TreasuryReportsSummaryQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Inclusive start (operation_date)' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Inclusive end (operation_date)' })
  @IsDateString()
  dateTo!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ example: 'XOF' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/i)
  currency?: string;

  @ApiPropertyOptional({ enum: FUND_ENTRY_SOURCES })
  @IsOptional()
  @IsIn([...FUND_ENTRY_SOURCES])
  source?: (typeof FUND_ENTRY_SOURCES)[number];

  @ApiPropertyOptional({ enum: TREASURY_PAYMENT_METHODS })
  @IsOptional()
  @IsIn([...TREASURY_PAYMENT_METHODS])
  paymentMethod?: (typeof TREASURY_PAYMENT_METHODS)[number];
}
