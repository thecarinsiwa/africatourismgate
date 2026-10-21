export type MonthlyPeriodSpec = {
  code: string;
  startsOn: string;
  endsOn: string;
  sequenceNo: number;
};

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateOnly(value: Date): string {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, '0');
  const d = String(value.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Build monthly periods covering [startsOn, endsOn] (inclusive).
 * First/last periods are clipped to the exercise bounds.
 */
export function buildMonthlyPeriods(
  startsOn: string,
  endsOn: string,
): MonthlyPeriodSpec[] {
  const start = parseDateOnly(startsOn);
  const end = parseDateOnly(endsOn);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date');
  }
  if (start.getTime() > end.getTime()) {
    throw new Error('startsOn must be on or before endsOn');
  }

  const periods: MonthlyPeriodSpec[] = [];
  let sequenceNo = 1;
  let cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
  );

  while (cursor.getTime() <= end.getTime()) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth();
    const monthStart = new Date(Date.UTC(y, m, 1));
    const monthEnd = new Date(Date.UTC(y, m + 1, 0));

    const periodStart =
      monthStart.getTime() > start.getTime() ? monthStart : start;
    const periodEnd = monthEnd.getTime() < end.getTime() ? monthEnd : end;

    if (periodStart.getTime() <= periodEnd.getTime()) {
      periods.push({
        code: `${y}-${String(m + 1).padStart(2, '0')}`,
        startsOn: formatDateOnly(periodStart),
        endsOn: formatDateOnly(periodEnd),
        sequenceNo,
      });
      sequenceNo += 1;
    }

    cursor = new Date(Date.UTC(y, m + 1, 1));
  }

  return periods;
}
