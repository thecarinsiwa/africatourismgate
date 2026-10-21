import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExpenseRequestExternalDto {
  @ApiProperty({
    description: 'Raw access token from the invite link (64 hex chars)',
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @Length(64, 64)
  @Matches(/^[a-f0-9]{64}$/i, {
    message: 'token must be a 64-character hex string',
  })
  token!: string;

  @ApiProperty({ example: 'Achat fournitures bureau' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'Justification détaillée…' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 50000, description: 'Amount in minor units (cents)' })
  @IsInt()
  @Min(1)
  requestedAmountCents!: number;

  @ApiProperty({ example: 'XOF', minLength: 3, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code' })
  currency!: string;

  @ApiPropertyOptional({
    example: '2026-10-15',
    description: 'Needed-by date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  neededByDate?: string | null;
}
