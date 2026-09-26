import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { AccountingJournals } from '../../../entities/accounting-journal.entity';
import {
  AccountingExercises,
  AccountingPeriods,
} from '../../../entities/accounting-exercise.entity';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import {
  JournalEntries,
  JournalLines,
} from '../../../entities/journal-entry.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntriesListQueryDto } from './dto/journal-entries-list-query.dto';
import {
  JournalEntryDto,
  JournalLineDto,
  toJournalEntryDto,
  toJournalLineDto,
} from './dto/journal-entry.dto';
import { JournalLinesListQueryDto } from './dto/journal-lines-list-query.dto';
import { AccountingBalanceQueryDto } from './dto/accounting-balance-query.dto';

function dateOnly(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

/**
 * Écritures SYSCOHADA (SYSCO-003).
 * Numérotation : `{journal.code}-{exercise.code}-{entry_seq:05d}` par journal+exercice.
 * Ne remplit pas `accounting_links.journal_entry_id` (SYSCO-005).
 */
@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntries)
    private readonly entriesRepo: Repository<JournalEntries>,
    @InjectRepository(JournalLines)
    private readonly linesRepo: Repository<JournalLines>,
    @InjectRepository(AccountingJournals)
    private readonly journalsRepo: Repository<AccountingJournals>,
    @InjectRepository(AccountingExercises)
    private readonly exercisesRepo: Repository<AccountingExercises>,
    @InjectRepository(AccountingPeriods)
    private readonly periodsRepo: Repository<AccountingPeriods>,
    @InjectRepository(ChartOfAccounts)
    private readonly accountsRepo: Repository<ChartOfAccounts>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    query: JournalEntriesListQueryDto,
  ): Promise<PaginatedResult<JournalEntryDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .where('entry.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('entry.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.journalId) {
      qb.andWhere('entry.journalId = :journalId', {
        journalId: query.journalId,
      });
    }
    if (query.exerciseId) {
      qb.andWhere('entry.exerciseId = :exerciseId', {
        exerciseId: query.exerciseId,
      });
    }
    if (query.periodId) {
      qb.andWhere('entry.periodId = :periodId', { periodId: query.periodId });
    }
    if (query.status) {
      qb.andWhere('entry.status = :status', { status: query.status });
    }
    if (query.dateFrom) {
      qb.andWhere('entry.entryDate >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('entry.entryDate <= :dateTo', { dateTo: query.dateTo });
    }
    if (query.accountId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM journal_lines jl
          WHERE jl.journal_entry_id = entry.id
            AND jl.deleted_at IS NULL
            AND jl.account_id = :accountId
        )`,
        { accountId: query.accountId },
      );
    }

    qb.orderBy('entry.entryDate', 'DESC').addOrderBy('entry.entrySeq', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();

    let linesByEntry = new Map<string, JournalLineDto[]>();
    if (query.includeLines && rows.length > 0) {
      linesByEntry = await this.loadLinesByEntryIds(rows.map((r) => r.id));
    }

    return {
      data: rows.map((row) =>
        toJournalEntryDto(row, linesByEntry.get(row.id)),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<JournalEntryDto> {
    const row = await this.entriesRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Journal entry not found');
    }
    const lines = await this.linesRepo.find({
      where: { journalEntryId: id, deletedAt: IsNull() },
      order: { lineNo: 'ASC' },
    });
    return toJournalEntryDto(row, lines.map((l) => toJournalLineDto(l)));
  }

  /**
   * Grand livre brut : lignes filtrables par compte / journal / période.
   */
  async findLines(
    query: JournalLinesListQueryDto,
  ): Promise<PaginatedResult<JournalLineDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const postedOnly = query.postedOnly !== false;

    const qb = this.linesRepo
      .createQueryBuilder('line')
      .innerJoin(JournalEntries, 'entry', 'entry.id = line.journalEntryId')
      .leftJoin(ChartOfAccounts, 'account', 'account.id = line.accountId')
      .leftJoin(AccountingJournals, 'journal', 'journal.id = entry.journalId')
      .where('line.deletedAt IS NULL')
      .andWhere('entry.deletedAt IS NULL');

    if (postedOnly) {
      qb.andWhere('entry.status = :posted', { posted: 'posted' });
    }
    if (query.organizationId) {
      qb.andWhere('line.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.accountId) {
      qb.andWhere('line.accountId = :accountId', { accountId: query.accountId });
    }
    if (query.journalId) {
      qb.andWhere('entry.journalId = :journalId', {
        journalId: query.journalId,
      });
    }
    if (query.exerciseId) {
      qb.andWhere('entry.exerciseId = :exerciseId', {
        exerciseId: query.exerciseId,
      });
    }
    if (query.periodId) {
      qb.andWhere('entry.periodId = :periodId', { periodId: query.periodId });
    }
    if (query.dateFrom) {
      qb.andWhere('entry.entryDate >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('entry.entryDate <= :dateTo', { dateTo: query.dateTo });
    }

    qb.select([
      'line.id AS line_id',
      'line.journalEntryId AS journal_entry_id',
      'line.organizationId AS organization_id',
      'line.lineNo AS line_no',
      'line.accountId AS account_id',
      'line.label AS label',
      'line.debitCents AS debit_cents',
      'line.creditCents AS credit_cents',
      'line.originalAmountCents AS original_amount_cents',
      'line.originalCurrency AS original_currency',
      'line.fxRate AS fx_rate',
      'line.analyticRefType AS analytic_ref_type',
      'line.analyticRefId AS analytic_ref_id',
      'line.createdAt AS created_at',
      'line.updatedAt AS updated_at',
      'account.code AS account_code',
      'account.label AS account_label',
      'entry.entryNumber AS entry_number',
      'entry.entryDate AS entry_date',
      'entry.journalId AS journal_id',
      'journal.code AS journal_code',
    ]);

    qb.orderBy('entry.entryDate', 'ASC')
      .addOrderBy('entry.entrySeq', 'ASC')
      .addOrderBy('line.lineNo', 'ASC');

    const countRow = await qb
      .clone()
      .select('COUNT(line.id)', 'cnt')
      .orderBy()
      .getRawOne<{ cnt: string | number }>();
    const total = Number(countRow?.cnt ?? 0);

    qb.offset((page - 1) * limit).limit(limit);
    const rows = await qb.getRawMany<{
      line_id: string;
      journal_entry_id: string;
      organization_id: string;
      line_no: number;
      account_id: string;
      label: string | null;
      debit_cents: number;
      credit_cents: number;
      original_amount_cents: number | null;
      original_currency: string | null;
      fx_rate: string | null;
      analytic_ref_type: string | null;
      analytic_ref_id: string | null;
      created_at: Date;
      updated_at: Date | null;
      account_code: string | null;
      account_label: string | null;
      entry_number: string;
      entry_date: string | Date;
      journal_id: string;
      journal_code: string | null;
    }>();

    const data: JournalLineDto[] = rows.map((r) => ({
      id: r.line_id,
      journalEntryId: r.journal_entry_id,
      organizationId: r.organization_id,
      lineNo: Number(r.line_no),
      accountId: r.account_id,
      label: r.label,
      debitCents: Number(r.debit_cents),
      creditCents: Number(r.credit_cents),
      originalAmountCents:
        r.original_amount_cents != null ? Number(r.original_amount_cents) : null,
      originalCurrency: r.original_currency,
      fxRate: r.fx_rate != null ? String(r.fx_rate) : null,
      analyticRefType: r.analytic_ref_type,
      analyticRefId: r.analytic_ref_id,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      accountCode: r.account_code ?? undefined,
      accountLabel: r.account_label ?? undefined,
      entryNumber: r.entry_number,
      entryDate:
        typeof r.entry_date === 'string'
          ? r.entry_date.slice(0, 10)
          : new Date(r.entry_date).toISOString().slice(0, 10),
      journalId: r.journal_id,
      journalCode: r.journal_code ?? undefined,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  /**
   * Balance générale — agrégat des lignes d’écritures `posted` (SYSCO-006).
   */
  async getBalance(query: AccountingBalanceQueryDto): Promise<{
    rows: Array<{
      accountId: string;
      accountCode: string;
      accountLabel: string;
      classNumber: number;
      debitCents: number;
      creditCents: number;
      balanceCents: number;
    }>;
    totals: {
      debitCents: number;
      creditCents: number;
      balanceCents: number;
    };
  }> {
    const qb = this.linesRepo
      .createQueryBuilder('line')
      .innerJoin(JournalEntries, 'entry', 'entry.id = line.journalEntryId')
      .innerJoin(ChartOfAccounts, 'account', 'account.id = line.accountId')
      .where('line.deletedAt IS NULL')
      .andWhere('entry.deletedAt IS NULL')
      .andWhere('entry.status = :posted', { posted: 'posted' })
      .andWhere('account.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('line.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.exerciseId) {
      qb.andWhere('entry.exerciseId = :exerciseId', {
        exerciseId: query.exerciseId,
      });
    }
    if (query.periodId) {
      qb.andWhere('entry.periodId = :periodId', { periodId: query.periodId });
    }
    if (query.journalId) {
      qb.andWhere('entry.journalId = :journalId', {
        journalId: query.journalId,
      });
    }

    qb.select('account.id', 'accountId')
      .addSelect('account.code', 'accountCode')
      .addSelect('account.label', 'accountLabel')
      .addSelect('account.classNumber', 'classNumber')
      .addSelect('COALESCE(SUM(line.debitCents), 0)', 'debitCents')
      .addSelect('COALESCE(SUM(line.creditCents), 0)', 'creditCents')
      .groupBy('account.id')
      .addGroupBy('account.code')
      .addGroupBy('account.label')
      .addGroupBy('account.classNumber')
      .orderBy('account.code', 'ASC');

    const raw = await qb.getRawMany<{
      accountId: string;
      accountCode: string;
      accountLabel: string;
      classNumber: number | string;
      debitCents: number | string;
      creditCents: number | string;
    }>();

    const rows = raw.map((r) => {
      const debitCents = Number(r.debitCents);
      const creditCents = Number(r.creditCents);
      return {
        accountId: r.accountId,
        accountCode: r.accountCode,
        accountLabel: r.accountLabel,
        classNumber: Number(r.classNumber),
        debitCents,
        creditCents,
        balanceCents: debitCents - creditCents,
      };
    });

    const totals = rows.reduce(
      (acc, row) => ({
        debitCents: acc.debitCents + row.debitCents,
        creditCents: acc.creditCents + row.creditCents,
        balanceCents: acc.balanceCents + row.balanceCents,
      }),
      { debitCents: 0, creditCents: 0, balanceCents: 0 },
    );

    return { rows, totals };
  }

  async create(
    dto: CreateJournalEntryDto,
    actorUserId?: string | null,
  ): Promise<JournalEntryDto> {
    this.assertLinesBalanced(dto.lines);

    const journal = await this.journalsRepo.findOne({
      where: { id: dto.journalId, deletedAt: IsNull() },
    });
    if (!journal || journal.organizationId !== dto.organizationId) {
      throw new NotFoundException('Accounting journal not found');
    }
    if (!journal.isActive) {
      throw new BadRequestException('Journal is inactive');
    }

    const { exercise, period } = await this.resolveExerciseAndPeriod(dto);

    if (exercise.status === 'closed') {
      throw new BadRequestException('Accounting exercise is closed');
    }
    if (period.status === 'locked' || period.status === 'closed') {
      throw new BadRequestException(
        `Accounting period is ${period.status} — cannot post entries`,
      );
    }

    const entryDate = dto.entryDate.slice(0, 10);
    const periodStart = dateOnly(period.startsOn);
    const periodEnd = dateOnly(period.endsOn);
    if (entryDate < periodStart || entryDate > periodEnd) {
      throw new BadRequestException(
        'entryDate must fall within the selected period',
      );
    }

    const accountIds = [...new Set(dto.lines.map((l) => l.accountId))];
    const accounts = await this.accountsRepo.find({
      where: { id: In(accountIds), deletedAt: IsNull() },
    });
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('One or more accounts were not found');
    }
    for (const account of accounts) {
      if (account.organizationId !== dto.organizationId) {
        throw new BadRequestException(
          `Account ${account.code} does not belong to the organization`,
        );
      }
      if (!account.isActive) {
        throw new BadRequestException(`Account ${account.code} is inactive`);
      }
      if (!account.isPostable) {
        throw new BadRequestException(
          `Account ${account.code} is not postable (grouping account)`,
        );
      }
    }

    if (dto.reversesEntryId) {
      const reversed = await this.entriesRepo.findOne({
        where: { id: dto.reversesEntryId, deletedAt: IsNull() },
      });
      if (!reversed || reversed.organizationId !== dto.organizationId) {
        throw new NotFoundException('Reversed journal entry not found');
      }
    }

    const status = dto.status ?? 'draft';
    const source = dto.source ?? 'manual';

    const saved = await this.dataSource.transaction(async (manager) => {
      const journalsTx = manager.getRepository(AccountingJournals);
      const entriesTx = manager.getRepository(JournalEntries);
      const linesTx = manager.getRepository(JournalLines);

      // Lock journal row to serialize sequence allocation
      await journalsTx
        .createQueryBuilder('j')
        .setLock('pessimistic_write')
        .where('j.id = :id', { id: journal.id })
        .getOne();

      const maxRow = await entriesTx
        .createQueryBuilder('e')
        .select('MAX(e.entrySeq)', 'maxSeq')
        .where('e.journalId = :journalId', { journalId: journal.id })
        .andWhere('e.exerciseId = :exerciseId', { exerciseId: exercise.id })
        .andWhere('e.deletedAt IS NULL')
        .getRawOne<{ maxSeq: number | string | null }>();

      const entrySeq = Number(maxRow?.maxSeq ?? 0) + 1;
      const entryNumber = `${journal.code}-${exercise.code}-${String(entrySeq).padStart(5, '0')}`;

      const entryId = newId();
      const now = new Date();
      const entry = entriesTx.create({
        id: entryId,
        organizationId: dto.organizationId,
        journalId: journal.id,
        exerciseId: exercise.id,
        periodId: period.id,
        entryNumber,
        entrySeq,
        entryDate,
        description: dto.description,
        status,
        source,
        reversesEntryId: dto.reversesEntryId ?? null,
        postedAt: status === 'posted' ? now : null,
        postedByUserId: status === 'posted' ? (actorUserId ?? null) : null,
        currency: exercise.currency,
        createdByUserId: actorUserId ?? null,
      });

      await entriesTx.save(entry);

      const lineEntities = dto.lines.map((line, index) =>
        linesTx.create({
          id: newId(),
          journalEntryId: entryId,
          organizationId: dto.organizationId,
          lineNo: index + 1,
          accountId: line.accountId,
          label: line.label ?? null,
          debitCents: line.debitCents,
          creditCents: line.creditCents,
          originalAmountCents: line.originalAmountCents ?? null,
          originalCurrency: line.originalCurrency ?? null,
          fxRate:
            line.fxRate != null ? String(line.fxRate) : null,
          analyticRefType: line.analyticRefType ?? null,
          analyticRefId: line.analyticRefId ?? null,
          createdByUserId: actorUserId ?? null,
        }),
      );
      await linesTx.save(lineEntities);

      await journalsTx.update(journal.id, {
        nextEntrySeq: Math.max(journal.nextEntrySeq, entrySeq + 1),
        updatedByUserId: actorUserId ?? null,
      });

      return { entry, lines: lineEntities };
    });

    return toJournalEntryDto(
      saved.entry,
      saved.lines.map((l) => toJournalLineDto(l)),
    );
  }

  private assertLinesBalanced(
    lines: CreateJournalEntryDto['lines'],
  ): void {
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      const debit = line.debitCents ?? 0;
      const credit = line.creditCents ?? 0;
      if (!((debit > 0 && credit === 0) || (credit > 0 && debit === 0))) {
        throw new BadRequestException(
          'Each line must have exactly one of debitCents or creditCents > 0',
        );
      }
      totalDebit += debit;
      totalCredit += credit;
    }
    if (totalDebit !== totalCredit) {
      throw new BadRequestException(
        `Unbalanced entry: debit ${totalDebit} != credit ${totalCredit}`,
      );
    }
    if (totalDebit <= 0) {
      throw new BadRequestException('Entry totals must be greater than zero');
    }
  }

  private async resolveExerciseAndPeriod(dto: CreateJournalEntryDto): Promise<{
    exercise: AccountingExercises;
    period: AccountingPeriods;
  }> {
    const entryDate = dto.entryDate.slice(0, 10);

    if (dto.periodId) {
      const period = await this.periodsRepo.findOne({
        where: { id: dto.periodId, deletedAt: IsNull() },
      });
      if (!period || period.organizationId !== dto.organizationId) {
        throw new NotFoundException('Accounting period not found');
      }
      const exercise = await this.exercisesRepo.findOne({
        where: { id: period.exerciseId, deletedAt: IsNull() },
      });
      if (!exercise) {
        throw new NotFoundException('Accounting exercise not found');
      }
      if (dto.exerciseId && dto.exerciseId !== exercise.id) {
        throw new BadRequestException(
          'exerciseId does not match the period’s exercise',
        );
      }
      return { exercise, period };
    }

    if (!dto.exerciseId) {
      throw new BadRequestException(
        'Provide periodId or exerciseId (with entryDate to resolve period)',
      );
    }

    const exercise = await this.exercisesRepo.findOne({
      where: { id: dto.exerciseId, deletedAt: IsNull() },
    });
    if (!exercise || exercise.organizationId !== dto.organizationId) {
      throw new NotFoundException('Accounting exercise not found');
    }

    const period = await this.periodsRepo
      .createQueryBuilder('period')
      .where('period.deletedAt IS NULL')
      .andWhere('period.exerciseId = :exerciseId', { exerciseId: exercise.id })
      .andWhere('period.startsOn <= :entryDate', { entryDate })
      .andWhere('period.endsOn >= :entryDate', { entryDate })
      .orderBy('period.sequenceNo', 'ASC')
      .getOne();

    if (!period) {
      throw new BadRequestException(
        'No accounting period covers the entryDate in this exercise',
      );
    }

    return { exercise, period };
  }

  private async loadLinesByEntryIds(
    entryIds: string[],
  ): Promise<Map<string, JournalLineDto[]>> {
    const rows = await this.linesRepo.find({
      where: { journalEntryId: In(entryIds), deletedAt: IsNull() },
      order: { lineNo: 'ASC' },
    });
    const map = new Map<string, JournalLineDto[]>();
    for (const row of rows) {
      const list = map.get(row.journalEntryId) ?? [];
      list.push(toJournalLineDto(row));
      map.set(row.journalEntryId, list);
    }
    return map;
  }
}
