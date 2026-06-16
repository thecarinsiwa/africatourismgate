'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { PromoCode } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import { PromoCodeForm } from './promo-code-form';

type PromoCodeEditPageProps = {
  promoCodeId: string;
};

export function PromoCodeEditPage({ promoCodeId }: PromoCodeEditPageProps) {
  const { promoCodes: getPromoCodesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promoCodes.edit');
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
            href="/paiements/codes-promo"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            {tCommon('back.toList')}
          </Link>
        </div>
      </div>
    );
  }

  const { promoCode } = state;

  return (
    <div>
      <PaymentsPromoSubnav />
      <PromoCodeForm mode="edit" promoCodeId={promoCodeId} initialPromoCode={promoCode} />
    </div>
  );
}
