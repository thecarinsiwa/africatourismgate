import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { AboutPageSectionKey } from '../../../../entities/about-page.entity';

const SECTION_KEYS = [
  'who-we-are',
  'how-we-work',
  'governance',
  'responsibility',
] as const satisfies readonly AboutPageSectionKey[];

export class PublicAboutPagesListQueryDto {
  @ApiPropertyOptional({ enum: SECTION_KEYS })
  @IsOptional()
  @IsEnum(SECTION_KEYS)
  sectionKey?: AboutPageSectionKey;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
