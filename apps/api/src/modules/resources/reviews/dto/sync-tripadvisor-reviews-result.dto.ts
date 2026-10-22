import { ApiProperty } from '@nestjs/swagger';
import type { SyncTripadvisorReviewsResult } from '@africatourismgate/types';

export class SyncTripadvisorReviewsResultDto
  implements SyncTripadvisorReviewsResult
{
  @ApiProperty({ description: 'New Tripadvisor reviews inserted' })
  imported!: number;

  @ApiProperty({ description: 'Existing synced reviews updated' })
  updated!: number;

  @ApiProperty({
    description: 'Terra items skipped (missing body/id/rating or unusable)',
  })
  skipped!: number;

  @ApiProperty({ description: 'Terra API pages fetched' })
  pages!: number;
}
