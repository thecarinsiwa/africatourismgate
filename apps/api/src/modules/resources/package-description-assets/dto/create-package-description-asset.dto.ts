import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, Min, IsInt } from 'class-validator';

const PACKAGE_DESCRIPTION_ASSET_TYPES = ['image', 'pdf', 'word'] as const;

export class CreatePackageDescriptionAssetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  packageId!: string;

  @ApiProperty({ enum: PACKAGE_DESCRIPTION_ASSET_TYPES })
  @IsEnum(PACKAGE_DESCRIPTION_ASSET_TYPES)
  assetType!: 'image' | 'pdf' | 'word';

  @ApiProperty({ example: 'https://app-africatourismgate.org/api/uploads/packages/description-assets/example.pdf' })
  @IsString()
  @MaxLength(1024)
  url!: string;

  @ApiPropertyOptional({ example: 'Brochure programme.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
