import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PublicBrandingQueryDto {
  @ApiPropertyOptional({
    description: 'Organization slug (defaults to the platform organization)',
    example: 'africa-tourism-gate',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationSlug?: string;
}
