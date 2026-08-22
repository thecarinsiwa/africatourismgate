'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  cn,
} from '@africatourismgate/ui';
import type { PromoCode } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import {
  useFormatDateTime,
  usePromoDiscountLabels,
  usePromoDiscountTypeLabels,
  usePromoUsageLabels,
  usePromoValidityLabels,
} from '../../lib/i18n/use-module-labels';
import { useHydrated } from '../../lib/i18n/use-hydrated';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import {
  formatPromoDiscountLabel,
  formatPromoUsageLabel,
  formatPromoValidityRange,
  getPromoDiscountTypeLabel,
  getPromoValidityBadgeVariant,
  getPromoValidityLabel,
  getPromoValidityState,
} from '../../lib/promo-validity';

type PromoCodeViewPageProps = {
  promoCodeId: string;
};

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function HighlightTile({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-atg-border/80 bg-atg-elevated/80 px-4 py-3.5 shadow-sm',
        'transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-atg-muted">{label}</p>
      <div className="mt-1.5 text-base font-semibold tabular-nums text-atg-fg">{value}</div>
      {hint ? <div className="mt-2">{hint}</div> : null}
    </div>
  );
}

export function PromoCodeViewPage({ promoCodeId }: PromoCodeViewPageProps) {
  const { promoCodes: getPromoCodesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promoCodes.view');
  const tForm = useTranslations('modules.promoCodes.form');
  const tStatus = useTranslations('modules.promoCodes.status');
  const tList = useTranslations('modules.promoCodes.list');
  const tPages = useTranslations('pages.paiements.codes-promo.id');
  const tCommon = useTranslations('modules.common');
  const tDates = useTranslations('modules.common.dates');
  const discountLabels = usePromoDiscountLabels();
  const discountTypeLabels = usePromoDiscountTypeLabels();
  const validityLabels = usePromoValidityLabels();
  const tUsage = usePromoUsageLabels();
  const formatDateTime = useFormatDateTime('short');
  const hydrated = useHydrated();
  const emptyDash = tCommon('empty.dash');

  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && promoCode != null,
    title: t('title'),
    entityLabel: promoCode?.code,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const me = await getApiClient().getAuthMe();
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('promo_codes.write'));
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await getApiClient().getPromoCode(promoCodeId);
      setPromoCode(data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getPromoCodesErrorMessage(error) });
    }
  }, [promoCodeId, getPromoCodesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const editHref = `/paiements/codes-promo/${promoCodeId}`;
  const backLabel = tPages('backLabel');

  if (state.status === 'loading') {
    return (
      <div className="min-w-0 space-y-6">
        <PaymentsPromoSubnav />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (state.status === 'error' || !promoCode) {
    return (
      <div className="min-w-0 space-y-4">
        <PaymentsPromoSubnav />
        <AdminPageBackLink href="/paiements/codes-promo" label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
        </p>
      </div>
    );
  }

  const discountLabel = formatPromoDiscountLabel(promoCode, discountLabels);
  const discountTypeLabel = getPromoDiscountTypeLabel(
    promoCode.discountType,
    discountTypeLabels,
  );
  const coverUrl = promoCode.coverImageUrl?.trim() || null;
  const validityRange = formatPromoValidityRange(promoCode.validFrom, promoCode.validUntil);
  const validityState = hydrated
    ? getPromoValidityState(promoCode.validFrom, promoCode.validUntil)
    : null;
  const usageLabel = formatPromoUsageLabel(
    promoCode.redemptionCount,
    promoCode.maxRedemptions,
    tUsage.format,
    tUsage.unlimitedMax,
  );

  return (
    <div className="min-w-0 space-y-6">
      <PaymentsPromoSubnav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/paiements/codes-promo" label={backLabel} />
        {canWrite ? (
          <Button href={editHref} className="w-full sm:w-auto">
            {t('editButton')}
          </Button>
        ) : null}
      </div>

      <section
        className={cn(
          'relative isolate overflow-hidden rounded-2xl border border-atg-border shadow-sm',
          'min-h-[16rem] sm:min-h-[18rem]',
        )}
        aria-label={t('ariaLabel', { code: promoCode.code })}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2744] via-[#163456] to-[#1a4a6e]" />
        {coverUrl ? (
          <Image
            src={resolveMediaUrl(coverUrl)}
            alt={t('coverAlt', { code: promoCode.code })}
            fill
            unoptimized
            priority
            className="object-cover transition-transform duration-700 ease-out will-change-transform hover:scale-[1.02]"
            sizes="100vw"
          />
        ) : null}
        <div
          className={cn(
            'absolute inset-0',
            coverUrl
              ? 'bg-gradient-to-t from-[#0a1628]/95 via-[#0a1628]/55 to-[#0a1628]/20'
              : 'bg-gradient-to-t from-black/40 via-transparent to-black/10',
          )}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative z-10 flex min-h-[16rem] flex-col justify-end gap-4 p-5 sm:min-h-[18rem] sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:text-xs">
              {t('badge')}
            </span>
            <DataTableBadge
              variant={promoCode.active === 1 ? 'success' : 'muted'}
              className={cn(
                'ring-white/20',
                promoCode.active === 1
                  ? 'bg-emerald-500/25 text-white'
                  : 'bg-white/10 text-white/80',
              )}
            >
              {promoCode.active === 1 ? tStatus('active') : tStatus('inactive')}
            </DataTableBadge>
            {validityState ? (
              <DataTableBadge
                variant={getPromoValidityBadgeVariant(validityState)}
                className="bg-white/10 text-white ring-white/20"
              >
                {getPromoValidityLabel(validityState, validityLabels)}
              </DataTableBadge>
            ) : null}
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="break-all font-mono text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {promoCode.code}
            </h1>
            <p className="text-sm text-white/70 sm:text-base">{t('heroHint')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tabular-nums text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              {discountLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/20">
              {discountTypeLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-black/25 px-2.5 py-1 text-xs tabular-nums text-white/80 ring-1 ring-inset ring-white/15">
              {validityRange}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HighlightTile
          label={tList('columns.status')}
          value={
            <DataTableBadge variant={promoCode.active === 1 ? 'success' : 'muted'}>
              {promoCode.active === 1 ? tStatus('active') : tStatus('inactive')}
            </DataTableBadge>
          }
        />
        <HighlightTile
          label={tList('columns.discount')}
          value={<span className="text-base font-semibold tabular-nums">{discountLabel}</span>}
          hint={<DataTableBadge variant="muted">{discountTypeLabel}</DataTableBadge>}
        />
        <HighlightTile
          label={tList('columns.validity')}
          value={<span className="text-sm font-semibold leading-snug">{validityRange}</span>}
          hint={
            validityState ? (
              <DataTableBadge variant={getPromoValidityBadgeVariant(validityState)}>
                {getPromoValidityLabel(validityState, validityLabels)}
              </DataTableBadge>
            ) : null
          }
        />
        <HighlightTile
          label={tList('columns.usage')}
          value={<span className="text-base font-semibold tabular-nums">{usageLabel}</span>}
          hint={
            <span className="text-xs text-atg-muted">
              {t('usageHint', { count: promoCode.redemptionCount })}
            </span>
          }
        />
      </div>

      <Card variant="dashboard" padding="md" className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]">
          <div className="min-w-0 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-atg-fg">{t('infoTitle')}</h2>
              <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
            </div>

            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <ProfileField
                label={tForm('fields.code')}
                value={
                  <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm font-semibold ring-1 ring-atg-border/60">
                    {promoCode.code}
                  </code>
                }
              />
              <ProfileField
                label={t('checkoutId')}
                value={
                  <code className="break-all rounded-md bg-atg-surface px-1.5 py-0.5 font-mono text-xs text-atg-fg">
                    {promoCode.id}
                  </code>
                }
              />
              <ProfileField
                label={tForm('fields.discountType')}
                value={discountTypeLabel}
              />
              <ProfileField
                label={tList('columns.discount')}
                value={<span className="tabular-nums">{discountLabel}</span>}
              />
            </dl>
          </div>

          <aside className="min-w-0 space-y-5 rounded-xl border border-atg-border/70 bg-gradient-to-b from-atg-surface/80 to-transparent p-4 lg:border-0 lg:bg-none lg:p-0 lg:pl-6 lg:border-l lg:border-atg-border">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{t('metaTitle')}</h3>
              <dl className="mt-3 space-y-3.5">
                <ProfileField
                  label={tForm('fields.validFrom')}
                  value={formatDateTime(promoCode.validFrom)}
                />
                <ProfileField
                  label={tForm('fields.validUntil')}
                  value={formatDateTime(promoCode.validUntil)}
                />
                <ProfileField
                  label={tForm('fields.maxRedemptions')}
                  value={
                    promoCode.maxRedemptions != null
                      ? String(promoCode.maxRedemptions)
                      : tForm('usage.unlimited')
                  }
                />
                <ProfileField
                  label={tDates('createdAt')}
                  value={formatDateTime(promoCode.createdAt)}
                />
                <ProfileField
                  label={tDates('updatedAt')}
                  value={
                    promoCode.updatedAt
                      ? formatDateTime(promoCode.updatedAt)
                      : emptyDash
                  }
                />
              </dl>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
