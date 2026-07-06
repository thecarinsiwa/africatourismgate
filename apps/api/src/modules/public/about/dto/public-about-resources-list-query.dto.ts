import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { AboutResourceType } from '../../../../entities/about-resource.entity';

const RESOURCE_TYPES = ['financial', 'media'] as const satisfies readonly AboutResourceType[];

export class PublicAboutResourcesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RESOURCE_TYPES })
  @IsOptional()
  @IsEnum(RESOURCE_TYPES)
  type?: AboutResourceType;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
