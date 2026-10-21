import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const TRANSITION_TARGETS = ['disbursed', 'recorded'] as const;

export class TransitionFundExitDto {
  @ApiProperty({
    enum: TRANSITION_TARGETS,
    example: 'disbursed',
    description:
      'Target status (draft→disbursed→recorded; void = TRESO-033). recorded requires ≥1 attachment.',
  })
  @IsIn(TRANSITION_TARGETS)
  toStatus!: (typeof TRANSITION_TARGETS)[number];

  @ApiPropertyOptional({
    description: 'Optional comment for the transition',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string | null;
}
