'use client';

import { Button, Card, DataTable, DataTableBadge, type ColumnDef } from '@africatourismgate/ui';
import type {
  AccountingExercise,
  AccountingPeriod,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import {
  AccountingBooksFilters,
  EMPTY_ACCOUNTING_BOOKS_FILTERS,
  type AccountingBooksFilterValues,
} from './accounting-books-filters';

export function AccountingClosingPanel() {
  const t = useTranslations('modules.treasury.accounting.closing');
  const tColumns = useTranslations('modules.treasury.accounting.closing.columns');
  const tStatuses = useTranslations('modules.treasury.accounting.periodStatuses');
  const tExerciseStatuses = useTranslations(
    'modules.treasury.accounting.exerciseStatuses',
  );
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');

  const [filters, setFilters] = useState<AccountingBooksFilterValues>(
    EMPTY_ACCOUNTING_BOOKS_FILTERS,
  );
  const [canClose, setCanClose] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [exercise, setExercise] = useState<AccountingExercise | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; periods: AccountingPeriod[] }
  >({ status: 'loading' });

  const commonErrorMessages = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('loadFailed'),
      apiStatus: (code: number) => tCommonErrors('apiStatus', { status: code }),
      accessDenied: t('accessDenied'),
    }),
    [t, tCommonErrors, tErrors],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        setCanClose(
          me.isSuperAdmin || me.permissions.includes('accounting.close'),
        );
      })
      .catch(() => {
        if (!cancelled) setCanClose(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!filters.exerciseId) {
      setExercise(null);
      setState({ status: 'ready', periods: [] });
      return;
    }
    setState({ status: 'loading' });
    setMessage(null);
    try {
      const detail = await getApiClient().getAccountingExercise(
        filters.exerciseId,
      );
      setExercise(detail);
      setState({ status: 'ready', periods: detail.periods ?? [] });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(error, commonErrorMessages),
      });
    }
  }, [filters.exerciseId, commonErrorMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  const runLock = async (periodId: string, unlock: boolean) => {
    setBusyId(periodId);
    setMessage(null);
    try {
      if (unlock) {
        await getApiClient().unlockAccountingPeriod(periodId);
        setMessage(t('unlockSuccess'));
      } else {
        await getApiClient().lockAccountingPeriod(periodId);
        setMessage(t('lockSuccess'));
      }
      await load();
    } catch (error) {
      setMessage(resolveUnknownApiError(error, commonErrorMessages));
    } finally {
      setBusyId(null);
    }
  };

  const runClose = async () => {
    if (!exercise) return;
    if (!window.confirm(t('confirmClose'))) return;
    setBusyId(exercise.id);
    setMessage(null);
    try {
      const result = await getApiClient().closeAccountingExercise(exercise.id);
      setMessage(
        t('closeSuccess', {
          closingId: result.closingJournalEntryId ?? '—',
          openingId: result.openingJournalEntryId ?? '—',
        }),
      );
      await load();
    } catch (error) {
      setMessage(resolveUnknownApiError(error, commonErrorMessages));
    } finally {
      setBusyId(null);
    }
  };

  const columns = useMemo<ColumnDef<AccountingPeriod>[]>(
    () => [
      {
        id: 'code',
        header: tColumns('code'),
        cell: ({ row }) => row.original.code,
      },
      {
        id: 'range',
        header: tColumns('range'),
        cell: ({ row }) =>
          `${row.original.startsOn} → ${row.original.endsOn}`,
      },
      {
        id: 'status',
        header: tColumns('status'),
        cell: ({ row }) => (
          <DataTableBadge variant="default">
            {tStatuses(row.original.status)}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        cell: ({ row }) => {
          if (!canClose || exercise?.status === 'closed') return null;
          const period = row.original;
          if (period.status === 'closed') return null;
          const busy = busyId === period.id;
          if (period.status === 'locked') {
            return (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => void runLock(period.id, true)}
              >
                {t('unlock')}
              </Button>
            );
          }
          return (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void runLock(period.id, false)}
            >
              {t('lock')}
            </Button>
          );
        },
      },
    ],
    [busyId, canClose, exercise?.status, t, tColumns, tStatuses],
  );

  return (
    <div className="space-y-4">
      <AccountingBooksFilters
        values={filters}
        onChange={setFilters}
        showJournal={false}
        showAccount={false}
      />

      {!canClose ? (
        <p className="text-sm text-atg-muted" role="status">
          {t('accessDenied')}
        </p>
      ) : null}

      {message ? (
        <p className="text-sm text-atg-fg" role="status">
          {message}
        </p>
      ) : null}

      {exercise ? (
        <Card variant="dashboard" padding="sm" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-atg-fg">
                {exercise.code} — {exercise.label}
              </p>
              <p className="text-sm text-atg-muted">
                {exercise.startsOn} → {exercise.endsOn} ·{' '}
                <span className="font-medium tabular-nums text-atg-fg">
                  {exercise.currency}
                </span>{' '}
                · {tExerciseStatuses(exercise.status)}
              </p>
            </div>
            {canClose && exercise.status !== 'closed' ? (
              <Button
                type="button"
                variant="primary"
                disabled={busyId === exercise.id}
                onClick={() => void runClose()}
              >
                {t('closeExercise')}
              </Button>
            ) : null}
          </div>
          {exercise.status === 'closed' && exercise.closedAt ? (
            <p className="text-sm text-atg-muted">{t('alreadyClosed')}</p>
          ) : null}
        </Card>
      ) : (
        <p className="text-sm text-atg-muted">{t('selectExercise')}</p>
      )}

      {state.status === 'loading' ? (
        <p className="text-sm text-atg-muted">{t('loading')}</p>
      ) : null}
      {state.status === 'error' ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.status === 'ready' && filters.exerciseId ? (
        <Card variant="dashboard" padding="none" className="overflow-hidden">
          <DataTable
            columns={columns}
            data={state.periods}
            getRowId={(row) => row.id}
            emptyMessage={t('emptyPeriods')}
            aria-label={t('ariaLabel')}
          />
        </Card>
      ) : null}

      {state.status === 'ready' &&
      exercise?.status === 'closed' &&
      state.periods.length > 0 ? (
        <p className="text-sm text-atg-muted">
          <Link
            href="/tresorerie/comptabilite/bilan"
            className="text-primary hover:underline"
          >
            {t('viewBalanceSheet')}
          </Link>
          {' · '}
          <Link
            href="/tresorerie/comptabilite/compte-resultat"
            className="text-primary hover:underline"
          >
            {t('viewIncomeStatement')}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
