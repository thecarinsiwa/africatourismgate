import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
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

const EXPORT_TYPES = ['all', 'entries', 'exits'] as const;

const ENTRY_STATUSES = ['recorded', 'voided'] as const;
const EXIT_STATUSES = ['draft', 'disbursed', 'recorded', 'voided'] as const;

export class TreasuryReportsExportQueryDto {
  @ApiPropertyOptional({
    enum: EXPORT_TYPES,
    default: 'all',
    description: 'all | entries | exits',
  })
  @IsOptional()
  @IsIn([...EXPORT_TYPES])
  type?: (typeof EXPORT_TYPES)[number];

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

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

  @ApiPropertyOptional({
    description:
      'Status filter. If omitted: entries=recorded, exits=disbursed|recorded (realized). Pass explicitly to include voided/draft.',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  bookingId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  expenseRequestId?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  /** When true (default for reports UI), only realized statuses unless `status` is set. */
  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'])
  realizedOnly?: 'true' | 'false';
}

export { ENTRY_STATUSES, EXIT_STATUSES, EXPORT_TYPES };
