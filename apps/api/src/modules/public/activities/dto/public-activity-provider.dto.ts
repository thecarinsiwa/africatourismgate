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

export class PublicActivityProviderDetailDto extends PublicActivityProviderDto {
  @ApiProperty({ format: 'uuid' })
  destinationId!: string;

  @ApiProperty({ example: 'Kinshasa' })
  destinationName!: string;

  @ApiProperty({ type: [ActivitySearchResultDto] })
  activities!: ActivitySearchResultDto[];
}
