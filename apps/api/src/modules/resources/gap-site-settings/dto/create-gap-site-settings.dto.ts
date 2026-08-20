import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class GapSiteLinkDto {
  @ApiProperty({ example: 'UNESCO' })
  @IsNotEmpty({ message: 'Le libellé du lien est obligatoire.' })
  @IsString()
  @MaxLength(160)
  label!: string;

  @ApiPropertyOptional({ example: 'https://en.unesco.org/' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && String(value).trim() !== '')
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL du lien doit être valide." },
  )
  url?: string | null;
}

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

  @ApiPropertyOptional({
    type: [GapSiteLinkDto],
    description: 'Up to 10 partner / external links',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => GapSiteLinkDto)
  links?: GapSiteLinkDto[] | null;

  @ApiPropertyOptional({
    deprecated: true,
    description: 'Legacy single UNESCO label; prefer links',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  unescoLabel?: string | null;

  @ApiPropertyOptional({
    deprecated: true,
    description: 'Legacy single UNESCO URL; prefer links',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @ValidateIf((_, value) => value !== null && value !== undefined && String(value).trim() !== '')
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
