'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTableBadge,
  Skeleton,
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
import { PromotionPreviewBanner, promotionToPreviewProps } from './promotion-preview-banner';

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

export function PromotionViewPage({ promotionId }: PromotionViewPageProps) {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.view');
  const tForm = useTranslations('modules.promotions.form');
  const tStatus = useTranslations('modules.promotions.status');
  const tList = useTranslations('modules.promotions.list');
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
        <Skeleton className="h-40 w-full rounded-xl" />
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
  const validityState = hydrated
    ? getPromotionValidityState(promotion.validFrom, promotion.validUntil)
    : null;
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

      <PromotionPreviewBanner {...promotionToPreviewProps(promotion)} />

      <Card variant="dashboard" padding="md" className="space-y-4">
        <h3 className="text-sm font-semibold text-atg-fg">{t('coverTitle')}</h3>
        {promotion.coverImageUrl?.trim() ? (
          <div className="relative aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-lg border border-atg-border">
            <Image
              src={resolveMediaUrl(promotion.coverImageUrl.trim())}
              alt={t('coverAlt', { name: promotion.name })}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42rem"
            />
          </div>
        ) : (
          <p className="text-sm text-atg-muted">{t('coverEmpty')}</p>
        )}
      </Card>

      <Card variant="dashboard" padding="md" className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">{t('infoTitle')}</h3>
          <p className="mt-1 text-sm text-atg-muted">{t('subtitle')}</p>
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <ProfileField label={tForm('fields.name')} value={promotion.name} />
          <ProfileField
            label={tList('columns.status')}
            value={
              <DataTableBadge variant={promotion.active === 1 ? 'success' : 'muted'}>
                {promotion.active === 1 ? tStatus('active') : tStatus('inactive')}
              </DataTableBadge>
            }
          />
          <ProfileField
            label={tCommon('form.description')}
            value={promotion.description?.trim() || emptyDash}
          />
          <ProfileField
            label={tList('columns.discount')}
            value={
              <div className="flex flex-wrap items-center gap-1.5">
                <DataTableBadge variant="default" className="tabular-nums">
                  {formatPromotionDiscountBadge(
                    {
                      hasDiscount,
                      discountType: promotion.discountType,
                      discountValue: promotion.discountValue,
                    },
                    discountLabels,
                  )}
                </DataTableBadge>
                {hasDiscount && promotion.discountType ? (
                  <DataTableBadge variant="muted">
                    {getPromoDiscountTypeLabel(promotion.discountType, discountTypeLabels)}
                  </DataTableBadge>
                ) : null}
              </div>
            }
          />
          <ProfileField
            label={tList('columns.validity')}
            value={
              <div className="flex flex-col gap-1.5">
                <span className="tabular-nums text-sm text-atg-fg">
                  {formatPromotionValidityDisplay(
                    promotion.validFrom,
                    promotion.validUntil,
                    discountLabels,
                  )}
                </span>
                {validityState ? (
                  <DataTableBadge variant={getPromoValidityBadgeVariant(validityState)}>
                    {getPromoValidityLabel(validityState, validityLabels)}
                  </DataTableBadge>
                ) : null}
              </div>
            }
          />
          <ProfileField
            label={tList('columns.usage')}
            value={<span className="tabular-nums">{usageLabel}</span>}
          />
          <ProfileField
            label={t('checkoutId')}
            value={
              <code className="break-all rounded bg-atg-surface px-1.5 py-0.5 font-mono text-xs">
                {promotion.id}
              </code>
            }
          />
          <ProfileField
            label={tDates('createdAt')}
            value={formatDateTime(promotion.createdAt)}
          />
          <ProfileField
            label={tDates('updatedAt')}
            value={
              promotion.updatedAt ? formatDateTime(promotion.updatedAt) : emptyDash
            }
          />
        </dl>
      </Card>
    </div>
  );
}
