'use client';

import { useEffect, useState } from 'react';

export type LoyaltyTransactionRow = {
  id: string;
  createdAt: string;
  type: string;
  delta: number;
  balanceAfter: number;
};

type LoyaltyTransactionsState = {
  apiAvailable: boolean;
  loading: boolean;
  transactions: LoyaltyTransactionRow[];
  error: string | null;
};

const idleState: LoyaltyTransactionsState = {
  apiAvailable: false,
  loading: false,
  transactions: [],
  error: null,
};

/**
 * Loads loyalty transaction history for an account.
 * TODO: wire to getApiClient().listLoyaltyTransactions when the API endpoint exists.
 */
export function useLoyaltyTransactions(
  accountId: string | null,
  enabled: boolean,
): LoyaltyTransactionsState {
  const [state, setState] = useState<LoyaltyTransactionsState>(idleState);

  useEffect(() => {
    if (!enabled || !accountId) {
      setState(idleState);
      return;
    }

    let cancelled = false;

    async function load() {
      setState({ ...idleState, loading: true });

      // Placeholder until listLoyaltyTransactions is available on the API client.
      if (cancelled) return;

      setState({
        apiAvailable: false,
        loading: false,
        transactions: [],
        error: null,
      });
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [accountId, enabled]);

  return state;
}
