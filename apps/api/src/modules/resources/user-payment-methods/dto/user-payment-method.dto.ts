import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { UserPaymentMethods } from '../../../../entities/generated';

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** API response — external token is never exposed. */
export class UserPaymentMethodDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ enum: ['card', 'paypal', 'other'] })
  type!: 'card' | 'paypal' | 'other';

  @ApiPropertyOptional({ nullable: true })
  provider!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastFour!: string | null;

  @ApiProperty()
  isDefault!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toUserPaymentMethodDto(row: UserPaymentMethods): UserPaymentMethodDto {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    provider: row.provider ?? null,
    lastFour: row.lastFour ?? null,
    isDefault: row.isDefault,
    createdAt: formatTimestamp(row.createdAt) ?? '',
    updatedAt: formatTimestamp(row.updatedAt),
  };
}

export class CreateUserPaymentMethodDto {
  @ApiProperty({ enum: ['card', 'paypal', 'other'] })
  @IsIn(['card', 'paypal', 'other'])
  type!: 'card' | 'paypal' | 'other';

  @ApiPropertyOptional({ example: 'visa' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  provider?: string;

  @ApiPropertyOptional({ example: '4242' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  lastFour?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalToken?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Staff only: target user id' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateUserPaymentMethodDto {
  @ApiPropertyOptional({ enum: ['card', 'paypal', 'other'] })
  @IsOptional()
  @IsIn(['card', 'paypal', 'other'])
  type?: 'card' | 'paypal' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  provider?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4)
  lastFour?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalToken?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
