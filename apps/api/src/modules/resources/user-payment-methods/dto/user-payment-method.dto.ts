import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

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
