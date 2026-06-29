import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  SLUG_PATTERN,
  SLUG_VALIDATION_MESSAGE,
} from '../../../../common/constants/slug';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Safari DRC' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'safari-drc' })
  @IsNotEmpty({ message: 'Le slug est obligatoire.' })
  @IsString()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, { message: SLUG_VALIDATION_MESSAGE })
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ example: 'contact@example.com' })
  @IsOptional()
  @IsEmail({}, { message: "L'e-mail de contact doit être valide." })
  @MaxLength(255)
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+243900000000' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'SARL', description: 'Forme juridique' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  legalForm?: string;

  @ApiPropertyOptional({ description: 'Registre du Commerce et du Crédit Mobilier' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  rccm?: string;

  @ApiPropertyOptional({ description: 'Identification Nationale' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  idNat?: string;

  @ApiPropertyOptional({ description: "Numéro d'Identification Fiscale" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nif?: string;

  @ApiPropertyOptional({ description: 'Caisse Nationale de Sécurité Sociale' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cnss?: string;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsNotEmpty({ message: 'La devise est obligatoire.' })
  @IsString()
  @Length(3, 3, { message: 'La devise doit comporter 3 lettres (ex. USD, CDF).' })
  currency!: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'suspended'], {
    message: 'Le statut doit être active ou suspended.',
  })
  status?: 'active' | 'suspended';
}
