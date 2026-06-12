import type { ActivityDetailQuery, ActivitySearchQuery } from './types';

export type ActivitiesSearchParams = {
  destination?: string;
  date?: string;
  participants?: string;
};

export type ActivityDetailSearchParams = ActivitiesSearchParams & {
  scheduleId?: string;
};

export function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

/** Maps canonical and legacy home-search query params to activity search params. */
export function normalizeActivitiesSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ActivitiesSearchParams {
  const date =
    readSearchParam(raw.date) ??
    readSearchParam(raw.checkIn) ??
    readSearchParam(raw.departDate);
  const participants =
    readSearchParam(raw.participants) ??
    readSearchParam(raw.guests) ??
    readSearchParam(raw.adults);
  const destination =
    readSearchParam(raw.destination) ??
    readSearchParam(raw.from) ??
    readSearchParam(raw.to);

  return {
    destination: destination?.trim() || undefined,
    date,
    participants,
  };
}

export function parseParticipantsParam(participants?: string): number {
  const n = Number.parseInt(participants ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function hasRequiredActivitySearchParams(params: ActivitiesSearchParams): boolean {
  return Boolean(params.destination?.trim() && params.date);
}

export function formatActivityPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function formatScheduleTime(startDatetime: string, locale?: string): string {
  const date = new Date(startDatetime);
  if (Number.isNaN(date.getTime())) return startDatetime;
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDurationMinutes(
  minutes: number | null | undefined,
  labels: { hourSingular: string; hourPlural: string; minuteSingular: string; minutePlural: string },
): string | null {
  if (minutes == null || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(hours === 1 ? labels.hourSingular : labels.hourPlural.replace('{n}', String(hours)));
  }
  if (mins > 0) {
    parts.push(mins === 1 ? labels.minuteSingular : labels.minutePlural.replace('{n}', String(mins)));
  }

  return parts.join(' ') || null;
}

export function buildActivitiesSearchQuery(params: ActivitiesSearchParams): string {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  if (params.date) qs.set('date', params.date);
  if (params.participants) qs.set('participants', params.participants);
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export function buildActivityDetailHref(
  activityId: string,
  params: ActivityDetailSearchParams,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  if (params.date) qs.set('date', params.date);
  if (params.participants) qs.set('participants', params.participants);
  if (params.scheduleId) qs.set('scheduleId', params.scheduleId);
  const query = qs.toString();
  const base = `/activities/${encodeURIComponent(activityId)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

export function toActivitySearchQuery(params: ActivitiesSearchParams): ActivitySearchQuery {
  const destination = params.destination?.trim();
  if (!destination || !params.date) {
    throw new Error('Activity search requires destination and date');
  }

  return {
    destination,
    date: params.date,
    participants: parseParticipantsParam(params.participants),
    limit: 50,
  };
}

export function toActivityDetailQuery(params: ActivityDetailSearchParams): ActivityDetailQuery {
  if (!params.date) {
    throw new Error('Activity detail requires date');
  }

  return {
    date: params.date,
    participants: parseParticipantsParam(params.participants),
  };
}
