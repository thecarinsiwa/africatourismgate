'use client';

import { Button, DataTableBadge, Drawer } from '@africatourismgate/ui';
import type { PaymentAdminDetail, RefundPaymentResponse } from '@africatourismgate/types';
import Link from 'next/link';
import { useMemo } from 'react';
import { formatMoney } from '../../lib/format-money';
import {
  STRIPE_PROVIDER,
  buildRefundHistoryEntries,
  canRefundPayment,
  formatPaymentDateTime,
  formatPaymentProvider,
  paymentStatusLabels,
  paymentStatusVariants,
} from '../../lib/payment-display';

type PaymentDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: PaymentAdminDetail | null;
  loading: boolean;
  error: string | null;
  refundHistory?: RefundPaymentResponse[];
  canRefund?: boolean;
  onRefundClick?: () => void;
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-1 text-sm text-atg-fg">{children}</dd>
    </div>
  );
}

function StripeIdRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-atg-muted">{label}</p>
      <p className="break-all rounded-md bg-atg-surface px-2 py-1.5 font-mono text-xs text-atg-fg ring-1 ring-atg-border/60">
        {value?.trim() ? value : '—'}
      </p>
    </div>
  );
}

export function PaymentDetailDrawer({
  open,
  onOpenChange,
  detail,
  loading,
  error,
  refundHistory = [],
  canRefund = false,
  onRefundClick,
}: PaymentDetailDrawerProps) {
  const historyEntries = useMemo(
    () => buildRefundHistoryEntries(detail, refundHistory),
    [detail, refundHistory],
  );

  const showRefundAction = canRefund && detail !== null && canRefundPayment(detail);

  const footer =
    detail && !loading && !error && showRefundAction ? (
      <div className="flex flex-wrap gap-2 px-4 py-4">
        <Button variant="secondary" size="sm" onClick={onRefundClick}>
          Rembourser
        </Button>
      </div>
    ) : null;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Détail du paiement"
      className="max-w-md"
      footer={footer}
    >
      <div className="space-y-6 px-4 py-4">
        {loading ? (
          <p className="text-sm text-atg-muted">Chargement…</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : detail ? (
          <>
            <section aria-labelledby="payment-summary-heading">
              <h3
                id="payment-summary-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-wide text-atg-muted"
              >
                Résumé
              </h3>
              <dl className="space-y-4">
                <DetailField label="Montant">
                  <span className="tabular-nums text-base font-semibold">
                    {formatMoney(detail.amountCents, detail.currency)}
                  </span>
                </DetailField>
                <DetailField label="Statut">
                  <DataTableBadge variant={paymentStatusVariants[detail.status]}>
                    {paymentStatusLabels[detail.status]}
                  </DataTableBadge>
                </DetailField>
                <DetailField label="Méthode">
                  {formatPaymentProvider(detail.provider)}
                </DetailField>
                <DetailField label="Date">
                  <span className="tabular-nums">{formatPaymentDateTime(detail.createdAt)}</span>
                </DetailField>
                <DetailField label="Client">
                  <span>{detail.clientEmail}</span>
                  <p className="mt-0.5 text-atg-muted">
                    {detail.clientFirstName} {detail.clientLastName}
                  </p>
                </DetailField>
              </dl>
            </section>

            <section aria-labelledby="payment-stripe-heading">
              <h3
                id="payment-stripe-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-wide text-atg-muted"
              >
                Identifiants Stripe
              </h3>
              <div className="space-y-3 rounded-lg border border-atg-border bg-atg-surface/50 p-3">
                <StripeIdRow label="Payment Intent Stripe" value={detail.externalId} />
                <StripeIdRow label="ID paiement (interne)" value={detail.id} />
              </div>
            </section>

            <section aria-labelledby="payment-booking-heading">
              <h3
                id="payment-booking-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-wide text-atg-muted"
              >
                Réservation
              </h3>
              <Link
                href={`/dashboard/bookings/${detail.bookingId}`}
                className="inline-flex text-sm font-medium text-primary hover:underline"
              >
                Voir la réservation
              </Link>
              <p className="mt-2 break-all font-mono text-xs text-atg-muted">{detail.bookingId}</p>
            </section>

            <section aria-labelledby="payment-refunds-heading">
              <h3
                id="payment-refunds-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-wide text-atg-muted"
              >
                Historique des remboursements
              </h3>
              {historyEntries.length === 0 ? (
                <p className="rounded-lg border border-dashed border-atg-border px-3 py-4 text-center text-sm text-atg-muted">
                  Aucun remboursement enregistré.
                </p>
              ) : (
                <ul className="divide-y divide-atg-border rounded-lg border border-atg-border">
                  {historyEntries.map((entry) => (
                    <li key={entry.id} className="px-3 py-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-atg-fg">
                            {entry.label ?? 'Remboursement'}
                          </p>
                          <p className="mt-0.5 tabular-nums text-xs text-atg-muted">
                            {formatPaymentDateTime(entry.createdAt)}
                          </p>
                          {entry.stripeStatus ? (
                            <p className="mt-0.5 text-xs text-atg-muted">
                              Stripe : {entry.stripeStatus}
                            </p>
                          ) : null}
                          {entry.id.startsWith('re_') ? (
                            <p className="mt-1 break-all font-mono text-[11px] text-atg-muted">
                              {entry.id}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 tabular-nums font-medium text-atg-fg">
                          {formatMoney(entry.amountCents, detail.currency)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {detail.status === 'succeeded' &&
            detail.provider === STRIPE_PROVIDER &&
            detail.bookingStatus !== 'cancelled' ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                Remboursement Stripe : annulez d&apos;abord la réservation.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </Drawer>
  );
}
