import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
}
