'use client';

import type { Translations } from '../../lib/i18n/translations';

type StripePaymentErrorProps = {
  message: string;
  labels: Translations['checkout']['stripeError'];
  onDismiss?: () => void;
};

export function resolveStripePaymentError(
  message: string,
  labels: Translations['checkout']['stripeError'],
): { title: string; description: string; hint: string } {
  const normalized = message.toLowerCase();

  if (normalized.includes('authentification') || normalized.includes('authentication')) {
    return {
      title: labels.authTitle,
      description: labels.authDescription,
      hint: labels.authHint,
    };
  }

  if (
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('failed to fetch')
  ) {
    return {
      title: labels.networkTitle,
      description: message,
      hint: labels.networkHint,
    };
  }

  if (normalized.includes('card') || normalized.includes('payment')) {
    return {
      title: labels.paymentTitle,
      description: message,
      hint: labels.paymentHint,
    };
  }

  return {
    title: labels.genericTitle,
    description: message,
    hint: labels.genericHint,
  };
}

/** BK5 — erreurs Stripe / checkout explicites. */
export function StripePaymentError({ message, labels, onDismiss }: StripePaymentErrorProps) {
  const resolved = resolveStripePaymentError(message, labels);

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-500/10"
    >
      <p className="text-sm font-semibold text-red-800 dark:text-red-300">{resolved.title}</p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-200">{resolved.description}</p>
      <p className="mt-2 text-xs text-red-600 dark:text-red-300/90">{resolved.hint}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-xs font-semibold text-red-800 underline dark:text-red-300"
        >
          {labels.dismiss}
        </button>
      ) : null}
    </div>
  );
}
