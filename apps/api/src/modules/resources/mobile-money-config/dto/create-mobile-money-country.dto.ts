import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMobileMoneyCountryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiProperty({ example: 'CD', description: 'ISO 3166-1 alpha-2' })
  @IsNotEmpty({ message: 'Le code pays est obligatoire.' })
  @IsString()
  @Length(2, 2, { message: 'Le code pays doit comporter 2 lettres.' })
  @Matches(/^[A-Za-z]{2}$/, { message: 'Le code pays doit être ISO alpha-2.' })
  code!: string;

  @ApiProperty({ example: 'République démocratique du Congo' })
  @IsNotEmpty({ message: 'Le nom du pays est obligatoire.' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
