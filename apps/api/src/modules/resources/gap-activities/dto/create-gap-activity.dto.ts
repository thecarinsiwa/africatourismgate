import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import type { GapActivityIconKey } from '../../../../entities/gap-activity.entity';

const ICON_KEYS = [
  'school',
  'tree',
  'art',
  'park',
  'community',
] as const satisfies readonly GapActivityIconKey[];

export class CreateGapActivityDto {
  @ApiProperty({ example: 'Sensibilisation des écoliers' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ enum: ICON_KEYS })
  @IsEnum(ICON_KEYS)
  iconKey!: GapActivityIconKey;

  @ApiPropertyOptional({
    type: [String],
    description: 'Up to 10 image URLs (first becomes the cover imageUrl)',
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
  imageUrls?: string[] | null;

  @ApiPropertyOptional({
    deprecated: true,
    description: 'Legacy single image; prefer imageUrls',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de l'image doit être valide." },
  )
  imageUrl?: string | null;

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
