'use client';

import { FilterBar, Select } from '@africatourismgate/ui';
import type {
  AccountingExercise,
  AccountingJournal,
  AccountingPeriod,
  ChartAccount,
  OrganizationListItem,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

export type AccountingBooksFilterValues = {
  organizationId: string;
  exerciseId: string;
  periodId: string;
  journalId: string;
  accountId: string;
};

export const EMPTY_ACCOUNTING_BOOKS_FILTERS: AccountingBooksFilterValues = {
  organizationId: '',
  exerciseId: '',
  periodId: '',
  journalId: '',
  accountId: '',
};

type AccountingBooksFiltersProps = {
  values: AccountingBooksFilterValues;
  onChange: (next: AccountingBooksFilterValues) => void;
  showJournal?: boolean;
  showAccount?: boolean;
  accountRequired?: boolean;
};

export function AccountingBooksFilters({
  values,
  onChange,
  showJournal = true,
  showAccount = false,
  accountRequired = false,
}: AccountingBooksFiltersProps) {
  const t = useTranslations('modules.treasury.accounting.booksFilters');
  const tCommon = useTranslations('modules.common');

  const [organizations, setOrganizations] = useState<OrganizationListItem[]>(
    [],
  );
  const [exercises, setExercises] = useState<AccountingExercise[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [journals, setJournals] = useState<AccountingJournal[]>([]);
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);

  const update = useCallback(
    (patch: Partial<AccountingBooksFilterValues>) => {
      onChange({ ...values, ...patch });
    },
    [onChange, values],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        if (!values.organizationId && me.user.organizationId) {
          onChange({
            ...values,
            organizationId: me.user.organizationId,
          });
        }
      })
      .catch(() => undefined);

    void getApiClient()
      .listOrganizations({ page: 1, limit: 100 })
      .then((res) => {
        if (!cancelled) setOrganizations(res.data);
      })
      .catch(() => {
        if (!cancelled) setOrganizations([]);
      });

    return () => {
      cancelled = true;
    };
    // Bootstrap org once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!values.organizationId) {
      setExercises([]);
      setJournals([]);
      setAccounts([]);
      return;
    }

    void Promise.all([
      getApiClient().listAccountingExercises({
        organizationId: values.organizationId,
        page: 1,
        limit: 100,
      }),
      getApiClient().listAccountingJournals({
        organizationId: values.organizationId,
        isActive: true,
        page: 1,
        limit: 100,
      }),
      getApiClient().listChartOfAccounts({
        organizationId: values.organizationId,
        isActive: true,
        isPostable: true,
        page: 1,
        limit: 200,
      }),
    ])
      .then(([exRes, jRes, aRes]) => {
        if (cancelled) return;
        setExercises(exRes.data);
        setJournals(jRes.data);
        setAccounts(aRes.data);
      })
      .catch(() => {
        if (cancelled) return;
        setExercises([]);
        setJournals([]);
        setAccounts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [values.organizationId]);

  useEffect(() => {
    let cancelled = false;
    if (!values.exerciseId) {
      setPeriods([]);
      return;
    }

    void getApiClient()
      .listAccountingPeriods({
        exerciseId: values.exerciseId,
        page: 1,
        limit: 100,
      })
      .then((res) => {
        if (!cancelled) setPeriods(res.data);
      })
      .catch(() => {
        if (!cancelled) setPeriods([]);
      });

    return () => {
      cancelled = true;
    };
  }, [values.exerciseId]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (values.organizationId) n += 1;
    if (values.exerciseId) n += 1;
    if (values.periodId) n += 1;
    if (showJournal && values.journalId) n += 1;
    if (showAccount && values.accountId) n += 1;
    return n;
  }, [values, showJournal, showAccount]);

  const handleClear = () => {
    onChange({ ...EMPTY_ACCOUNTING_BOOKS_FILTERS });
  };

  return (
    <FilterBar
      mobileVariant="drawer"
      activeCount={activeCount}
      onClear={handleClear}
      clearLabel={tCommon('filters.clearAll')}
      applyLabel={tCommon('filters.apply')}
      toggleLabel={tCommon('filters.toggle')}
      filters={
        <>
          <div className="w-full sm:w-56">
            <Select
              label={t('organization')}
              value={values.organizationId}
              onChange={(e) =>
                update({
                  organizationId: e.target.value,
                  exerciseId: '',
                  periodId: '',
                  journalId: '',
                  accountId: '',
                })
              }
              options={[
                { value: '', label: tCommon('filters.all') },
                ...organizations.map((org) => ({
                  value: org.id,
                  label: org.name,
                })),
              ]}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              label={t('exercise')}
              value={values.exerciseId}
              onChange={(e) =>
                update({
                  exerciseId: e.target.value,
                  periodId: '',
                })
              }
              disabled={!values.organizationId}
              options={[
                { value: '', label: tCommon('filters.all') },
                ...exercises.map((ex) => ({
                  value: ex.id,
                  label: `${ex.code} — ${ex.label}`,
                })),
              ]}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              label={t('period')}
              value={values.periodId}
              onChange={(e) => update({ periodId: e.target.value })}
              disabled={!values.exerciseId}
              options={[
                { value: '', label: tCommon('filters.all') },
                ...periods.map((p) => ({
                  value: p.id,
                  label: `${p.code} (${p.startsOn} → ${p.endsOn})`,
                })),
              ]}
            />
          </div>
          {showJournal ? (
            <div className="w-full sm:w-56">
              <Select
                label={t('journal')}
                value={values.journalId}
                onChange={(e) => update({ journalId: e.target.value })}
                disabled={!values.organizationId}
                options={[
                  { value: '', label: tCommon('filters.all') },
                  ...journals.map((j) => ({
                    value: j.id,
                    label: `${j.code} — ${j.label}`,
                  })),
                ]}
              />
            </div>
          ) : null}
          {showAccount ? (
            <div className="w-full sm:w-64">
              <Select
                label={
                  accountRequired ? `${t('account')} *` : t('account')
                }
                value={values.accountId}
                onChange={(e) => update({ accountId: e.target.value })}
                disabled={!values.organizationId}
                options={[
                  {
                    value: '',
                    label: accountRequired
                      ? t('accountPlaceholder')
                      : tCommon('filters.all'),
                  },
                  ...accounts.map((a) => ({
                    value: a.id,
                    label: `${a.code} — ${a.label}`,
                  })),
                ]}
              />
            </div>
          ) : null}
        </>
      }
    />
  );
}
