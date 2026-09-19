import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateMobileMoneyCountryDto {
  @ApiPropertyOptional({ example: 'CD' })
  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'Le code pays doit comporter 2 lettres.' })
  @Matches(/^[A-Za-z]{2}$/, { message: 'Le code pays doit être ISO alpha-2.' })
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

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
