import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { LegalPageSectionKey } from '../../../../entities/legal-page.entity';

const SECTION_KEYS = [
  'terms-of-use',
  'privacy-policy',
] as const satisfies readonly LegalPageSectionKey[];

export class LegalPagesListQueryDto extends PaginationQueryDto {
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
  sectionKey?: LegalPageSectionKey;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
