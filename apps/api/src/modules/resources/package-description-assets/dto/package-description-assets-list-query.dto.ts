import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const PACKAGE_DESCRIPTION_ASSET_TYPES = ['image', 'pdf', 'word'] as const;

export class PackageDescriptionAssetsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  packageId?: string;

  @ApiPropertyOptional({ enum: PACKAGE_DESCRIPTION_ASSET_TYPES })
  @IsOptional()
  @IsEnum(PACKAGE_DESCRIPTION_ASSET_TYPES)
  assetType?: 'image' | 'pdf' | 'word';
}
