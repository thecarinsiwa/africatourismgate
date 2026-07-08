import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const ACTIVITY_DESCRIPTION_ASSET_TYPES = ['image', 'pdf', 'word'] as const;

export class ActivityDescriptionAssetsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  activityId?: string;

  @ApiPropertyOptional({ enum: ACTIVITY_DESCRIPTION_ASSET_TYPES })
  @IsOptional()
  @IsEnum(ACTIVITY_DESCRIPTION_ASSET_TYPES)
  assetType?: 'image' | 'pdf' | 'word';
}
