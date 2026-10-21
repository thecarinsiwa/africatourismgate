import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'GBP', minLength: 3, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'code must be a 3-letter ISO 4217 code',
  })
  code!: string;

  @ApiProperty({ example: 'British pound', maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label!: string;

  @ApiPropertyOptional({ example: '£', nullable: true, maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  symbol?: string | null;

  @ApiPropertyOptional({ example: 2, minimum: 0, maximum: 6, default: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  decimalPlaces?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 80, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
