import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { GuideReviewInvite } from '@africatourismgate/types';

export class GuideReviewInviteDto implements GuideReviewInvite {
  @ApiProperty({ format: 'uuid' })
  assignmentId!: string;

  @ApiProperty({ format: 'uuid' })
  guideId!: string;

  @ApiProperty()
  guideName!: string;

  @ApiProperty({ enum: ['primary', 'secondary'] })
  role!: 'primary' | 'secondary';

  @ApiProperty()
  canReview!: boolean;

  @ApiPropertyOptional({ nullable: true })
  review!: GuideReviewInvite['review'];
}
