import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateGapSiteSettingsDto {
  @ApiProperty({ example: 'Gorilla Ambassadors Program' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subtitle!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de l'image hero doit être valide." },
  )
  heroImageUrl!: string;

  @ApiProperty({ example: 'Gorille de montagne' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  heroImageAlt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  unescoLabel?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL UNESCO doit être valide." },
  )
  unescoUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de don doit être valide." },
  )
  donateUrl?: string | null;

  @ApiPropertyOptional({ example: 'Faire un don' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  donateLabel?: string | null;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
