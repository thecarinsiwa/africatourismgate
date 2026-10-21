import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Currencies } from '../../../../entities/currency.entity';

export class CurrencyDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'XOF' })
  code!: string;

  @ApiProperty({ example: 'Franc CFA (BCEAO)' })
  label!: string;

  @ApiPropertyOptional({ example: 'CFA', nullable: true })
  symbol!: string | null;

  @ApiProperty({ example: 0 })
  decimalPlaces!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ example: 10 })
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toCurrencyDto(row: Currencies): CurrencyDto {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    symbol: row.symbol,
    decimalPlaces: Number(row.decimalPlaces),
    isActive: Boolean(row.isActive),
    sortOrder: Number(row.sortOrder),
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
