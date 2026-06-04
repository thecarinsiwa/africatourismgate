import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { Reviews } from '../../../../entities/generated';

const MODERATION_STATUSES = [
  'approved',
  'hidden',
] as const satisfies readonly Reviews['status'][];

export class UpdateReviewStatusDto {
  @ApiProperty({ enum: MODERATION_STATUSES })
  @IsIn(MODERATION_STATUSES)
  status!: 'approved' | 'hidden';
}
