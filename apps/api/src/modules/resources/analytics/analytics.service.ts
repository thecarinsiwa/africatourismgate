import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitePageViews } from '../../../entities/site-page-view.entity';
import type { AnalyticsPeriod } from './dto/analytics-query.dto';
import type {
  AnalyticsChangeDirection,
  AnalyticsChangeDto,
  AnalyticsSummaryDto,
  AnalyticsTopPageDto,
  AnalyticsTopPagesDto,
  AnalyticsTrendDto,
  AnalyticsTrendPointDto,
} from './dto/analytics-response.dto';

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

type PeriodBounds = {
  period: AnalyticsPeriod;
  dateFrom: string;
  dateTo: string;
  days: string[];
  rangeStart: Date;
  rangeExclusiveEnd: Date;
  previousStart: Date;
  previousExclusiveEnd: Date;
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function resolvePeriodBounds(period: AnalyticsPeriod): PeriodBounds {
  const dayCount = PERIOD_DAYS[period];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (dayCount - 1));

  const exclusiveEnd = new Date(end);
  exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);

  const previousExclusiveEnd = new Date(start);
  const previousStart = new Date(start);
  previousStart.setUTCDate(previousStart.getUTCDate() - dayCount);

  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor < exclusiveEnd) {
    days.push(formatDateOnly(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    period,
    dateFrom: formatDateOnly(start),
    dateTo: formatDateOnly(end),
    days,
    rangeStart: start,
    rangeExclusiveEnd: exclusiveEnd,
    previousStart,
    previousExclusiveEnd,
  };
}

function computeChange(current: number, previous: number): AnalyticsChangeDto {
  if (current === 0 && previous === 0) {
    return { percent: 0, direction: 'flat' };
  }

  const delta = ((current - previous) / Math.max(previous, 1)) * 100;
  const rounded = Math.round(delta * 10) / 10;

  if (Math.abs(rounded) < 0.5) {
    return { percent: 0, direction: 'flat' satisfies AnalyticsChangeDirection };
  }

  return {
    percent: Math.abs(rounded),
    direction: rounded > 0 ? 'up' : 'down',
  };
}

function toCount(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SitePageViews)
    private readonly repository: Repository<SitePageViews>,
  ) {}

  async getSummary(period: AnalyticsPeriod = '30d'): Promise<AnalyticsSummaryDto> {
    const bounds = resolvePeriodBounds(period);
    const [current, previous] = await Promise.all([
      this.countMetrics(bounds.rangeStart, bounds.rangeExclusiveEnd),
      this.countMetrics(bounds.previousStart, bounds.previousExclusiveEnd),
    ]);

    return {
      period: bounds.period,
      dateFrom: bounds.dateFrom,
      dateTo: bounds.dateTo,
      visitors: current.visitors,
      pageViews: current.pageViews,
      visitorsChange: computeChange(current.visitors, previous.visitors),
      pageViewsChange: computeChange(current.pageViews, previous.pageViews),
    };
  }

  async getTrend(period: AnalyticsPeriod = '30d'): Promise<AnalyticsTrendDto> {
    const bounds = resolvePeriodBounds(period);
    const rows = await this.repository
      .createQueryBuilder('pv')
      .select('DATE(pv.created_at)', 'date')
      .addSelect('COUNT(*)', 'pageViews')
      .addSelect('COUNT(DISTINCT pv.visitor_id)', 'visitors')
      .where('pv.created_at >= :from AND pv.created_at < :to', {
        from: bounds.rangeStart,
        to: bounds.rangeExclusiveEnd,
      })
      .groupBy('DATE(pv.created_at)')
      .orderBy('DATE(pv.created_at)', 'ASC')
      .getRawMany<{ date: string | Date; pageViews: string; visitors: string }>();

    const byDate = new Map<string, AnalyticsTrendPointDto>();
    for (const row of rows) {
      const date =
        row.date instanceof Date
          ? formatDateOnly(row.date)
          : String(row.date).slice(0, 10);
      byDate.set(date, {
        date,
        visitors: toCount(row.visitors),
        pageViews: toCount(row.pageViews),
      });
    }

    const points = bounds.days.map(
      (date) => byDate.get(date) ?? { date, visitors: 0, pageViews: 0 },
    );

    return {
      period: bounds.period,
      dateFrom: bounds.dateFrom,
      dateTo: bounds.dateTo,
      points,
    };
  }

  async getTopPages(
    period: AnalyticsPeriod = '30d',
    limit = 10,
  ): Promise<AnalyticsTopPagesDto> {
    const bounds = resolvePeriodBounds(period);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const rows = await this.repository
      .createQueryBuilder('pv')
      .select('pv.path', 'path')
      .addSelect('COUNT(*)', 'pageViews')
      .addSelect('COUNT(DISTINCT pv.visitor_id)', 'visitors')
      .where('pv.created_at >= :from AND pv.created_at < :to', {
        from: bounds.rangeStart,
        to: bounds.rangeExclusiveEnd,
      })
      .groupBy('pv.path')
      .orderBy('COUNT(*)', 'DESC')
      .addOrderBy('pv.path', 'ASC')
      .limit(safeLimit)
      .getRawMany<{ path: string; pageViews: string; visitors: string }>();

    const items: AnalyticsTopPageDto[] = rows.map((row) => ({
      path: row.path,
      pageViews: toCount(row.pageViews),
      visitors: toCount(row.visitors),
    }));

    return {
      period: bounds.period,
      dateFrom: bounds.dateFrom,
      dateTo: bounds.dateTo,
      items,
    };
  }

  private async countMetrics(
    from: Date,
    to: Date,
  ): Promise<{ visitors: number; pageViews: number }> {
    const row = await this.repository
      .createQueryBuilder('pv')
      .select('COUNT(*)', 'pageViews')
      .addSelect('COUNT(DISTINCT pv.visitor_id)', 'visitors')
      .where('pv.created_at >= :from AND pv.created_at < :to', { from, to })
      .getRawOne<{ pageViews: string; visitors: string }>();

    return {
      visitors: toCount(row?.visitors),
      pageViews: toCount(row?.pageViews),
    };
  }
}
