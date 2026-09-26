'use client';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
} from '@africatourismgate/ui';
import type { FundEntry } from '@africatourismgate/types';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useFormatDateTime,
  useFundEntrySourceLabels,
  useFundEntryStatusLabels,
  useTreasuryPaymentMethodLabels,
} from '../../lib/i18n/use-module-labels';
import { AdminPageBackLink } from '../admin-page-back-link';
import { PermissionGate } from '../permission-gate';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { FundEntryAttachmentsSection } from './fund-entry-attachments-section';
import { TreasuryVoidDialog } from './treasury-void-dialog';

type FundEntryViewPageProps = {
  fundEntryId: string;
};

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function toIsoString(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
}

export function FundEntryViewPage({ fundEntryId }: FundEntryViewPageProps) {
  const t = useTranslations('modules.treasury.entries.detail');
  const tFields = useTranslations('modules.treasury.entries.form.fields');
  const tList = useTranslations('modules.treasury.entries.list.columns');
  const tPages = useTranslations('pages.tresorerie.entrees.id.voir');
  const tCommon = useTranslations('modules.common');
  const tDates = useTranslations('modules.common.dates');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const sourceLabels = useFundEntrySourceLabels();
  const paymentMethodLabels = useTreasuryPaymentMethodLabels();
  const statusLabels = useFundEntryStatusLabels();
  const formatDateTime = useFormatDateTime('short');
  const locale = useLocale();
  const emptyDash = tCommon('empty.dash');

  const [entry, setEntry] = useState<FundEntry | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && entry != null,
    title: t('title'),
    entityLabel:
      entry?.reference?.trim() ||
      (entry ? entry.id.slice(0, 8) : undefined),
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getFundEntry(fundEntryId);
      setEntry(data);
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
            apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
          },
          { useParseApiMessage: true, notFound: tErrors('notFound') },
        ),
      });
    }
  }, [fundEntryId, tCommonErrors, tErrors]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = useCallback(
    (value: string) => {
      try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
          new Date(`${value.slice(0, 10)}T12:00:00`),
        );
      } catch {
        return value;
      }
    },
    [locale],
  );

  const backLabel = tPages('backLabel');
  const editHref = `/tresorerie/entrees/${fundEntryId}`;

  if (state.status === 'loading') {
    return (
      <div className="min-w-0 space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (state.status === 'error' || !entry) {
    return (
      <div className="min-w-0 space-y-4">
        <AdminPageBackLink href="/tresorerie/entrees" label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : tErrors('notFound')}
        </p>
      </div>
    );
  }

  const isVoided = entry.status === 'voided';
  const voidedAt = toIsoString(entry.voidedAt);
  const updatedAt = toIsoString(entry.updatedAt);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/tresorerie/entrees" label={backLabel} />
        <div className="flex flex-wrap gap-2">
          <PermissionGate permission="treasury.entries.write">
            {!isVoided ? (
              <Button href={editHref} variant="primary" className="w-full sm:w-auto">
                {t('editButton')}
              </Button>
            ) : null}
          </PermissionGate>
          <PermissionGate permission="treasury.void">
            {!isVoided ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setVoidOpen(true)}
              >
                {t('voidButton')}
              </Button>
            ) : null}
          </PermissionGate>
        </div>
      </div>

      <TreasuryVoidDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        kind="fund_entry"
        entityId={entry.id}
        onVoided={load}
      />

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-atg-fg sm:text-2xl">
            {t('title')}
          </h1>
          <DataTableBadge variant={isVoided ? 'danger' : 'success'}>
            {statusLabels[entry.status] ?? entry.status}
          </DataTableBadge>
        </div>
        <p className="font-mono text-xs text-atg-muted">{entry.id}</p>
      </div>

      <Card variant="dashboard" padding="md">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label={tList('amount')}
            value={
              <span className="tabular-nums">
                {formatMoney(entry.amountCents, entry.currency)}
              </span>
            }
          />
          <ProfileField label={tFields('currency')} value={entry.currency} />
          <ProfileField
            label={tFields('operationDate')}
            value={formatDate(entry.operationDate)}
          />
          <ProfileField
            label={tFields('source')}
            value={sourceLabels[entry.source] ?? entry.source}
          />
          <ProfileField
            label={tFields('paymentMethod')}
            value={
              paymentMethodLabels[entry.paymentMethod] ?? entry.paymentMethod
            }
          />
          <ProfileField
            label={tFields('reference')}
            value={entry.reference?.trim() || emptyDash}
          />
          <ProfileField
            label={tFields('notes')}
            value={entry.notes?.trim() || emptyDash}
          />
          <ProfileField
            label={t('createdBy')}
            value={
              entry.createdByUserId ? (
                <code className="font-mono text-xs">{entry.createdByUserId}</code>
              ) : (
                emptyDash
              )
            }
          />
          <ProfileField
            label={tDates('createdAt')}
            value={formatDateTime(entry.createdAt)}
          />
          <ProfileField
            label={tDates('updatedAt')}
            value={updatedAt ? formatDateTime(updatedAt) : emptyDash}
          />
          {isVoided ? (
            <>
              <ProfileField
                label={t('voidedAt')}
                value={voidedAt ? formatDateTime(voidedAt) : emptyDash}
              />
              <ProfileField
                label={t('voidedBy')}
                value={
                  entry.voidedByUserId ? (
                    <code className="font-mono text-xs">
                      {entry.voidedByUserId}
                    </code>
                  ) : (
                    emptyDash
                  )
                }
              />
              <ProfileField
                label={t('voidReason')}
                value={entry.voidReason?.trim() || emptyDash}
              />
            </>
          ) : null}
        </dl>
        {!isVoided ? (
          <PermissionGate permission="treasury.void">
            <p className="mt-4 text-xs text-atg-muted">{t('voidUnavailable')}</p>
          </PermissionGate>
        ) : null}
      </Card>

      <Card variant="dashboard" padding="md">
        <h2 className="mb-3 text-sm font-semibold text-atg-fg">{t('bookings')}</h2>
        {(entry.bookingIds?.length ?? 0) === 0 ? (
          <p className="text-sm text-atg-muted">{t('bookingsEmpty')}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {entry.bookingIds.map((bookingId) => (
              <li key={bookingId}>
                <Link
                  href={`/reservations/${bookingId}`}
                  className="inline-flex rounded-md border border-atg-border bg-atg-elevated px-3 py-1.5 font-mono text-xs text-primary hover:underline"
                >
                  {bookingId.slice(0, 8)}…
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-atg-fg">
          {t('attachments')}
        </h2>
        <FundEntryAttachmentsSection
          fundEntryId={fundEntryId}
          initialAttachments={entry.attachments ?? []}
          canWrite={false}
        />
      </div>

      <Card variant="dashboard" padding="md">
        <h2 className="mb-2 text-sm font-semibold text-atg-fg">{t('audit')}</h2>
        <p className="text-sm text-atg-muted">{t('auditEmpty')}</p>
      </Card>
    </div>
  );
}
