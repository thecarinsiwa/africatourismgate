import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MobileMoneyCountries } from '../../../../entities/mobile-money-country.entity';
import { MobileMoneyOperators } from '../../../../entities/mobile-money-operator.entity';
import { MobileMoneyPaymentNumbers } from '../../../../entities/mobile-money-payment-number.entity';

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

export class MobileMoneyCountryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'CD' })
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export class MobileMoneyOperatorDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  countryId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export class MobileMoneyPaymentNumberDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  operatorId!: string;

  @ApiProperty({ example: '+243970000000' })
  phoneE164!: string;

  @ApiPropertyOptional({ nullable: true })
  label!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toMobileMoneyCountryDto(
  row: MobileMoneyCountries,
): MobileMoneyCountryDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    code: row.code,
    name: row.name,
    isActive: Boolean(row.isActive),
    sortOrder: row.sortOrder,
    createdAt: toIso(row.createdAt) ?? '',
    updatedAt: toIso(row.updatedAt),
  };
}

export function toMobileMoneyOperatorDto(
  row: MobileMoneyOperators,
): MobileMoneyOperatorDto {
  return {
    id: row.id,
    countryId: row.countryId,
    name: row.name,
    logoUrl: row.logoUrl ?? null,
    isActive: Boolean(row.isActive),
    sortOrder: row.sortOrder,
    createdAt: toIso(row.createdAt) ?? '',
    updatedAt: toIso(row.updatedAt),
  };
}

export function toMobileMoneyPaymentNumberDto(
  row: MobileMoneyPaymentNumbers,
): MobileMoneyPaymentNumberDto {
  return {
    id: row.id,
    operatorId: row.operatorId,
    phoneE164: row.phoneE164,
    label: row.label ?? null,
    isActive: Boolean(row.isActive),
    sortOrder: row.sortOrder,
    createdAt: toIso(row.createdAt) ?? '',
    updatedAt: toIso(row.updatedAt),
  };
}
