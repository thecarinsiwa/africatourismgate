import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PublicBrandingQueryDto } from './public-branding-query.dto';

export class PublicAnnouncementBannerQueryDto extends PublicBrandingQueryDto {
  @ApiPropertyOptional({
    description: 'UI locale (fr, en, es). Falls back to fr when missing or unsupported.',
    example: 'fr',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
