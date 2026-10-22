import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivitySearchResultDto } from './activity-search-result.dto';

export class PublicActivityProviderDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Safari Kinshasa Tours' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, description: 'Partner logo URL' })
  logoUrl!: string | null;
}

export class PublicActivityProviderListItemDto extends PublicActivityProviderDto {
  @ApiPropertyOptional({ nullable: true, example: 'Kinshasa' })
  destinationName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'CD' })
  countryCode!: string | null;

  @ApiProperty({ example: 4, description: 'Active activities offered by the partner' })
  activitiesCount!: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 4.6,
    description: 'Average approved review rating across partner activities',
  })
  averageRating!: number | null;

  @ApiProperty({ example: 12 })
  reviewCount!: number;
}

export class PublicActivityProviderDetailDto extends PublicActivityProviderDto {
  @ApiProperty({ format: 'uuid' })
  destinationId!: string;

  @ApiProperty({ example: 'Kinshasa' })
  destinationName!: string;

  @ApiProperty({ type: [ActivitySearchResultDto] })
  activities!: ActivitySearchResultDto[];
}
