import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({ example: 'EUR', minLength: 3, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'fromCurrency must be a 3-letter ISO code',
  })
  fromCurrency!: string;

  @ApiProperty({ example: 'XOF', minLength: 3, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'toCurrency must be a 3-letter ISO code',
  })
  toCurrency!: string;

  @ApiProperty({
    example: 655.957,
    description: '1 fromCurrency = rate × toCurrency',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  rate!: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  effectiveOn!: string;

  @ApiPropertyOptional({ maxLength: 500, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
