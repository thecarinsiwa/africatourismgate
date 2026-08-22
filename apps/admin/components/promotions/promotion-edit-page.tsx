'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Promotion } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import { PromotionCoverImageSection } from './promotion-cover-image-section';
import { PromotionForm } from './promotion-form';

type PromotionEditPageProps = {
  promotionId: string;
};

export function PromotionEditPage({ promotionId }: PromotionEditPageProps) {
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.edit');
  const tPages = useTranslations('pages.paiements.promotions.id');
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
      <div className="min-w-0">
        <PaymentsPromoSubnav />
        <div className="mb-4">
          <AdminPageBackLink href="/paiements/promotions" label={tPages('backLabel')} />
        </div>
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-w-0">
        <PaymentsPromoSubnav />
        <div className="mb-4">
          <AdminPageBackLink href="/paiements/promotions" label={tPages('backLabel')} />
        </div>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { promotion } = state;

  return (
    <div className="min-w-0 space-y-6">
      <PaymentsPromoSubnav />
      <AdminIntroPage
        routePath="paiements/promotions/id"
        backHref="/paiements/promotions"
        backLabelKey="backLabel"
      >
        <div className="space-y-6">
          <PromotionCoverImageSection
            promotionId={promotionId}
            coverImageUrl={promotion.coverImageUrl}
            onSaved={(updated) => setState({ status: 'ready', promotion: updated })}
          />
          <PromotionForm mode="edit" promotionId={promotionId} initialPromotion={promotion} />
        </div>
      </AdminIntroPage>
    </div>
  );
}
