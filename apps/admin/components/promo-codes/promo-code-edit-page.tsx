'use client';

import type { PromoCode } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import { getPromoCodesErrorMessage } from '../../lib/promo-codes-errors';
import { PromoCodeForm } from './promo-code-form';

type PromoCodeEditPageProps = {
  promoCodeId: string;
};

export function PromoCodeEditPage({ promoCodeId }: PromoCodeEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; promoCode: PromoCode }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Modifier le code promo',
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
  }, [promoCodeId]);

  if (state.status === 'loading') {
    return (
      <div>
        <PaymentsPromoSubnav />
        <p className="text-sm text-atg-muted">Chargement…</p>
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
          ← Retour à la liste
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
