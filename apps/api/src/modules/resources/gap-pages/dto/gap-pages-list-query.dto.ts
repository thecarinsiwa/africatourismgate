import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { GapPageSectionKey } from '../../../../entities/gap-page.entity';

export class GapPagesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['about', 'objectives', 'unesco'] })
  @IsOptional()
  @IsEnum(['about', 'objectives', 'unesco'])
  sectionKey?: GapPageSectionKey;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';
}
