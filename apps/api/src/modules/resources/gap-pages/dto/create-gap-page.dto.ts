import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import type { GapPageSectionKey } from '../../../../entities/gap-page.entity';

const SECTION_KEYS = [
  'about',
  'objectives',
  'unesco',
] as const satisfies readonly GapPageSectionKey[];

export class CreateGapPageDto {
  @ApiProperty({ enum: SECTION_KEYS, example: 'about' })
  @IsNotEmpty({ message: 'La section est obligatoire.' })
  @IsEnum(SECTION_KEYS)
  sectionKey!: GapPageSectionKey;

  @ApiProperty({ example: 'Le programme' })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiProperty({ description: 'HTML or plain text body' })
  @IsNotEmpty({ message: 'Le contenu est obligatoire.' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Up to 10 cover image URLs (first becomes coverImageUrl)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(1024, { each: true })
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { each: true, message: "Chaque URL d'image doit être valide." },
  )
  coverImageUrls?: string[] | null;

  @ApiPropertyOptional({
    deprecated: true,
    description: 'Legacy single cover image; prefer coverImageUrls',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de l'image doit être valide." },
  )
  coverImageUrl?: string | null;

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
