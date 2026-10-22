import { ApiProperty } from '@nestjs/swagger';
import type { PublicHomepageReviews } from '@africatourismgate/types';

export class PublicHomepageReviewsDto implements PublicHomepageReviews {
  @ApiProperty({
    description:
      'When true, Tripadvisor reviews are included in the homepage reviews carousel',
  })
  showTripadvisorReviews!: boolean;

  @ApiProperty({
    description:
      'When true, platform (ATG) reviews are included in the homepage reviews carousel',
  })
  showPlatformReviews!: boolean;
}
