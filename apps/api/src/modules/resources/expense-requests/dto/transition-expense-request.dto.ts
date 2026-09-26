import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const TRANSITION_TARGETS = [
  'submitted',
  'validated',
  'authorized',
  'rejected',
  'cancelled',
  'closed',
] as const;

export class TransitionExpenseRequestDto {
  @ApiProperty({
    enum: TRANSITION_TARGETS,
    example: 'submitted',
    description: 'Target status (must be a legal transition from current status)',
  })
  @IsIn(TRANSITION_TARGETS)
  toStatus!: (typeof TRANSITION_TARGETS)[number];

  @ApiPropertyOptional({
    description: 'Comment / rejection reason (required when toStatus = rejected)',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string | null;
}
