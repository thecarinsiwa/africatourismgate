import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { LegalPageSectionKey } from '../../../../entities/legal-page.entity';

const SECTION_KEYS = [
  'terms-of-use',
  'privacy-policy',
] as const satisfies readonly LegalPageSectionKey[];

export class CreateLegalPageDto {
  @ApiProperty({ enum: SECTION_KEYS, example: 'terms-of-use' })
  @IsNotEmpty({ message: 'La section est obligatoire.' })
  @IsEnum(SECTION_KEYS)
  sectionKey!: LegalPageSectionKey;

  @ApiProperty({ example: "Conditions d'utilisation" })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ description: 'HTML body (TipTap / rich text)' })
  @IsNotEmpty({ message: 'Le contenu est obligatoire.' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: '2026-06-01T12:00:00.000Z' })
  @IsOptional()
  @IsString()
  publishedAt?: string | null;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
