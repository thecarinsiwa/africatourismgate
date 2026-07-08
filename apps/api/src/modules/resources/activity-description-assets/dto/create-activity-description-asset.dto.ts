import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, Min, IsInt } from 'class-validator';

const ACTIVITY_DESCRIPTION_ASSET_TYPES = ['image', 'pdf', 'word'] as const;

export class CreateActivityDescriptionAssetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  activityId!: string;

  @ApiProperty({ enum: ACTIVITY_DESCRIPTION_ASSET_TYPES })
  @IsEnum(ACTIVITY_DESCRIPTION_ASSET_TYPES)
  assetType!: 'image' | 'pdf' | 'word';

  @ApiProperty({
    example:
      'https://app-africatourismgate.org/api/uploads/activities/description-assets/example.pdf',
  })
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
