import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import type { AboutResourceType } from '../../../../entities/about-resource.entity';

const RESOURCE_TYPES = ['financial', 'media'] as const satisfies readonly AboutResourceType[];

export class CreateAboutResourceDto {
  @ApiProperty({ enum: RESOURCE_TYPES, example: 'financial' })
  @IsNotEmpty({ message: 'Le type est obligatoire.' })
  @IsEnum(RESOURCE_TYPES)
  type!: AboutResourceType;

  @ApiProperty({ example: "Rapport d'activité 2025" })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL du fichier doit être valide." },
  )
  fileUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL externe doit être valide." },
  )
  externalUrl?: string | null;

  @ApiPropertyOptional({ example: '2026-01-15T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  publishedAt?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

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
