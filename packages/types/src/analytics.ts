export type AnalyticsPeriod = '7d' | '30d' | '90d';

export type AnalyticsChangeDirection = 'up' | 'down' | 'flat';

export type AnalyticsChange = {
  percent: number;
  direction: AnalyticsChangeDirection;
};

export type AnalyticsPeriodQuery = {
  period?: AnalyticsPeriod;
};

export type AnalyticsTopPagesQuery = AnalyticsPeriodQuery & {
  limit?: number;
};

export type AnalyticsSummary = {
  period: AnalyticsPeriod;
  dateFrom: string;
  dateTo: string;
  visitors: number;
  pageViews: number;
  visitorsChange: AnalyticsChange;
  pageViewsChange: AnalyticsChange;
};

export type AnalyticsTrendPoint = {
  date: string;
  visitors: number;
  pageViews: number;
};

export type AnalyticsTrend = {
  period: AnalyticsPeriod;
  dateFrom: string;
  dateTo: string;
  points: AnalyticsTrendPoint[];
};

export type AnalyticsTopPage = {
  path: string;
  pageViews: number;
  visitors: number;
};

export type AnalyticsTopPages = {
  period: AnalyticsPeriod;
  dateFrom: string;
  dateTo: string;
  items: AnalyticsTopPage[];
};

/** Body for `POST /public/analytics/page-views`. */
export type TrackPageViewRequest = {
  visitorId: string;
  path: string;
  locale?: string;
};
