import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  JournalEntries,
  JournalLines,
} from '../../../../entities/journal-entry.entity';

export class JournalLineDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  journalEntryId!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty()
  lineNo!: number;

  @ApiProperty({ format: 'uuid' })
  accountId!: string;

  @ApiPropertyOptional({ nullable: true })
  label!: string | null;

  @ApiProperty()
  debitCents!: number;

  @ApiProperty()
  creditCents!: number;

  @ApiPropertyOptional({ nullable: true })
  originalAmountCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  originalCurrency!: string | null;

  @ApiPropertyOptional({ nullable: true })
  fxRate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  analyticRefType!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  analyticRefId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;

  @ApiPropertyOptional()
  accountCode?: string;

  @ApiPropertyOptional()
  accountLabel?: string;

  @ApiPropertyOptional()
  entryNumber?: string;

  @ApiPropertyOptional()
  entryDate?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  journalId?: string;

  @ApiPropertyOptional()
  journalCode?: string;
}

export class JournalEntryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  journalId!: string;

  @ApiProperty({ format: 'uuid' })
  exerciseId!: string;

  @ApiProperty({ format: 'uuid' })
  periodId!: string;

  @ApiProperty({ example: 'CAI-2026-00001' })
  entryNumber!: string;

  @ApiProperty()
  entrySeq!: number;

  @ApiProperty({ example: '2026-09-26' })
  entryDate!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: ['draft', 'posted', 'reversed'] })
  status!: 'draft' | 'posted' | 'reversed';

  @ApiProperty({
    enum: ['treasury_mapping', 'manual', 'closing', 'reversal'],
  })
  source!: 'treasury_mapping' | 'manual' | 'closing' | 'reversal';

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  reversesEntryId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  postedAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  postedByUserId!: string | null;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;

  @ApiPropertyOptional({ type: [JournalLineDto] })
  lines?: JournalLineDto[];

  @ApiPropertyOptional()
  totalDebitCents?: number;

  @ApiPropertyOptional()
  totalCreditCents?: number;
}

function dateOnly(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function toJournalLineDto(
  row: JournalLines,
  extras?: Partial<JournalLineDto>,
): JournalLineDto {
  return {
    id: row.id,
    journalEntryId: row.journalEntryId,
    organizationId: row.organizationId,
    lineNo: row.lineNo,
    accountId: row.accountId,
    label: row.label,
    debitCents: row.debitCents,
    creditCents: row.creditCents,
    originalAmountCents: row.originalAmountCents,
    originalCurrency: row.originalCurrency,
    fxRate: row.fxRate != null ? String(row.fxRate) : null,
    analyticRefType: row.analyticRefType,
    analyticRefId: row.analyticRefId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    ...extras,
  };
}

export function toJournalEntryDto(
  row: JournalEntries,
  lines?: JournalLineDto[],
): JournalEntryDto {
  const totalDebitCents = lines?.reduce((s, l) => s + l.debitCents, 0);
  const totalCreditCents = lines?.reduce((s, l) => s + l.creditCents, 0);
  return {
    id: row.id,
    organizationId: row.organizationId,
    journalId: row.journalId,
    exerciseId: row.exerciseId,
    periodId: row.periodId,
    entryNumber: row.entryNumber,
    entrySeq: row.entrySeq,
    entryDate: dateOnly(row.entryDate),
    description: row.description,
    status: row.status,
    source: row.source,
    reversesEntryId: row.reversesEntryId,
    postedAt: row.postedAt ? row.postedAt.toISOString() : null,
    postedByUserId: row.postedByUserId,
    currency: row.currency,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    ...(lines ? { lines, totalDebitCents, totalCreditCents } : {}),
  };
}
