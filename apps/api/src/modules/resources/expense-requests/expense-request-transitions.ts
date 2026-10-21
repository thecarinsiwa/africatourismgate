import type { ExpenseRequestStatus } from '../../../entities/fund-exit.entity';

/** Legal edges: fromStatus → Set of toStatus (domain §6) */
export const EXPENSE_REQUEST_ALLOWED_TRANSITIONS: Record<
  ExpenseRequestStatus,
  ReadonlySet<ExpenseRequestStatus>
> = {
  draft: new Set(['submitted', 'cancelled']),
  submitted: new Set(['validated', 'rejected', 'cancelled']),
  validated: new Set(['authorized', 'rejected']),
  authorized: new Set(['closed']),
  rejected: new Set(),
  cancelled: new Set(),
  closed: new Set(),
};

export function isExpenseRequestTransitionAllowed(
  from: ExpenseRequestStatus,
  to: ExpenseRequestStatus,
): boolean {
  return EXPENSE_REQUEST_ALLOWED_TRANSITIONS[from]?.has(to) ?? false;
}

export function permissionForExpenseRequestTransition(
  from: ExpenseRequestStatus,
  to: ExpenseRequestStatus,
): string {
  if (to === 'submitted' || to === 'cancelled') {
    return 'treasury.expense_requests.create';
  }
  if (to === 'validated') {
    return 'treasury.expense_requests.validate';
  }
  if (to === 'rejected') {
    return from === 'submitted'
      ? 'treasury.expense_requests.validate'
      : 'treasury.expense_requests.authorize';
  }
  if (to === 'authorized') {
    return 'treasury.expense_requests.authorize';
  }
  if (to === 'closed') {
    return 'treasury.exits.write';
  }
  throw new Error(`Unsupported transition ${from} → ${to}`);
}
