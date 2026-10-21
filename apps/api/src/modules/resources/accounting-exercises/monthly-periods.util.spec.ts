import { buildMonthlyPeriods } from './monthly-periods.util';

describe('buildMonthlyPeriods', () => {
  it('builds 12 full months for a calendar year', () => {
    const periods = buildMonthlyPeriods('2026-01-01', '2026-12-31');
    expect(periods).toHaveLength(12);
    expect(periods[0]).toEqual({
      code: '2026-01',
      startsOn: '2026-01-01',
      endsOn: '2026-01-31',
      sequenceNo: 1,
    });
    expect(periods[11]).toEqual({
      code: '2026-12',
      startsOn: '2026-12-01',
      endsOn: '2026-12-31',
      sequenceNo: 12,
    });
  });

  it('clips first and last periods to exercise bounds', () => {
    const periods = buildMonthlyPeriods('2026-03-15', '2026-05-10');
    expect(periods).toEqual([
      {
        code: '2026-03',
        startsOn: '2026-03-15',
        endsOn: '2026-03-31',
        sequenceNo: 1,
      },
      {
        code: '2026-04',
        startsOn: '2026-04-01',
        endsOn: '2026-04-30',
        sequenceNo: 2,
      },
      {
        code: '2026-05',
        startsOn: '2026-05-01',
        endsOn: '2026-05-10',
        sequenceNo: 3,
      },
    ]);
  });

  it('rejects inverted range', () => {
    expect(() => buildMonthlyPeriods('2026-12-01', '2026-01-01')).toThrow(
      /startsOn must be on or before endsOn/,
    );
  });
});
