import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

const STATUSES = ['pending', 'linked', 'skipped'] as const;

export class UpdateAccountingLinkDto {
  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Optional journal entry id (SYSCOHADA future).',
  })
  @IsOptional()
  @IsUUID('4')
  journalEntryId?: string | null;

  @ApiPropertyOptional({ maxLength: 120, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mappingRuleKey?: string | null;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
