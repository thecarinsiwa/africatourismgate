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
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const TREASURY_PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'mobile_money',
  'stripe',
  'cheque',
  'other',
] as const;

const FUND_EXIT_STATUSES = ['draft', 'disbursed', 'recorded', 'voided'] as const;

export class FundExitsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  expenseRequestId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Inclusive start on operation_date',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Inclusive end on operation_date',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 'XOF', minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code' })
  currency?: string;

  @ApiPropertyOptional({ enum: TREASURY_PAYMENT_METHODS })
  @IsOptional()
  @IsIn(TREASURY_PAYMENT_METHODS)
  paymentMethod?: (typeof TREASURY_PAYMENT_METHODS)[number];

  @ApiPropertyOptional({ enum: FUND_EXIT_STATUSES })
  @IsOptional()
  @IsIn(FUND_EXIT_STATUSES)
  status?: (typeof FUND_EXIT_STATUSES)[number];

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filter exits linked to this booking',
  })
  @IsOptional()
  @IsUUID('4')
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Search by reference or notes' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
