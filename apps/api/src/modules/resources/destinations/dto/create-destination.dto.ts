import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  SLUG_PATTERN,
  SLUG_VALIDATION_MESSAGE,
} from '../../../../common/constants/slug';

export class CreateDestinationDto {
  @ApiProperty({ example: 'Kinshasa' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({ example: 'kinshasa' })
  @IsNotEmpty({ message: 'Le slug est obligatoire.' })
  @IsString()
  @MaxLength(180)
  @Matches(SLUG_PATTERN, { message: SLUG_VALIDATION_MESSAGE })
  slug!: string;

  @ApiProperty({ example: 'CD', description: 'ISO 3166-1 alpha-2' })
  @IsNotEmpty({ message: 'Le code pays est obligatoire.' })
  @IsString()
  @Length(2, 2, { message: 'Le code pays doit comporter 2 lettres (ex. CD, KE).' })
  countryCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/destinations/kinshasa.jpg',
    description: 'Hero image URL for admin and public listings',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl({}, { message: "L'URL de l'image doit être valide." })
  imageUrl?: string;

  @ApiPropertyOptional({ example: -4.3058 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La latitude doit être un nombre.' })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 15.3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La longitude doit être un nombre.' })
  @Min(-180)
  @Max(180)
  longitude?: number;
}
