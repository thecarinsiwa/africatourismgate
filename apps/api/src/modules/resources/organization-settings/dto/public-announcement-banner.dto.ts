import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ANNOUNCEMENT_BANNER_COLORS,
  ANNOUNCEMENT_BANNER_INTENSITIES,
  type AnnouncementBannerColor,
  type AnnouncementBannerIntensity,
  type PublicAnnouncementBanner,
} from '@africatourismgate/types';

export class PublicAnnouncementBannerDto implements PublicAnnouncementBanner {
  @ApiProperty({
    description: 'Whether the banner should be displayed (false when disabled or no text)',
  })
  enabled!: boolean;

  @ApiProperty({ description: 'Banner text for the requested locale (fr fallback)' })
  text!: string;

  @ApiProperty({ enum: ANNOUNCEMENT_BANNER_COLORS, description: 'Color theme' })
  color!: AnnouncementBannerColor;

  @ApiProperty({
    enum: ANNOUNCEMENT_BANNER_INTENSITIES,
    description: 'low = light background / dark text, high = solid background',
  })
  intensity!: AnnouncementBannerIntensity;

  @ApiPropertyOptional({ nullable: true, type: String, description: 'Call-to-action label' })
  ctaLabel!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'Call-to-action URL (http(s) or internal path starting with /)',
  })
  ctaUrl!: string | null;

  @ApiProperty({ description: 'Open the call-to-action in a new tab' })
  ctaNewTab!: boolean;

  @ApiProperty({
    description: 'Content fingerprint; changes whenever the banner content changes',
  })
  version!: string;
}
