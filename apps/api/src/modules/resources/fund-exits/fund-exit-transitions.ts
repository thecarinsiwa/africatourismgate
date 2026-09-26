import type { FundExitStatus } from '../../../entities/fund-exit.entity';

/** Legal edges for fund exit lifecycle (domain §5.4 / §6). Void = TRESO-033. */
export const FUND_EXIT_ALLOWED_TRANSITIONS: Record<
  FundExitStatus,
  ReadonlySet<FundExitStatus>
> = {
  draft: new Set(['disbursed']),
  disbursed: new Set(['recorded']),
  recorded: new Set(),
  voided: new Set(),
};

export function isFundExitTransitionAllowed(
  from: FundExitStatus,
  to: FundExitStatus,
): boolean {
  return FUND_EXIT_ALLOWED_TRANSITIONS[from]?.has(to) ?? false;
}

/** Permission required for fund-exit status transitions */
export const FUND_EXIT_TRANSITION_PERMISSION = 'treasury.exits.write';
