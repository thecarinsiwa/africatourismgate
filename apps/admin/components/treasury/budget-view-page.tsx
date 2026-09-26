'use client';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type { Budget, BudgetScopeType } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useBudgetPeriodLabels,
  useBudgetProductTypeLabels,
  useBudgetScopeLabels,
} from '../../lib/i18n/use-module-labels';
import { AdminPageBackLink } from '../admin-page-back-link';
import { PermissionGate } from '../permission-gate';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';

const SCOPE_BADGE: Record<BudgetScopeType, DataTableBadgeVariant> = {
  general: 'muted',
  activity: 'default',
  product: 'success',
};

type BudgetViewPageProps = {
  budgetId: string;
};

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">
        {value}
      </dd>
    </div>
  );
}

export function BudgetViewPage({ budgetId }: BudgetViewPageProps) {
  const t = useTranslations('modules.treasury.budgets.detail');
  const tFields = useTranslations('modules.treasury.budgets.form.fields');
  const tPages = useTranslations('pages.tresorerie.budgets.id.voir');
  const tCommon = useTranslations('modules.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const periodLabels = useBudgetPeriodLabels();
  const scopeLabels = useBudgetScopeLabels();
  const productTypeLabels = useBudgetProductTypeLabels();
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [budget, setBudget] = useState<Budget | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && budget != null,
    title: t('title'),
    entityLabel:
      budget?.label?.trim() || (budget ? budget.id.slice(0, 8) : undefined),
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getBudget(budgetId);
      setBudget(data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(
          error,
          {
            network: tCommonErrors('network'),
            forbidden: tErrors('forbidden'),
            generic: tErrors('loadFailed'),
            apiStatus: (status: number) =>
              tCommonErrors('apiStatus', { status }),
          },
          { useParseApiMessage: true, notFound: tErrors('notFound') },
        ),
      });
    }
  }, [budgetId, tCommonErrors, tErrors]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatPeriod = useCallback(
    (item: Budget) => {
      const period = periodLabels[item.periodType] ?? item.periodType;
      if (item.periodType === 'monthly' && item.month != null) {
        try {
          const monthLabel = new Intl.DateTimeFormat(locale, {
            month: 'long',
          }).format(new Date(2000, item.month - 1, 1));
          return `${period} — ${monthLabel} ${item.year}`;
        } catch {
          return `${period} — ${item.month}/${item.year}`;
        }
      }
      return `${period} — ${item.year}`;
    },
    [locale, periodLabels],
  );

  const backLabel = tPages('backLabel');
  const editHref = `/tresorerie/budgets/${budgetId}`;

  if (state.status === 'loading') {
    return (
      <div className="min-w-0 space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (state.status === 'error' || !budget) {
    return (
      <div className="min-w-0 space-y-4">
        <AdminPageBackLink href="/tresorerie/budgets" label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tErrors('notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageBackLink href="/tresorerie/budgets" label={backLabel} />
        <PermissionGate permission="treasury.budgets.write">
          <Button href={editHref} variant="primary" className="w-full sm:w-auto">
            {t('editButton')}
          </Button>
        </PermissionGate>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-atg-fg sm:text-2xl">
          {budget.label}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DataTableBadge variant={SCOPE_BADGE[budget.scopeType] ?? 'muted'}>
            {scopeLabels[budget.scopeType] ?? budget.scopeType}
          </DataTableBadge>
          <span className="text-sm text-atg-muted">
            {formatPeriod(budget)}
          </span>
        </div>
      </div>

      <Card variant="dashboard" className="p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label={tFields('amountCents')}
            value={formatMoney(budget.amountCents, budget.currency)}
          />
          <ProfileField label={tFields('currency')} value={budget.currency} />
          <ProfileField label={t('period')} value={formatPeriod(budget)} />
          <ProfileField
            label={t('scope')}
            value={scopeLabels[budget.scopeType] ?? budget.scopeType}
          />
          {budget.scopeType === 'activity' ? (
            <ProfileField
              label={t('activity')}
              value={
                budget.activityId ? (
                  <code className="font-mono text-xs">{budget.activityId}</code>
                ) : (
                  emptyDash
                )
              }
            />
          ) : null}
          {budget.scopeType === 'product' ? (
            <>
              <ProfileField
                label={tFields('productType')}
                value={
                  budget.productType
                    ? (productTypeLabels[budget.productType] ??
                      budget.productType)
                    : emptyDash
                }
              />
              <ProfileField
                label={t('product')}
                value={
                  budget.productId ? (
                    <code className="font-mono text-xs">{budget.productId}</code>
                  ) : (
                    emptyDash
                  )
                }
              />
            </>
          ) : null}
          {budget.notes ? (
            <ProfileField label={tFields('notes')} value={budget.notes} />
          ) : null}
          <ProfileField
            label={t('id')}
            value={<code className="font-mono text-xs">{budget.id}</code>}
          />
        </dl>
      </Card>
    </div>
  );
}
