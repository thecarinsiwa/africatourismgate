'use client';

import type { Translations } from '../../lib/i18n/message-types';

type StripePaymentErrorProps = {
  message: string;
  labels: Translations['checkout']['stripeError'];
  onDismiss?: () => void;
};

/** Raw gateway / stack messages must never reach the checkout UI. */
export function isTechnicalStripeErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    /^http\s+\d{3}\b/i.test(message.trim()) ||
    normalized.includes('internal server error') ||
    normalized.includes('econnrefused') ||
    normalized.includes('etimedout') ||
    normalized.includes('enotfound') ||
    normalized.includes('socket hang up') ||
    /\bat\s+[\w$.]+\s*\(/.test(message) ||
    /\bat\s+object\./i.test(message) ||
    message.includes('\n    at ') ||
    /\bstack\b/i.test(message)
  );
}

function safeUserDescription(message: string, fallback: string): string {
  return isTechnicalStripeErrorMessage(message) ? fallback : message;
}

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
    normalized.includes('failed to fetch') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout')
  ) {
    return {
      title: labels.networkTitle,
      description: safeUserDescription(message, labels.networkHint),
      hint: labels.networkHint,
    };
  }

  if (normalized.includes('card') || normalized.includes('payment')) {
    return {
      title: labels.paymentTitle,
      description: safeUserDescription(message, labels.paymentHint),
      hint: labels.paymentHint,
    };
  }

  return {
    title: labels.genericTitle,
    description: safeUserDescription(message, labels.genericHint),
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
