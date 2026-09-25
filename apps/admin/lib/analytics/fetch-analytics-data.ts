import { ApiHttpError } from '@africatourismgate/api-client';
import type {
  AnalyticsPeriod,
  AnalyticsSummary,
  AnalyticsTopPages,
  AnalyticsTrend,
} from '@africatourismgate/types';
import { getApiClient } from '../auth/api';

export type AnalyticsPageData = {
  summary: AnalyticsSummary;
  trend: AnalyticsTrend;
  topPages: AnalyticsTopPages;
};

export type AnalyticsFetchErrorMessages = {
  network: string;
  forbiddenDetail: string;
  loadFailed: string;
};

function toErrorMessage(
  error: unknown,
  messages: AnalyticsFetchErrorMessages,
): string {
  if (error instanceof TypeError) {
    return messages.network;
  }
  if (error instanceof ApiHttpError) {
    if (error.status === 403) {
      return messages.forbiddenDetail;
    }
    if (error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
  }
  return messages.loadFailed;
}

export async function fetchAnalyticsPageData(
  period: AnalyticsPeriod,
  errorMessages: AnalyticsFetchErrorMessages,
): Promise<AnalyticsPageData> {
  const client = getApiClient();
  try {
    const [summary, trend, topPages] = await Promise.all([
      client.getAnalyticsSummary({ period }),
      client.getAnalyticsTrend({ period }),
      client.getAnalyticsTopPages({ period, limit: 10 }),
    ]);
    return { summary, trend, topPages };
  } catch (error) {
    throw new Error(toErrorMessage(error, errorMessages));
  }
}
