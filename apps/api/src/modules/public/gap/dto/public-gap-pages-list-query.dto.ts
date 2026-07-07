import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { GapPageSectionKey } from '../../../../entities/gap-page.entity';

export class PublicGapPagesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['about', 'objectives', 'unesco'] })
  @IsOptional()
  @IsEnum(['about', 'objectives', 'unesco'])
  sectionKey?: GapPageSectionKey;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  locale?: string;
}
