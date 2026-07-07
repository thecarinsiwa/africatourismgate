import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { GapMediaItemType } from '../../../../entities/gap-media-item.entity';

export class PublicGapMediaListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['image', 'video'] })
  @IsOptional()
  @IsEnum(['image', 'video'])
  mediaType?: GapMediaItemType;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  locale?: string;
}
