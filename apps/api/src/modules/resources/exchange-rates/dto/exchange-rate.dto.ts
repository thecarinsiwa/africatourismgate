import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ExchangeRates } from '../../../../entities/exchange-rate.entity';

export class ExchangeRateDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'EUR' })
  fromCurrency!: string;

  @ApiProperty({ example: 'XOF' })
  toCurrency!: string;

  @ApiProperty({
    example: 655.957,
    description: '1 fromCurrency = rate × toCurrency',
  })
  rate!: number;

  @ApiProperty({ example: '2026-01-01' })
  effectiveOn!: string;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

function dateOnly(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function toExchangeRateDto(row: ExchangeRates): ExchangeRateDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    fromCurrency: row.fromCurrency,
    toCurrency: row.toCurrency,
    rate: Number(row.rate),
    effectiveOn: dateOnly(row.effectiveOn),
    notes: row.notes,
    createdByUserId: row.createdByUserId,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : row.updatedAt
          ? String(row.updatedAt)
          : null,
  };
}
