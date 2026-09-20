'use client';

import Link from 'next/link';
import { useMessages } from 'next-intl';
import { useMemo } from 'react';
import type { Translations } from '../../lib/i18n/translations';
import { CheckoutPageShell } from './checkout-page-shell';

export function ReservationCancelPageContent() {
  const messages = useMessages();
  const ck = (messages as { checkout: Translations['checkout'] }).checkout;
  const c = ck.cancel;

  const stepperLabels = useMemo(
    () => ({
      stepperAriaLabel: ck.stepperAriaLabel,
      cart: ck.stepCart,
      recap: ck.stepRecap,
      payment: ck.stepPayment,
      confirmation: ck.stepConfirmation,
      cancelled: ck.stepCancelled,
    }),
    [ck],
  );

  return (
    <CheckoutPageShell
      title={c.title}
      currentStep="payment"
      stepperLabels={stepperLabels}
      cancelled
    >
      <div className="mt-6 rounded-xl border border-amber-200 bg-atg-elevated p-6 dark:border-amber-900/40 dark:bg-atg-elevated">
        <p className="text-sm text-atg-muted">{c.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/booking/cart"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {c.backToCart}
          </Link>
          <Link
            href="/hotels"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:hover:bg-white/5"
          >
            {c.continueSearch}
          </Link>
        </div>
      </div>
    </CheckoutPageShell>
  );
}
