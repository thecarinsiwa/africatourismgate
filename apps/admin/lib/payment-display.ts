import type {
  PaymentAdminDetail,
  PaymentStatus,
  RefundPaymentResponse,
} from '@africatourismgate/types';

export const STRIPE_PROVIDER = 'stripe';

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'En attente',
  succeeded: 'Réussi',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

export const paymentStatusVariants: Record<
  PaymentStatus,
  'success' | 'warning' | 'muted' | 'danger' | 'default'
> = {
  pending: 'warning',
  succeeded: 'success',
  failed: 'danger',
  refunded: 'default',
};

const providerLabels: Record<string, string> = {
  stripe: 'Stripe',
  cash: 'Espèces',
};

export function formatPaymentProvider(provider: string | null): string {
  if (!provider) return '—';
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
): PaymentRefundHistoryEntry[] {
  if (sessionRefunds.length > 0) {
    return sessionRefunds.map((refund) => ({
      id: refund.refundId,
      amountCents: refund.amountCents,
      createdAt: new Date().toISOString(),
      stripeStatus: refund.stripeStatus,
      label: refund.amountCents < (detail?.amountCents ?? refund.amountCents)
        ? 'Remboursement partiel'
        : 'Remboursement total',
    }));
  }

  if (detail?.status === 'refunded') {
    return [
      {
        id: `derived-${detail.id}`,
        amountCents: detail.amountCents,
        createdAt: detail.updatedAt ?? detail.createdAt,
        label: 'Remboursement total',
      },
    ];
  }

  return [];
}
