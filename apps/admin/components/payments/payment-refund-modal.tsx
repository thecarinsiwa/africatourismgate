'use client';

import { Button, Input, Modal, cn } from '@africatourismgate/ui';
import type { PaymentAdminDetail, RefundPaymentResponse } from '@africatourismgate/types';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { formatMoney } from '../../lib/format-money';
import { getMaxRefundableCents } from '../../lib/payment-display';
import { getPaymentsErrorMessage } from '../../lib/payments-errors';

export type PaymentRefundConfirmParams = {
  /** Omis pour un remboursement total (montant restant). */
  amountCents?: number;
  reason: string;
};

type RefundType = 'total' | 'partial';

const MIN_REASON_LENGTH = 10;

type PaymentRefundModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: PaymentAdminDetail;
  refundHistory?: RefundPaymentResponse[];
  onConfirm: (params: PaymentRefundConfirmParams) => Promise<void>;
};

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function PaymentRefundModal({
  open,
  onOpenChange,
  detail,
  refundHistory = [],
  onConfirm,
}: PaymentRefundModalProps) {
  const partialAmountId = useId();
  const reasonId = useId();
  const totalTypeId = useId();
  const partialTypeId = useId();

  const [refundType, setRefundType] = useState<RefundType>('total');
  const [partialAmount, setPartialAmount] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maxRefundableCents = useMemo(
    () => getMaxRefundableCents(detail, refundHistory),
    [detail, refundHistory],
  );

  const previewAmountCents = useMemo(() => {
    if (refundType === 'total') return maxRefundableCents;
    const trimmed = partialAmount.trim();
    if (!trimmed) return null;
    const parsed = Math.round(parseFloat(trimmed) * 100);
    if (Number.isNaN(parsed)) return null;
    return parsed;
  }, [refundType, partialAmount, maxRefundableCents]);

  const remainingAfterCents = useMemo(() => {
    if (previewAmountCents == null) return maxRefundableCents;
    return Math.max(0, maxRefundableCents - previewAmountCents);
  }, [previewAmountCents, maxRefundableCents]);

  const resetForm = useCallback(() => {
    setRefundType('total');
    setPartialAmount('');
    setReason('');
    setFormError(null);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  function validate(): { ok: true; amountCents?: number } | { ok: false; message: string } {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < MIN_REASON_LENGTH) {
      return {
        ok: false,
        message: `La raison doit contenir au moins ${MIN_REASON_LENGTH} caractères.`,
      };
    }

    if (maxRefundableCents < 1) {
      return { ok: false, message: 'Aucun montant remboursable restant.' };
    }

    if (refundType === 'total') {
      return { ok: true, amountCents: undefined };
    }

    const trimmed = partialAmount.trim();
    if (!trimmed) {
      return { ok: false, message: 'Indiquez un montant partiel.' };
    }

    const amountCents = Math.round(parseFloat(trimmed) * 100);
    if (Number.isNaN(amountCents) || amountCents < 1) {
      return { ok: false, message: 'Montant partiel invalide.' };
    }
    if (amountCents > maxRefundableCents) {
      return {
        ok: false,
        message: `Le montant ne peut pas dépasser ${formatMoney(maxRefundableCents, detail.currency)}.`,
      };
    }

    return { ok: true, amountCents };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = validate();
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onConfirm({ amountCents: result.amountCents, reason: reason.trim() });
      onOpenChange(false);
    } catch (error) {
      setFormError(getPaymentsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const previewInvalid =
    refundType === 'partial' &&
    partialAmount.trim() !== '' &&
    previewAmountCents != null &&
    previewAmountCents > maxRefundableCents;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!submitting) onOpenChange(next);
      }}
      title="Confirmer le remboursement"
      description={`Remboursement Stripe — maximum remboursable : ${formatMoney(maxRefundableCents, detail.currency)}.`}
      showClose
      className="max-w-lg"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-atg-fg">Type de remboursement</legend>
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={totalTypeId}
              className={cn(
                'cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors',
                refundType === 'total'
                  ? 'border-primary bg-primary/10 text-atg-fg'
                  : 'border-atg-border text-atg-muted hover:border-atg-muted',
              )}
            >
              <input
                id={totalTypeId}
                type="radio"
                name="refundType"
                value="total"
                checked={refundType === 'total'}
                onChange={() => {
                  setRefundType('total');
                  setFormError(null);
                }}
                className="sr-only"
              />
              Total ({formatMoney(maxRefundableCents, detail.currency)})
            </label>
            <label
              htmlFor={partialTypeId}
              className={cn(
                'cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors',
                refundType === 'partial'
                  ? 'border-primary bg-primary/10 text-atg-fg'
                  : 'border-atg-border text-atg-muted hover:border-atg-muted',
              )}
            >
              <input
                id={partialTypeId}
                type="radio"
                name="refundType"
                value="partial"
                checked={refundType === 'partial'}
                onChange={() => {
                  setRefundType('partial');
                  setFormError(null);
                }}
                className="sr-only"
              />
              Partiel
            </label>
          </div>
        </fieldset>

        {refundType === 'partial' ? (
          <Input
            id={partialAmountId}
            label={`Montant partiel (${detail.currency})`}
            type="number"
            min="0.01"
            step="0.01"
            max={(maxRefundableCents / 100).toFixed(2)}
            placeholder="Ex. 10,00"
            value={partialAmount}
            onChange={(e) => {
              setPartialAmount(e.target.value);
              setFormError(null);
            }}
            hint={`Maximum : ${formatMoney(maxRefundableCents, detail.currency)}`}
          />
        ) : null}

        <div>
          <label htmlFor={reasonId} className="mb-2 block text-sm font-medium text-atg-fg">
            Raison du remboursement
          </label>
          <textarea
            id={reasonId}
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setFormError(null);
            }}
            placeholder="Ex. Annulation client, erreur de facturation…"
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-atg-muted">
            Minimum {MIN_REASON_LENGTH} caractères (usage interne, non envoyé à Stripe).
          </p>
        </div>

        <div
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            previewInvalid
              ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40'
              : 'border-atg-border bg-atg-surface/60',
          )}
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">Aperçu</p>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-atg-muted">Montant remboursé</dt>
              <dd className="tabular-nums font-medium text-atg-fg">
                {previewAmountCents != null && !previewInvalid
                  ? formatMoney(previewAmountCents, detail.currency)
                  : refundType === 'total'
                    ? formatMoney(maxRefundableCents, detail.currency)
                    : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-atg-muted">Reste remboursable</dt>
              <dd className="tabular-nums text-atg-fg">
                {previewInvalid
                  ? formatMoney(maxRefundableCents, detail.currency)
                  : formatMoney(remainingAfterCents, detail.currency)}
              </dd>
            </div>
            {reason.trim() ? (
              <div className="border-t border-atg-border/60 pt-2">
                <dt className="text-atg-muted">Motif</dt>
                <dd className="mt-0.5 text-atg-fg">{truncateText(reason, 120)}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {formError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button type="submit" loading={submitting} loadingText="Remboursement…">
            Confirmer le remboursement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
