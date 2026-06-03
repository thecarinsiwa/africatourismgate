'use client';

import type { Promotion } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { getApiClient } from '../../lib/auth/api';
import { getPromotionsErrorMessage } from '../../lib/promotions-errors';
import { PromotionForm } from './promotion-form';

type PromotionEditPageProps = {
  promotionId: string;
};

export function PromotionEditPage({ promotionId }: PromotionEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; promotion: Promotion }
  >({ status: 'loading' });

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
  }, [promotionId]);

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
            href="/paiements/promotions"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const { promotion } = state;

  return (
    <div>
      <PaymentsPromoSubnav />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier la promotion</h1>
        <p className="mt-2 text-sm text-atg-muted">{promotion.name}</p>
      </div>
      <PromotionForm mode="edit" promotionId={promotionId} initialPromotion={promotion} />
    </div>
  );
}
