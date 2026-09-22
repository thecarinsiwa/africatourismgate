import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SITE_SEARCH_HIT_TYPES,
  type SiteSearchHitType,
} from '@africatourismgate/types';

export class SiteSearchHitDto {
  @ApiProperty({ enum: SITE_SEARCH_HIT_TYPES })
  type!: SiteSearchHitType;

  @ApiProperty({
    description: 'Entity UUID or blog slug',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ example: 'Safari Lodge Nairobi' })
  title!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Nairobi, KE' })
  subtitle?: string | null;

  @ApiProperty({
    description: 'Public web path',
    example: '/hotels/550e8400-e29b-41d4-a716-446655440000',
  })
  href!: string;

  @ApiPropertyOptional({ nullable: true })
  imageUrl?: string | null;

  @ApiProperty({
    description: 'Relevance score (higher is better)',
    example: 100,
  })
  score!: number;
}

export class SiteSearchGroupDto {
  @ApiProperty({ enum: SITE_SEARCH_HIT_TYPES })
  type!: SiteSearchHitType;

  @ApiProperty({ type: [SiteSearchHitDto] })
  hits!: SiteSearchHitDto[];

  @ApiPropertyOptional({
    nullable: true,
    description: 'Partial failure for this type; other groups may still succeed',
  })
  error?: string | null;
}

export class SiteSearchResponseDto {
  @ApiProperty({ example: 'Safari Nairobi' })
  query!: string;

  @ApiPropertyOptional({ nullable: true, example: 'fr' })
  locale!: string | null;

  @ApiProperty({ example: 5 })
  limit!: number;

  @ApiProperty({ enum: SITE_SEARCH_HIT_TYPES, isArray: true })
  types!: SiteSearchHitType[];

  @ApiProperty({ type: [SiteSearchGroupDto] })
  groups!: SiteSearchGroupDto[];
}
