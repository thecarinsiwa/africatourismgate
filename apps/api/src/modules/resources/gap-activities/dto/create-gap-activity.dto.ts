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

  @ApiPropertyOptional()
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
