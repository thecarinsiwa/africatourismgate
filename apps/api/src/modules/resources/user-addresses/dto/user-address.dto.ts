import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { UserAddresses } from '../../../../entities/generated';

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export class UserAddressDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  label!: string | null;

  @ApiProperty()
  line1!: string;

  @ApiPropertyOptional({ nullable: true })
  line2!: string | null;

  @ApiProperty()
  city!: string;

  @ApiPropertyOptional({ nullable: true })
  region!: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode!: string | null;

  @ApiProperty()
  countryCode!: string;

  @ApiProperty()
  isDefault!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toUserAddressDto(row: UserAddresses): UserAddressDto {
  return {
    id: row.id,
    userId: row.userId,
    label: row.label ?? null,
    line1: row.line1,
    line2: row.line2 ?? null,
    city: row.city,
    region: row.region ?? null,
    postalCode: row.postalCode ?? null,
    countryCode: row.countryCode,
    isDefault: row.isDefault,
    createdAt: formatTimestamp(row.createdAt) ?? '',
    updatedAt: formatTimestamp(row.updatedAt),
  };
}

export class CreateUserAddressDto {
  @ApiPropertyOptional({ example: 'Domicile' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiProperty({ example: '12 Avenue de la Paix' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiProperty({ example: 'Kinshasa' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  city!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @ApiProperty({ example: 'CD' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  countryCode!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Staff only: target user id' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateUserAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
