'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Promotion } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import { PromotionForm } from './promotion-form';

type PromotionEditPageProps = {
  promotionId: string;
};

export function PromotionEditPage({ promotionId }: PromotionEditPageProps) {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; promotion: Promotion }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.promotion.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const promotion = await getApiClient().getPromotion(promotionId);
        if (!cancelled) setState({ status: 'ready', promotion });
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getPromotionsErrorMessage(error) });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [promotionId, getPromotionsErrorMessage]);

  if (state.status === 'loading') {
    return (
      <div>
        <PaymentsPromoSubnav />
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div>
        <PaymentsPromoSubnav />
        <div className="space-y-4">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
          <Link
            href="/paiements/promotions"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            {tCommon('back.toList')}
          </Link>
        </div>
      </div>
    );
  }

  const { promotion } = state;

  return (
    <div>
      <PaymentsPromoSubnav />
      <PromotionForm mode="edit" promotionId={promotionId} initialPromotion={promotion} />
    </div>
  );
}
