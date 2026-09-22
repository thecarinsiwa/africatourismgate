import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE,
  SITE_SEARCH_HIT_TYPES,
  SITE_SEARCH_MAX_LIMIT_PER_TYPE,
  SITE_SEARCH_MAX_QUERY_LENGTH,
  SITE_SEARCH_MIN_QUERY_LENGTH,
  type SiteSearchHitType,
} from '@africatourismgate/types';
import { parseSiteSearchTypesQuery } from '../site-search.constants';

export class SiteSearchQueryDto {
  @ApiProperty({
    description: 'Free-text catalogue search query',
    example: 'Safari Nairobi',
    minLength: SITE_SEARCH_MIN_QUERY_LENGTH,
    maxLength: SITE_SEARCH_MAX_QUERY_LENGTH,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(SITE_SEARCH_MIN_QUERY_LENGTH)
  @MaxLength(SITE_SEARCH_MAX_QUERY_LENGTH)
  q!: string;

  @ApiPropertyOptional({ example: 'fr', maxLength: 5 })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;

  @ApiPropertyOptional({
    description: 'Max hits per catalogue type',
    default: SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE,
    minimum: 1,
    maximum: SITE_SEARCH_MAX_LIMIT_PER_TYPE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(SITE_SEARCH_MAX_LIMIT_PER_TYPE)
  limit?: number = SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE;

  @ApiPropertyOptional({
    description:
      'Catalogue types to search (comma-separated or repeated). Omit for all.',
    enum: SITE_SEARCH_HIT_TYPES,
    isArray: true,
    example: ['hotels', 'blog'],
  })
  @IsOptional()
  @Transform(({ value }) => parseSiteSearchTypesQuery(value))
  @IsArray()
  types?: SiteSearchHitType[];
}
