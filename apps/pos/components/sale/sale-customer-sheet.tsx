'use client';

import type { User } from '@africatourismgate/types';
import { Button, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { getValidApiClient } from '../../lib/auth/api';
import type { SaleCartCustomer } from '../../lib/sale/types';

const { customer: labels } = posSalePageConfig;

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 2;
const SEARCH_LIMIT = 15;

type SaleCustomerSheetProps = {
  open: boolean;
  selectedCustomerId: string | null;
  onClose: () => void;
  onSelect: (customer: SaleCartCustomer | null) => void;
};

function toCartCustomer(user: User): SaleCartCustomer {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

function formatUserName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function SaleCustomerSheet({
  open,
  selectedCustomerId,
  onClose,
  onSelect,
}: SaleCustomerSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setError(null);
    setLoading(false);
    setSearched(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < SEARCH_MIN_CHARS) {
      setResults([]);
      setError(null);
      setLoading(false);
      setSearched(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      void getValidApiClient()
        .then((client) =>
          client.listUsers({
            search: trimmed,
            audience: 'client',
            status: 'active',
            page: 1,
            limit: SEARCH_LIMIT,
          }),
        )
        .then((response) => {
          if (cancelled) return;
          setResults(response.data);
          setSearched(true);
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
          setSearched(true);
          setError(labels.errorLabel);
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  if (!open) {
    return null;
  }

  function handleWalkIn() {
    onSelect(null);
    onClose();
  }

  function handleSelectUser(user: User) {
    onSelect(toCartCustomer(user));
    onClose();
  }

  const showHint = query.trim().length > 0 && query.trim().length < SEARCH_MIN_CHARS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-customer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex max-h-[calc(100dvh-8px)] w-full max-w-lg flex-col rounded-t-2xl border border-atg-border bg-atg-elevated shadow-xl sm:max-h-[92vh] sm:rounded-2xl"
        aria-busy={loading}
      >
        <div className="border-b border-atg-border px-4 py-4 sm:px-5">
          <h2 id="sale-customer-title" className="text-xl font-bold text-atg-fg">
            {labels.sheetTitle}
          </h2>
          <p className="mt-1 text-base text-atg-muted">{labels.sheetSubtitle}</p>
        </div>

        <div className="pos-touch flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <Button
            type="button"
            variant={selectedCustomerId === null ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            className="!h-auto min-h-[3.5rem] flex-col items-start py-3 text-left"
            onClick={handleWalkIn}
          >
            <span className="font-semibold">{labels.selectWalkInLabel}</span>
            <span className="text-sm font-normal opacity-90">{labels.walkInHint}</span>
          </Button>

          <div className="mt-5">
            <Input
              id="sale-customer-search"
              label={labels.searchLabel}
              placeholder={labels.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoFocus
            />
            {showHint ? (
              <p className="mt-2 text-sm text-atg-muted">{labels.searchHint}</p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-base text-red-600">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-6 text-center text-atg-muted">{labels.loadingLabel}</p>
          ) : null}

          {!loading && searched && results.length === 0 && !error ? (
            <div className="mt-6 text-center">
              <p className="font-medium text-atg-fg">{labels.emptyLabel}</p>
              <p className="mt-1 text-sm text-atg-muted">{labels.emptyHint}</p>
            </div>
          ) : null}

          {!loading && results.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {results.map((user) => {
                const selected = selectedCustomerId === user.id;
                return (
                  <li key={user.id}>
                    <Button
                      type="button"
                      variant={selected ? 'primary' : 'secondary'}
                      size="lg"
                      fullWidth
                      className="!h-auto min-h-[3.25rem] flex-col items-start py-3 text-left"
                      onClick={() => handleSelectUser(user)}
                    >
                      <span className="font-semibold">{formatUserName(user)}</span>
                      <span className="text-sm font-normal opacity-90">{user.email}</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="border-t border-atg-border px-4 py-4 sm:px-5">
          <Button type="button" variant="outline" size="lg" fullWidth onClick={onClose}>
            {labels.closeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
