'use client';

import { Button } from '@africatourismgate/ui';
import { useSearchParams } from 'next/navigation';
import { posSaleSuccessPageConfig } from '../config/sale';

const {
  title,
  subtitle,
  bookingLabel,
  paymentLabel,
  paymentCash,
  paymentCard,
  newSaleLabel,
  backToHomeLabel,
} = posSaleSuccessPageConfig;

function formatPaymentMethod(method: string | null): string {
  if (method === 'cash') return paymentCash;
  if (method === 'card') return paymentCard;
  return '—';
}

export function PosSaleSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const paymentMethod = searchParams.get('payment');

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-3xl text-primary">
        ✓
      </div>

      <h1 className="text-3xl font-bold text-atg-fg md:text-4xl">{title}</h1>
      <p className="mt-3 text-lg text-atg-muted">{subtitle}</p>

      <dl className="pos-touch mt-10 w-full max-w-md space-y-4 rounded-2xl border border-atg-border bg-atg-elevated px-6 py-6 text-left">
        <div>
          <dt className="text-sm font-medium text-atg-muted">{bookingLabel}</dt>
          <dd className="mt-1 break-all font-mono text-base text-atg-fg">
            {bookingId ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-atg-muted">{paymentLabel}</dt>
          <dd className="mt-1 text-lg font-semibold text-atg-fg">
            {formatPaymentMethod(paymentMethod)}
          </dd>
        </div>
      </dl>

      <div className="pos-touch mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <Button variant="primary" size="lg" fullWidth href="/sale" className="min-h-[3.5rem] text-lg">
          {newSaleLabel}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          href="/"
          className="min-h-[3.5rem] text-lg"
        >
          {backToHomeLabel}
        </Button>
      </div>
    </div>
  );
}
