import { ApiProperty } from '@nestjs/swagger';
import type { AnalyticsPeriod } from './analytics-query.dto';

export type AnalyticsChangeDirection = 'up' | 'down' | 'flat';

export class AnalyticsChangeDto {
  @ApiProperty({ example: 12.5 })
  percent!: number;

  @ApiProperty({ enum: ['up', 'down', 'flat'] })
  direction!: AnalyticsChangeDirection;
}

export class AnalyticsSummaryDto {
  @ApiProperty({ enum: ['7d', '30d', '90d'] })
  period!: AnalyticsPeriod;

  @ApiProperty({ example: '2026-08-27' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-09-25' })
  dateTo!: string;

  @ApiProperty({ example: 420 })
  visitors!: number;

  @ApiProperty({ example: 1850 })
  pageViews!: number;

  @ApiProperty({ type: AnalyticsChangeDto })
  visitorsChange!: AnalyticsChangeDto;

  @ApiProperty({ type: AnalyticsChangeDto })
  pageViewsChange!: AnalyticsChangeDto;
}

export class AnalyticsTrendPointDto {
  @ApiProperty({ example: '2026-09-25' })
  date!: string;

  @ApiProperty({ example: 42 })
  visitors!: number;

  @ApiProperty({ example: 180 })
  pageViews!: number;
}

export class AnalyticsTrendDto {
  @ApiProperty({ enum: ['7d', '30d', '90d'] })
  period!: AnalyticsPeriod;

  @ApiProperty({ example: '2026-08-27' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-09-25' })
  dateTo!: string;

  @ApiProperty({ type: [AnalyticsTrendPointDto] })
  points!: AnalyticsTrendPointDto[];
}

export class AnalyticsTopPageDto {
  @ApiProperty({ example: '/destinations/kinshasa' })
  path!: string;

  @ApiProperty({ example: 320 })
  pageViews!: number;

  @ApiProperty({ example: 95 })
  visitors!: number;
}

export class AnalyticsTopPagesDto {
  @ApiProperty({ enum: ['7d', '30d', '90d'] })
  period!: AnalyticsPeriod;

  @ApiProperty({ example: '2026-08-27' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-09-25' })
  dateTo!: string;

  @ApiProperty({ type: [AnalyticsTopPageDto] })
  items!: AnalyticsTopPageDto[];
}
