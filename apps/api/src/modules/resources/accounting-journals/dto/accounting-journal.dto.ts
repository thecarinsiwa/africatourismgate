import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AccountingJournals } from '../../../../entities/accounting-journal.entity';

export class AccountingJournalDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'CAI' })
  code!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({
    enum: ['cash', 'bank', 'purchases', 'sales', 'general', 'other'],
  })
  journalType!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  defaultAccountId!: string | null;

  @ApiProperty()
  nextEntrySeq!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toAccountingJournalDto(
  row: AccountingJournals,
): AccountingJournalDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    code: row.code,
    label: row.label,
    journalType: row.journalType,
    defaultAccountId: row.defaultAccountId,
    nextEntrySeq: row.nextEntrySeq,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
