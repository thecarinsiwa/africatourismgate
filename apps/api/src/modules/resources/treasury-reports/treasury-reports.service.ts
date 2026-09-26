import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import {
  FundEntries,
  FundEntryBookings,
} from '../../../entities/fund-entry.entity';
import {
  FundExitBookings,
  FundExits,
} from '../../../entities/fund-exit.entity';
import { TreasuryReportsByDimensionQueryDto } from './dto/treasury-reports-by-dimension-query.dto';
import { TreasuryReportsExportQueryDto } from './dto/treasury-reports-export-query.dto';
import { TreasuryReportsSummaryQueryDto } from './dto/treasury-reports-summary-query.dto';

/** Aligné TRESO-026 / CRUD « réalisé » : hors voided (et hors draft pour sorties). */
const ENTRY_REALIZED_STATUSES = ['recorded'] as const;
const EXIT_REALIZED_STATUSES = ['disbursed', 'recorded'] as const;
const EXPORT_MAX_ROWS = 10_000;

const CSV_HEADERS = [
  'type',
  'id',
  'organizationId',
  'operationDate',
  'amountCents',
  'currency',
  'source',
  'paymentMethod',
  'reference',
  'notes',
  'status',
  'expenseRequestId',
  'bookingIds',
  'createdByUserId',
  'createdAt',
  'voidedAt',
  'voidReason',
] as const;

export type TreasuryReportAmountBucket = {
  currency: string;
  totalCents: number;
  count: number;
};

export type TreasuryReportSideTotals = {
  totalCents: number;
  count: number;
  byCurrency?: TreasuryReportAmountBucket[];
};

export type TreasuryReportsSummary = {
  dateFrom: string;
  dateTo: string;
  organizationId: string | null;
  currency: string | null;
  entries: TreasuryReportSideTotals;
  exits: TreasuryReportSideTotals;
  netCents: number | null;
};

export type TreasuryReportDimensionBucket = {
  key: string;
  entriesCents: number;
  entriesCount: number;
  exitsCents: number;
  exitsCount: number;
};

export type TreasuryReportsByDimension = {
  groupBy: 'source' | 'paymentMethod';
  dateFrom: string;
  dateTo: string;
  organizationId: string | null;
  currency: string | null;
  buckets: TreasuryReportDimensionBucket[];
  totals: {
    entriesCents: number;
    exitsCents: number;
    netCents: number | null;
  };
};

type AggRow = {
  totalCents: string | number | null;
  count: string | number | null;
  currency?: string | null;
  key?: string | null;
};

@Injectable()
export class TreasuryReportsService {
  constructor(
    @InjectRepository(FundEntries)
    private readonly fundEntriesRepository: Repository<FundEntries>,
    @InjectRepository(FundExits)
    private readonly fundExitsRepository: Repository<FundExits>,
    @InjectRepository(FundEntryBookings)
    private readonly fundEntryBookingsRepository: Repository<FundEntryBookings>,
    @InjectRepository(FundExitBookings)
    private readonly fundExitBookingsRepository: Repository<FundExitBookings>,
  ) {}

  async getSummary(
    query: TreasuryReportsSummaryQueryDto,
  ): Promise<TreasuryReportsSummary> {
    const filters = this.normalizeFilters(query);
    const currencyFilter = filters.currency;

    if (currencyFilter) {
      const entries = await this.aggregateSide('entry', filters, false);
      const exits = await this.aggregateSide('exit', filters, false);
      const entryTotal = entries[0] ?? { totalCents: 0, count: 0 };
      const exitTotal = exits[0] ?? { totalCents: 0, count: 0 };
      return {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        organizationId: filters.organizationId,
        currency: currencyFilter,
        entries: {
          totalCents: entryTotal.totalCents,
          count: entryTotal.count,
        },
        exits: {
          totalCents: exitTotal.totalCents,
          count: exitTotal.count,
        },
        netCents: entryTotal.totalCents - exitTotal.totalCents,
      };
    }

    const entryBuckets = await this.aggregateSide('entry', filters, true);
    const exitBuckets = await this.aggregateSide('exit', filters, true);
    const entriesTotal = sumBuckets(entryBuckets);
    const exitsTotal = sumBuckets(exitBuckets);
    const currencies = new Set([
      ...entryBuckets.map((b) => b.currency),
      ...exitBuckets.map((b) => b.currency),
    ]);

    return {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      organizationId: filters.organizationId,
      currency: null,
      entries: {
        totalCents: entriesTotal.totalCents,
        count: entriesTotal.count,
        byCurrency: entryBuckets,
      },
      exits: {
        totalCents: exitsTotal.totalCents,
        count: exitsTotal.count,
        byCurrency: exitBuckets,
      },
      netCents: currencies.size === 1 ? entriesTotal.totalCents - exitsTotal.totalCents : null,
    };
  }

  async getByDimension(
    query: TreasuryReportsByDimensionQueryDto,
  ): Promise<TreasuryReportsByDimension> {
    const filters = this.normalizeFilters(query);
    const groupBy = query.groupBy;

    const entryRows = await this.aggregateByDimension('entry', filters, groupBy);
    const exitRows =
      groupBy === 'source'
        ? []
        : await this.aggregateByDimension('exit', filters, groupBy);

    const keys = new Set<string>([
      ...entryRows.map((r) => r.key),
      ...exitRows.map((r) => r.key),
    ]);
    const entryMap = new Map(entryRows.map((r) => [r.key, r]));
    const exitMap = new Map(exitRows.map((r) => [r.key, r]));

    const buckets: TreasuryReportDimensionBucket[] = [...keys]
      .sort()
      .map((key) => {
        const e = entryMap.get(key);
        const x = exitMap.get(key);
        return {
          key,
          entriesCents: e?.totalCents ?? 0,
          entriesCount: e?.count ?? 0,
          exitsCents: x?.totalCents ?? 0,
          exitsCount: x?.count ?? 0,
        };
      });

    const entriesCents = buckets.reduce((s, b) => s + b.entriesCents, 0);
    const exitsCents = buckets.reduce((s, b) => s + b.exitsCents, 0);

    return {
      groupBy,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      organizationId: filters.organizationId,
      currency: filters.currency,
      buckets,
      totals: {
        entriesCents,
        exitsCents,
        netCents: filters.currency ? entriesCents - exitsCents : null,
      },
    };
  }

  /**
   * Export CSV UTF-8 (BOM) des opérations filtrées.
   * `realizedOnly=true` (défaut) = mêmes statuts que les rapports ; listes passent `realizedOnly=false`.
   */
  async exportCsv(query: TreasuryReportsExportQueryDto): Promise<{
    buffer: Buffer;
    filename: string;
    contentType: string;
  }> {
    const type = query.type ?? 'all';
    const realizedOnly = query.realizedOnly !== 'false';
    const rows: string[][] = [];

    if (type === 'all' || type === 'entries') {
      const entries = await this.loadEntriesForExport(query, realizedOnly);
      const bookingMap = await this.loadEntryBookingIds(
        entries.map((e) => e.id),
      );
      for (const entry of entries) {
        rows.push(
          this.entryToCsvRow(entry, bookingMap.get(entry.id) ?? []),
        );
      }
    }

    if (type === 'all' || type === 'exits') {
      const exits = await this.loadExitsForExport(query, realizedOnly);
      const bookingMap = await this.loadExitBookingIds(exits.map((e) => e.id));
      for (const exit of exits) {
        rows.push(this.exitToCsvRow(exit, bookingMap.get(exit.id) ?? []));
      }
    }

    rows.sort((a, b) => {
      const dateCmp = String(b[3]).localeCompare(String(a[3]));
      if (dateCmp !== 0) return dateCmp;
      return String(b[0]).localeCompare(String(a[0]));
    });

    const limited = rows.slice(0, EXPORT_MAX_ROWS);
    const lines = [
      CSV_HEADERS.join(','),
      ...limited.map((cols) => cols.map(escapeCsvCell).join(',')),
    ];
    const csv = `\uFEFF${lines.join('\r\n')}`;
    const stamp = new Date().toISOString().slice(0, 10);
    const suffix = type === 'all' ? 'operations' : type;
    return {
      buffer: Buffer.from(csv, 'utf8'),
      filename: `treasury-${suffix}-${stamp}.csv`,
      contentType: 'text/csv; charset=utf-8',
    };
  }

  private async loadEntriesForExport(
    query: TreasuryReportsExportQueryDto,
    realizedOnly: boolean,
  ): Promise<FundEntries[]> {
    const qb = this.fundEntriesRepository
      .createQueryBuilder('op')
      .where('op.deletedAt IS NULL');

    this.applyCommonExportFilters(qb, query);

    if (query.status) {
      qb.andWhere('op.status = :status', { status: query.status });
    } else if (realizedOnly) {
      qb.andWhere('op.status IN (:...statuses)', {
        statuses: [...ENTRY_REALIZED_STATUSES],
      });
    }

    if (query.source) {
      qb.andWhere('op.source = :source', { source: query.source });
    }

    if (query.bookingId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM fund_entry_bookings feb
          WHERE feb.fund_entry_id = op.id AND feb.booking_id = :bookingId
        )`,
        { bookingId: query.bookingId },
      );
    }

    if (query.search?.trim()) {
      qb.andWhere('(op.reference LIKE :term OR op.notes LIKE :term)', {
        term: `%${query.search.trim()}%`,
      });
    }

    return qb
      .orderBy('op.operationDate', 'DESC')
      .addOrderBy('op.createdAt', 'DESC')
      .take(EXPORT_MAX_ROWS)
      .getMany();
  }

  private async loadExitsForExport(
    query: TreasuryReportsExportQueryDto,
    realizedOnly: boolean,
  ): Promise<FundExits[]> {
    const qb = this.fundExitsRepository
      .createQueryBuilder('op')
      .where('op.deletedAt IS NULL');

    this.applyCommonExportFilters(qb, query);

    if (query.status) {
      qb.andWhere('op.status = :status', { status: query.status });
    } else if (realizedOnly) {
      qb.andWhere('op.status IN (:...statuses)', {
        statuses: [...EXIT_REALIZED_STATUSES],
      });
    }

    if (query.expenseRequestId) {
      qb.andWhere('op.expenseRequestId = :expenseRequestId', {
        expenseRequestId: query.expenseRequestId,
      });
    }

    if (query.bookingId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM fund_exit_bookings feb
          WHERE feb.fund_exit_id = op.id AND feb.booking_id = :bookingId
        )`,
        { bookingId: query.bookingId },
      );
    }

    if (query.search?.trim()) {
      qb.andWhere('(op.reference LIKE :term OR op.notes LIKE :term)', {
        term: `%${query.search.trim()}%`,
      });
    }

    return qb
      .orderBy('op.operationDate', 'DESC')
      .addOrderBy('op.createdAt', 'DESC')
      .take(EXPORT_MAX_ROWS)
      .getMany();
  }

  private applyCommonExportFilters(
    qb: SelectQueryBuilder<FundEntries> | SelectQueryBuilder<FundExits>,
    query: TreasuryReportsExportQueryDto,
  ): void {
    if (query.dateFrom) {
      qb.andWhere('op.operationDate >= :dateFrom', {
        dateFrom: query.dateFrom.slice(0, 10),
      });
    }
    if (query.dateTo) {
      qb.andWhere('op.operationDate <= :dateTo', {
        dateTo: query.dateTo.slice(0, 10),
      });
    }
    if (query.organizationId) {
      qb.andWhere('op.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.currency) {
      qb.andWhere('op.currency = :currency', {
        currency: query.currency.toUpperCase(),
      });
    }
    if (query.paymentMethod) {
      qb.andWhere('op.paymentMethod = :paymentMethod', {
        paymentMethod: query.paymentMethod,
      });
    }
  }

  private async loadEntryBookingIds(
    ids: string[],
  ): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (ids.length === 0) return map;
    const links = await this.fundEntryBookingsRepository.find({
      where: { fundEntryId: In(ids) },
    });
    for (const link of links) {
      const list = map.get(link.fundEntryId) ?? [];
      list.push(link.bookingId);
      map.set(link.fundEntryId, list);
    }
    return map;
  }

  private async loadExitBookingIds(
    ids: string[],
  ): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (ids.length === 0) return map;
    const links = await this.fundExitBookingsRepository.find({
      where: { fundExitId: In(ids) },
    });
    for (const link of links) {
      const list = map.get(link.fundExitId) ?? [];
      list.push(link.bookingId);
      map.set(link.fundExitId, list);
    }
    return map;
  }

  private entryToCsvRow(entry: FundEntries, bookingIds: string[]): string[] {
    return [
      'entry',
      entry.id,
      entry.organizationId,
      entry.operationDate,
      String(entry.amountCents),
      entry.currency,
      entry.source,
      entry.paymentMethod,
      entry.reference ?? '',
      entry.notes ?? '',
      entry.status,
      '',
      bookingIds.join(';'),
      entry.createdByUserId ?? '',
      toIso(entry.createdAt),
      toIso(entry.voidedAt),
      entry.voidReason ?? '',
    ];
  }

  private exitToCsvRow(exit: FundExits, bookingIds: string[]): string[] {
    return [
      'exit',
      exit.id,
      exit.organizationId,
      exit.operationDate,
      String(exit.amountCents),
      exit.currency,
      '',
      exit.paymentMethod,
      exit.reference ?? '',
      exit.notes ?? '',
      exit.status,
      exit.expenseRequestId,
      bookingIds.join(';'),
      exit.createdByUserId ?? '',
      toIso(exit.createdAt),
      toIso(exit.voidedAt),
      exit.voidReason ?? '',
    ];
  }

  private normalizeFilters(query: TreasuryReportsSummaryQueryDto): {
    dateFrom: string;
    dateTo: string;
    organizationId: string | null;
    currency: string | null;
    source: string | null;
    paymentMethod: string | null;
  } {
    return {
      dateFrom: query.dateFrom.slice(0, 10),
      dateTo: query.dateTo.slice(0, 10),
      organizationId: query.organizationId ?? null,
      currency: query.currency?.toUpperCase() ?? null,
      source: query.source ?? null,
      paymentMethod: query.paymentMethod ?? null,
    };
  }

  private async aggregateSide(
    side: 'entry' | 'exit',
    filters: ReturnType<TreasuryReportsService['normalizeFilters']>,
    byCurrency: boolean,
  ): Promise<TreasuryReportAmountBucket[]> {
    const qb =
      side === 'entry'
        ? this.baseEntriesQb(filters)
        : this.baseExitsQb(filters);

    qb.select('COALESCE(SUM(op.amountCents), 0)', 'totalCents').addSelect(
      'COUNT(op.id)',
      'count',
    );

    if (byCurrency) {
      qb.addSelect('op.currency', 'currency').groupBy('op.currency');
    }

    const rows = (await qb.getRawMany()) as AggRow[];
    return rows.map((row) => ({
      currency: String(row.currency ?? filters.currency ?? ''),
      totalCents: toInt(row.totalCents),
      count: toInt(row.count),
    }));
  }

  private async aggregateByDimension(
    side: 'entry' | 'exit',
    filters: ReturnType<TreasuryReportsService['normalizeFilters']>,
    groupBy: 'source' | 'paymentMethod',
  ): Promise<Array<{ key: string; totalCents: number; count: number }>> {
    const qb =
      side === 'entry'
        ? this.baseEntriesQb(filters)
        : this.baseExitsQb(filters);

    const column = groupBy === 'source' ? 'op.source' : 'op.paymentMethod';
    qb.select(column, 'key')
      .addSelect('COALESCE(SUM(op.amountCents), 0)', 'totalCents')
      .addSelect('COUNT(op.id)', 'count')
      .groupBy(column);

    const rows = (await qb.getRawMany()) as AggRow[];
    return rows
      .filter((row) => row.key != null && String(row.key).length > 0)
      .map((row) => ({
        key: String(row.key),
        totalCents: toInt(row.totalCents),
        count: toInt(row.count),
      }));
  }

  private baseEntriesQb(
    filters: ReturnType<TreasuryReportsService['normalizeFilters']>,
  ): SelectQueryBuilder<FundEntries> {
    const qb = this.fundEntriesRepository
      .createQueryBuilder('op')
      .where('op.deletedAt IS NULL')
      .andWhere('op.status IN (:...statuses)', {
        statuses: [...ENTRY_REALIZED_STATUSES],
      })
      .andWhere('op.operationDate >= :dateFrom', { dateFrom: filters.dateFrom })
      .andWhere('op.operationDate <= :dateTo', { dateTo: filters.dateTo });

    if (filters.organizationId) {
      qb.andWhere('op.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }
    if (filters.currency) {
      qb.andWhere('op.currency = :currency', { currency: filters.currency });
    }
    if (filters.source) {
      qb.andWhere('op.source = :source', { source: filters.source });
    }
    if (filters.paymentMethod) {
      qb.andWhere('op.paymentMethod = :paymentMethod', {
        paymentMethod: filters.paymentMethod,
      });
    }
    return qb;
  }

  private baseExitsQb(
    filters: ReturnType<TreasuryReportsService['normalizeFilters']>,
  ): SelectQueryBuilder<FundExits> {
    const qb = this.fundExitsRepository
      .createQueryBuilder('op')
      .where('op.deletedAt IS NULL')
      .andWhere('op.status IN (:...statuses)', {
        statuses: [...EXIT_REALIZED_STATUSES],
      })
      .andWhere('op.operationDate >= :dateFrom', { dateFrom: filters.dateFrom })
      .andWhere('op.operationDate <= :dateTo', { dateTo: filters.dateTo });

    if (filters.organizationId) {
      qb.andWhere('op.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }
    if (filters.currency) {
      qb.andWhere('op.currency = :currency', { currency: filters.currency });
    }
    // `source` filtre uniquement les entrées — ignoré pour les sorties
    if (filters.paymentMethod) {
      qb.andWhere('op.paymentMethod = :paymentMethod', {
        paymentMethod: filters.paymentMethod,
      });
    }
    return qb;
  }
}

function toInt(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : 0;
}

function sumBuckets(buckets: TreasuryReportAmountBucket[]): {
  totalCents: number;
  count: number;
} {
  return buckets.reduce(
    (acc, b) => ({
      totalCents: acc.totalCents + b.totalCents,
      count: acc.count + b.count,
    }),
    { totalCents: 0, count: 0 },
  );
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toIso(value: Date | string | null | undefined): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
