'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { PromoCode } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import { PromoCodeCoverImageSection } from './promo-code-cover-image-section';
import { PromoCodeForm } from './promo-code-form';

type PromoCodeEditPageProps = {
  promoCodeId: string;
};

export function PromoCodeEditPage({ promoCodeId }: PromoCodeEditPageProps) {
  const { promoCodes: getPromoCodesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promoCodes.edit');
  const tPages = useTranslations('pages.paiements.codes-promo.id');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; promoCode: PromoCode }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.promoCode.code : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const promoCode = await getApiClient().getPromoCode(promoCodeId);
        if (!cancelled) setState({ status: 'ready', promoCode });
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getPromoCodesErrorMessage(error) });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [promoCodeId, getPromoCodesErrorMessage]);

  if (state.status === 'loading') {
    return (
      <div className="min-w-0">
        <PaymentsPromoSubnav />
        <div className="mb-4">
          <AdminPageBackLink href="/paiements/codes-promo" label={tPages('backLabel')} />
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
          <AdminPageBackLink href="/paiements/codes-promo" label={tPages('backLabel')} />
        </div>
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { promoCode } = state;

  return (
    <div className="min-w-0 space-y-6">
      <PaymentsPromoSubnav />
      <AdminIntroPage
        routePath="paiements/codes-promo/id"
        backHref="/paiements/codes-promo"
        backLabelKey="backLabel"
      >
        <div className="space-y-6">
          <PromoCodeCoverImageSection
            promoCodeId={promoCodeId}
            coverImageUrl={promoCode.coverImageUrl}
            onSaved={(updated) => setState({ status: 'ready', promoCode: updated })}
          />
          <PromoCodeForm mode="edit" promoCodeId={promoCodeId} initialPromoCode={promoCode} />
        </div>
      </AdminIntroPage>
    </div>
  );
}
