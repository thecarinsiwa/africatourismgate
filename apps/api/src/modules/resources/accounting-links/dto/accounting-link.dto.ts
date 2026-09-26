import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AccountingLinks } from '../../../../entities/accounting-link.entity';

export class AccountingLinkDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ enum: ['fund_entry', 'fund_exit'] })
  fundOpType!: 'fund_entry' | 'fund_exit';

  @ApiProperty({ format: 'uuid' })
  fundOpId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  journalEntryId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  mappingRuleKey!: string | null;

  @ApiProperty({ enum: ['pending', 'linked', 'skipped'] })
  status!: 'pending' | 'linked' | 'skipped';

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toAccountingLinkDto(row: AccountingLinks): AccountingLinkDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    fundOpType: row.fundOpType,
    fundOpId: row.fundOpId,
    journalEntryId: row.journalEntryId,
    mappingRuleKey: row.mappingRuleKey,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
