import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { AboutResourceType } from '../../../../entities/about-resource.entity';

const RESOURCE_TYPES = ['financial', 'media'] as const satisfies readonly AboutResourceType[];

export class AboutResourcesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RESOURCE_TYPES })
  @IsOptional()
  @IsEnum(RESOURCE_TYPES)
  type?: AboutResourceType;

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
