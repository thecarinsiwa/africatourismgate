import type {
  PaymentAdminDetail,
  PaymentStatus,
  RefundPaymentResponse,
} from '@africatourismgate/types';

export const STRIPE_PROVIDER = 'stripe';

export const paymentStatusVariants: Record<
  PaymentStatus,
  'success' | 'warning' | 'muted' | 'danger' | 'default'
> = {
  pending: 'warning',
  succeeded: 'success',
  failed: 'danger',
  refunded: 'default',
};

export function formatPaymentProvider(
  provider: string | null,
  providerLabels: Record<string, string>,
  emptyLabel = '—',
): string {
  if (!provider) return emptyLabel;
  return providerLabels[provider] ?? provider;
}

export function formatPaymentDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function canRefundPayment(detail: PaymentAdminDetail): boolean {
  return (
    detail.status === 'succeeded' &&
    detail.provider === STRIPE_PROVIDER &&
    detail.bookingStatus === 'cancelled'
  );
}

export function getMaxRefundableCents(
  detail: PaymentAdminDetail,
  sessionRefunds: RefundPaymentResponse[],
): number {
  const refundedSoFar = sessionRefunds.reduce((sum, refund) => sum + refund.amountCents, 0);
  return Math.max(0, detail.amountCents - refundedSoFar);
}

export type PaymentRefundHistoryEntry = {
  id: string;
  amountCents: number;
  createdAt: string;
  stripeStatus?: string;
  label?: string;
};

export function buildRefundHistoryEntries(
  detail: PaymentAdminDetail | null,
  sessionRefunds: RefundPaymentResponse[],
  refundLabels: { partial: string; full: string },
): PaymentRefundHistoryEntry[] {
  if (sessionRefunds.length > 0) {
    return sessionRefunds.map((refund) => ({
      id: refund.refundId,
      amountCents: refund.amountCents,
      createdAt: new Date().toISOString(),
      stripeStatus: refund.stripeStatus,
      label:
        refund.amountCents < (detail?.amountCents ?? refund.amountCents)
          ? refundLabels.partial
          : refundLabels.full,
    }));
  }

  if (detail?.status === 'refunded') {
    return [
      {
        id: `derived-${detail.id}`,
        amountCents: detail.amountCents,
        createdAt: detail.updatedAt ?? detail.createdAt,
        label: refundLabels.full,
      },
    ];
  }

  return [];
}
