import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

/** Pathname only: starts with `/`, no query string or hash. */
const PATHNAME_PATTERN = /^\/[^?#]*$/;

export class TrackPageViewDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  visitorId!: string;

  @ApiProperty({ example: '/destinations/kinshasa' })
  @IsString()
  @MaxLength(512)
  @Matches(PATHNAME_PATTERN, {
    message: 'path must be a pathname starting with / (no query or hash)',
  })
  path!: string;

  @ApiPropertyOptional({ example: 'fr', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
