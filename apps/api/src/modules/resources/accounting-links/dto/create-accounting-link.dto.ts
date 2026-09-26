import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const FUND_OP_TYPES = ['fund_entry', 'fund_exit'] as const;
const STATUSES = ['pending', 'linked', 'skipped'] as const;

export class CreateAccountingLinkDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  organizationId!: string;

  @ApiProperty({ enum: FUND_OP_TYPES })
  @IsIn(FUND_OP_TYPES)
  fundOpType!: (typeof FUND_OP_TYPES)[number];

  @ApiProperty({ format: 'uuid', description: 'fund_entries.id or fund_exits.id' })
  @IsUUID('4')
  fundOpId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description:
      'Optional future journal entry id (SYSCOHADA). Null in this stub unless provided manually.',
  })
  @IsOptional()
  @IsUUID('4')
  journalEntryId?: string | null;

  @ApiPropertyOptional({
    maxLength: 120,
    description: 'Key from accounting_mapping_rules (SYSCO-004)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mappingRuleKey?: string | null;

  @ApiPropertyOptional({ enum: STATUSES, default: 'pending' })
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
