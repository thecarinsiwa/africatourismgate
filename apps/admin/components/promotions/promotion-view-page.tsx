'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  cn,
} from '@africatourismgate/ui';
import type { Promotion } from '@africatourismgate/types';
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
  formatPromotionDiscountBadge,
  formatPromoUsageLabel,
  formatPromotionValidityDisplay,
  getPromoDiscountTypeLabel,
  getPromotionValidityState,
  getPromoValidityBadgeVariant,
  getPromoValidityLabel,
} from '../../lib/promo-validity';

type PromotionViewPageProps = {
  promotionId: string;
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

export function PromotionViewPage({ promotionId }: PromotionViewPageProps) {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.view');
  const tForm = useTranslations('modules.promotions.form');
  const tStatus = useTranslations('modules.promotions.status');
  const tList = useTranslations('modules.promotions.list');
  const tPreview = useTranslations('modules.promotions.preview');
  const tPages = useTranslations('pages.paiements.promotions.id');
  const tCommon = useTranslations('modules.common');
  const tDates = useTranslations('modules.common.dates');
  const discountLabels = usePromoDiscountLabels();
  const discountTypeLabels = usePromoDiscountTypeLabels();
  const validityLabels = usePromoValidityLabels();
  const tUsage = usePromoUsageLabels();
  const formatDateTime = useFormatDateTime('short');
  const hydrated = useHydrated();
  const emptyDash = tCommon('empty.dash');

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready' }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready' && promotion != null,
    title: t('title'),
    entityLabel: promotion?.name,
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
      const data = await getApiClient().getPromotion(promotionId);
      setPromotion(data);
      setState({ status: 'ready' });
    } catch (error) {
      setState({ status: 'error', message: getPromotionsErrorMessage(error) });
    }
  }, [promotionId, getPromotionsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const editHref = `/paiements/promotions/${promotionId}`;
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

  if (state.status === 'error' || !promotion) {
    return (
      <div className="min-w-0 space-y-4">
        <PaymentsPromoSubnav />
        <AdminPageBackLink href="/paiements/promotions" label={backLabel} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.status === 'error' ? state.message : t('notFound')}
        </p>
      </div>
    );
  }

  const hasDiscount = promotion.discountType != null && promotion.discountValue != null;
  const coverUrl = promotion.coverImageUrl?.trim() || null;
  const description = promotion.description?.trim() || null;
  const validityState = hydrated
    ? getPromotionValidityState(promotion.validFrom, promotion.validUntil)
    : null;
  const discountLabel = formatPromotionDiscountBadge(
    {
      hasDiscount,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
    },
    discountLabels,
  );
  const validityLabel = formatPromotionValidityDisplay(
    promotion.validFrom,
    promotion.validUntil,
    discountLabels,
  );
  const usageLabel = formatPromoUsageLabel(
    promotion.redemptionCount,
    promotion.maxRedemptions,
    tUsage.format,
    tUsage.unlimitedMax,
  );

  return (
    <div className="min-w-0 space-y-6">
      <PaymentsPromoSubnav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageBackLink href="/paiements/promotions" label={backLabel} />
        {canWrite ? (
          <Button href={editHref} className="w-full sm:w-auto">
            {t('editButton')}
          </Button>
        ) : null}
      </div>

      {/* Hero — one visual composition */}
      <section
        className={cn(
          'relative isolate overflow-hidden rounded-2xl border border-atg-border shadow-sm',
          'min-h-[16rem] sm:min-h-[18rem]',
        )}
        aria-label={tPreview('ariaLabel', { name: promotion.name })}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2744] via-[#163456] to-[#1a4a6e]" />
        {coverUrl ? (
          <Image
            src={resolveMediaUrl(coverUrl)}
            alt={t('coverAlt', { name: promotion.name })}
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
              {tPreview('badge')}
            </span>
            <DataTableBadge
              variant={promotion.active === 1 ? 'success' : 'muted'}
              className={cn(
                'ring-white/20',
                promotion.active === 1
                  ? 'bg-emerald-500/25 text-white'
                  : 'bg-white/10 text-white/80',
              )}
            >
              {promotion.active === 1 ? tStatus('active') : tStatus('inactive')}
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

          <div className="max-w-3xl space-y-3">
            <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {promotion.name}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                {description}
              </p>
            ) : (
              <p className="text-sm text-white/55">{t('noDescription')}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tabular-nums text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              {discountLabel}
            </span>
            {hasDiscount && promotion.discountType ? (
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/20">
                {getPromoDiscountTypeLabel(promotion.discountType, discountTypeLabels)}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-black/25 px-2.5 py-1 text-xs tabular-nums text-white/80 ring-1 ring-inset ring-white/15">
              {validityLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HighlightTile
          label={tList('columns.status')}
          value={
            <DataTableBadge variant={promotion.active === 1 ? 'success' : 'muted'}>
              {promotion.active === 1 ? tStatus('active') : tStatus('inactive')}
            </DataTableBadge>
          }
        />
        <HighlightTile
          label={tList('columns.discount')}
          value={<span className="text-base font-semibold tabular-nums">{discountLabel}</span>}
          hint={
            hasDiscount && promotion.discountType ? (
              <DataTableBadge variant="muted">
                {getPromoDiscountTypeLabel(promotion.discountType, discountTypeLabels)}
              </DataTableBadge>
            ) : (
              <span className="text-xs text-atg-muted">{t('discountInformative')}</span>
            )
          }
        />
        <HighlightTile
          label={tList('columns.validity')}
          value={
            <span className="text-sm font-semibold leading-snug">{validityLabel}</span>
          }
          hint={
            validityState ? (
              <DataTableBadge variant={getPromoValidityBadgeVariant(validityState)}>
                {getPromoValidityLabel(validityState, validityLabels)}
              </DataTableBadge>
            ) : (
              <span className="text-xs text-atg-muted">{t('validityOpen')}</span>
            )
          }
        />
        <HighlightTile
          label={tList('columns.usage')}
          value={<span className="text-base font-semibold tabular-nums">{usageLabel}</span>}
          hint={
            <span className="text-xs text-atg-muted">
              {t('usageHint', { count: promotion.redemptionCount })}
            </span>
          }
        />
      </div>

      {/* Details */}
      <Card variant="dashboard" padding="md" className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]">
          <div className="min-w-0 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-atg-fg">{t('infoTitle')}</h2>
              <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
            </div>

            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <ProfileField label={tForm('fields.name')} value={promotion.name} />
              <ProfileField
                label={t('checkoutId')}
                value={
                  <code className="break-all rounded-md bg-atg-surface px-1.5 py-0.5 font-mono text-xs text-atg-fg">
                    {promotion.id}
                  </code>
                }
              />
            </dl>

            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{t('descriptionTitle')}</h3>
              {description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-atg-fg">
                  {description}
                </p>
              ) : (
                <p className="mt-2 text-sm text-atg-muted">{t('noDescription')}</p>
              )}
            </div>
          </div>

          <aside className="min-w-0 space-y-5 rounded-xl border border-atg-border/70 bg-gradient-to-b from-atg-surface/80 to-transparent p-4 lg:border-0 lg:bg-none lg:p-0 lg:pl-6 lg:border-l lg:border-atg-border">
            <div>
              <h3 className="text-sm font-semibold text-atg-fg">{t('metaTitle')}</h3>
              <dl className="mt-3 space-y-3.5">
                <ProfileField
                  label={tForm('fields.validFromOptional')}
                  value={
                    promotion.validFrom
                      ? formatDateTime(promotion.validFrom)
                      : emptyDash
                  }
                />
                <ProfileField
                  label={tForm('fields.validUntilOptional')}
                  value={
                    promotion.validUntil
                      ? formatDateTime(promotion.validUntil)
                      : emptyDash
                  }
                />
                <ProfileField
                  label={tForm('fields.maxRedemptions')}
                  value={
                    promotion.maxRedemptions != null
                      ? String(promotion.maxRedemptions)
                      : tForm('usage.unlimited')
                  }
                />
                <ProfileField
                  label={tDates('createdAt')}
                  value={formatDateTime(promotion.createdAt)}
                />
                <ProfileField
                  label={tDates('updatedAt')}
                  value={
                    promotion.updatedAt
                      ? formatDateTime(promotion.updatedAt)
                      : emptyDash
                  }
                />
              </dl>
            </div>

            {!coverUrl ? (
              <p className="text-xs leading-relaxed text-atg-muted">{t('coverEmptyHint')}</p>
            ) : null}
          </aside>
        </div>
      </Card>
    </div>
  );
}
