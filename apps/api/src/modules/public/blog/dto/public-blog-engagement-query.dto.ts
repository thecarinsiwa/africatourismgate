import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PublicBlogEngagementQueryDto {
  @ApiPropertyOptional({
    description: 'Anonymous visitor key used to resolve the current reaction',
    minLength: 8,
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  visitorKey?: string;
}
