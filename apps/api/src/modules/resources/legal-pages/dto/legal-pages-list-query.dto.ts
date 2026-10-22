import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
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

  @ApiPropertyOptional({
    description:
      'Keep pages last edited (or created if never updated) within the last N days',
    minimum: 1,
    maximum: 3650,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  updatedWithinDays?: number;

  @ApiPropertyOptional({
    description:
      'Keep pages last edited (or created if never updated) more than N days ago',
    minimum: 1,
    maximum: 3650,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  updatedOlderThanDays?: number;
}
