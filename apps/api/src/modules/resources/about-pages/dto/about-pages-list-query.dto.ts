import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { AboutPageSectionKey } from '../../../../entities/about-page.entity';

const SECTION_KEYS = [
  'who-we-are',
  'how-we-work',
  'governance',
  'responsibility',
] as const satisfies readonly AboutPageSectionKey[];

export class AboutPagesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

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
