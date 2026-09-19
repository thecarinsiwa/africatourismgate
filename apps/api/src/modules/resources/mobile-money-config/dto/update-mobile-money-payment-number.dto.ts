import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateMobileMoneyPaymentNumberDto {
  @ApiPropertyOptional({ example: '+243970000000' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Le numéro doit être au format E.164 (ex. +243970000000).',
  })
  phoneE164?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
