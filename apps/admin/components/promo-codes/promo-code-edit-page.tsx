'use client';

import type { PromoCode } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
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
    );
  }

  const { promoCode } = state;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier le code promo</h1>
        <p className="mt-2 text-sm text-atg-muted">
          <code className="rounded bg-atg-elevated px-1.5 py-0.5 font-mono text-xs">
            {promoCode.code}
          </code>
        </p>
      </div>
      <PromoCodeForm mode="edit" promoCodeId={promoCodeId} initialPromoCode={promoCode} />
    </div>
  );
}
