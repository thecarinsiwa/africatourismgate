import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FundEntries } from '../../../entities/fund-entry.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import { TreasuryReportsByDimensionQueryDto } from './dto/treasury-reports-by-dimension-query.dto';
import { TreasuryReportsSummaryQueryDto } from './dto/treasury-reports-summary-query.dto';

/** Aligné TRESO-026 / CRUD « réalisé » : hors voided (et hors draft pour sorties). */
const ENTRY_REALIZED_STATUSES = ['recorded'] as const;
const EXIT_REALIZED_STATUSES = ['disbursed', 'recorded'] as const;

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
