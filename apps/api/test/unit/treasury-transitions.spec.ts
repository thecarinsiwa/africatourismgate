import {
  EXPENSE_REQUEST_ALLOWED_TRANSITIONS,
  isExpenseRequestTransitionAllowed,
  permissionForExpenseRequestTransition,
} from '../../src/modules/resources/expense-requests/expense-request-transitions';
import {
  FUND_EXIT_ALLOWED_TRANSITIONS,
  FUND_EXIT_TRANSITION_PERMISSION,
  isFundExitTransitionAllowed,
} from '../../src/modules/resources/fund-exits/fund-exit-transitions';
import type { ExpenseRequestStatus } from '../../src/entities/fund-exit.entity';
import type { FundExitStatus } from '../../src/entities/fund-exit.entity';

describe('expense-request-transitions', () => {
  const cases: Array<{
    from: ExpenseRequestStatus;
    to: ExpenseRequestStatus;
    allowed: boolean;
    permission?: string;
  }> = [
    { from: 'draft', to: 'submitted', allowed: true, permission: 'treasury.expense_requests.create' },
    { from: 'draft', to: 'cancelled', allowed: true, permission: 'treasury.expense_requests.create' },
    { from: 'draft', to: 'validated', allowed: false },
    { from: 'submitted', to: 'validated', allowed: true, permission: 'treasury.expense_requests.validate' },
    { from: 'submitted', to: 'rejected', allowed: true, permission: 'treasury.expense_requests.validate' },
    { from: 'submitted', to: 'cancelled', allowed: true, permission: 'treasury.expense_requests.create' },
    { from: 'submitted', to: 'authorized', allowed: false },
    { from: 'validated', to: 'authorized', allowed: true, permission: 'treasury.expense_requests.authorize' },
    { from: 'validated', to: 'rejected', allowed: true, permission: 'treasury.expense_requests.authorize' },
    { from: 'validated', to: 'submitted', allowed: false },
    { from: 'authorized', to: 'closed', allowed: true, permission: 'treasury.exits.write' },
    { from: 'authorized', to: 'rejected', allowed: false },
    { from: 'rejected', to: 'draft', allowed: false },
    { from: 'cancelled', to: 'submitted', allowed: false },
    { from: 'closed', to: 'authorized', allowed: false },
  ];

  it.each(cases)(
    '$from → $to allowed=$allowed',
    ({ from, to, allowed, permission }) => {
      expect(isExpenseRequestTransitionAllowed(from, to)).toBe(allowed);
      if (allowed && permission) {
        expect(permissionForExpenseRequestTransition(from, to)).toBe(permission);
      }
    },
  );

  it('covers every status key in the matrix', () => {
    const statuses: ExpenseRequestStatus[] = [
      'draft',
      'submitted',
      'validated',
      'authorized',
      'rejected',
      'cancelled',
      'closed',
    ];
    for (const status of statuses) {
      expect(EXPENSE_REQUEST_ALLOWED_TRANSITIONS[status]).toBeDefined();
    }
  });
});

describe('fund-exit-transitions', () => {
  const cases: Array<{
    from: FundExitStatus;
    to: FundExitStatus;
    allowed: boolean;
  }> = [
    { from: 'draft', to: 'disbursed', allowed: true },
    { from: 'draft', to: 'recorded', allowed: false },
    { from: 'draft', to: 'voided', allowed: false },
    { from: 'disbursed', to: 'recorded', allowed: true },
    { from: 'disbursed', to: 'draft', allowed: false },
    { from: 'recorded', to: 'disbursed', allowed: false },
    { from: 'voided', to: 'draft', allowed: false },
  ];

  it.each(cases)('$from → $to allowed=$allowed', ({ from, to, allowed }) => {
    expect(isFundExitTransitionAllowed(from, to)).toBe(allowed);
  });

  it('uses exits.write for all fund-exit transitions', () => {
    expect(FUND_EXIT_TRANSITION_PERMISSION).toBe('treasury.exits.write');
  });

  it('covers every status key in the matrix', () => {
    const statuses: FundExitStatus[] = [
      'draft',
      'disbursed',
      'recorded',
      'voided',
    ];
    for (const status of statuses) {
      expect(FUND_EXIT_ALLOWED_TRANSITIONS[status]).toBeDefined();
    }
  });
});
