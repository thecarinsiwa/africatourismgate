'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Card, Input, useToast } from '@africatourismgate/ui';
import type { BookingItem, BookingManifestEntry, BookingStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { formatMoney } from '../../lib/format-money';

type TravelerDraft = {
  key: string;
  id?: string;
  fullName: string;
  age: string;
  price: string;
  basePriceCents?: number | null;
};

type BookingAssistedApprovalPanelProps = {
  bookingId: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  items: BookingItem[];
  canApprove: boolean;
  onUpdated: () => Promise<void>;
};

function expandBasePricesFromItems(items: BookingItem[]): number[] {
  const bases: number[] = [];
  for (const item of items) {
    for (let index = 0; index < item.quantity; index++) {
      bases.push(item.unitPriceCents);
    }
  }
  return bases;
}

function deriveVisitDatesFromItems(
  items: BookingItem[],
): { startDate: string; endDate: string } | null {
  const dated = items.filter((item) => item.startDate);
  if (dated.length === 0) {
    return null;
  }
  const starts = dated.map((item) => item.startDate!).sort();
  const ends = dated.map((item) => item.endDate ?? item.startDate!).sort();
  return {
    startDate: starts[0]!,
    endDate: ends[ends.length - 1]!,
  };
}

function addDaysToDateOnly(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function visitSpanDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function parseMoneyToCents(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed * 100);
}

function formatCentsToMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

function entryToDraft(entry: BookingManifestEntry, basePriceCents?: number | null): TravelerDraft {
  return {
    key: entry.id,
    id: entry.id,
    fullName: entry.fullName,
    age: entry.age != null ? String(entry.age) : '',
    price: entry.priceCents != null ? formatCentsToMoney(entry.priceCents) : '',
    basePriceCents: basePriceCents ?? null,
  };
}

function createEmptyTraveler(defaultPrice = '', basePriceCents?: number | null): TravelerDraft {
  return {
    key: crypto.randomUUID(),
    fullName: '',
    age: '',
    price: defaultPrice,
    basePriceCents: basePriceCents ?? null,
  };
}

export function BookingAssistedApprovalPanel({
  bookingId,
  status,
  totalCents,
  currency,
  items,
  canApprove,
  onUpdated,
}: BookingAssistedApprovalPanelProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.approval');
  const tActions = useTranslations('common.actions');
  const { toast } = useToast();
  const rejectReasonId = useId();
  const approveReasonId = useId();

  const [loading, setLoading] = useState(false);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveReason, setApproveReason] = useState('');
  const [travelers, setTravelers] = useState<TravelerDraft[]>([]);
  const [adjustedTotal, setAdjustedTotal] = useState(() => formatCentsToMoney(totalCents));
  const [totalTouched, setTotalTouched] = useState(false);
  const [pricingDirty, setPricingDirty] = useState(false);
  const [visitStartDate, setVisitStartDate] = useState('');
  const [visitDatesDirty, setVisitDatesDirty] = useState(false);

  const initialVisitDates = useMemo(() => deriveVisitDatesFromItems(items), [items]);
  const hasVisitDates = initialVisitDates != null;
  const visitSpanDaysCount = useMemo(() => {
    if (!initialVisitDates) {
      return 0;
    }
    return visitSpanDays(initialVisitDates.startDate, initialVisitDates.endDate);
  }, [initialVisitDates]);

  const computedVisitEndDate = useMemo(() => {
    if (!visitStartDate) {
      return '';
    }
    return addDaysToDateOnly(visitStartDate, visitSpanDaysCount);
  }, [visitStartDate, visitSpanDaysCount]);

  const subtotalCents = useMemo(() => {
    return travelers.reduce((sum, traveler) => {
      const cents = parseMoneyToCents(traveler.price);
      return sum + (cents ?? 0);
    }, 0);
  }, [travelers]);

  const basePricesPerTraveler = useMemo(() => expandBasePricesFromItems(items), [items]);

  const loadManifest = useCallback(async () => {
    setManifestLoading(true);
    try {
      const entries = await getApiClient().listBookingManifestEntries(bookingId);
      if (entries.length > 0) {
        setTravelers(
          entries.map((entry, index) =>
            entryToDraft(entry, basePricesPerTraveler[index] ?? null),
          ),
        );
      } else if (status === 'pending_approval') {
        if (basePricesPerTraveler.length > 0) {
          setTravelers(
            basePricesPerTraveler.map((basePriceCents, index) => ({
              key: crypto.randomUUID(),
              fullName:
                basePricesPerTraveler.length === 1
                  ? t('defaultTravelerName')
                  : `${t('defaultTravelerName')} ${index + 1}`,
              age: '',
              price: formatCentsToMoney(basePriceCents),
              basePriceCents,
            })),
          );
        } else {
          setTravelers([
            {
              key: crypto.randomUUID(),
              fullName: t('defaultTravelerName'),
              age: '',
              price: formatCentsToMoney(totalCents),
              basePriceCents: totalCents > 0 ? totalCents : null,
            },
          ]);
        }
      } else {
        setTravelers([]);
      }
      setPricingDirty(false);
    } catch {
      setTravelers([]);
    } finally {
      setManifestLoading(false);
    }
  }, [bookingId, status, t, totalCents, basePricesPerTraveler]);

  useEffect(() => {
    void loadManifest();
  }, [loadManifest]);

  useEffect(() => {
    if (initialVisitDates) {
      setVisitStartDate(initialVisitDates.startDate);
      setVisitDatesDirty(false);
    }
  }, [initialVisitDates]);

  useEffect(() => {
    if (!totalTouched) {
      setAdjustedTotal(formatCentsToMoney(subtotalCents > 0 ? subtotalCents : totalCents));
    }
  }, [subtotalCents, totalCents, totalTouched]);

  useEffect(() => {
    setAdjustedTotal(formatCentsToMoney(totalCents));
    setTotalTouched(false);
  }, [totalCents]);

  if (!canApprove) {
    return null;
  }

  if (status !== 'pending_approval' && status !== 'pending_payment') {
    return null;
  }

  function buildTravelerPayload() {
    return travelers
      .map((traveler) => {
        const priceCents = parseMoneyToCents(traveler.price);
        const fullName = traveler.fullName.trim();
        if (!fullName || priceCents == null) {
          return null;
        }
        const ageTrimmed = traveler.age.trim();
        const ageParsed = ageTrimmed ? Number.parseInt(ageTrimmed, 10) : undefined;
        return {
          id: traveler.id,
          fullName,
          age: ageParsed != null && !Number.isNaN(ageParsed) ? ageParsed : undefined,
          priceCents,
        };
      })
      .filter((traveler): traveler is NonNullable<typeof traveler> => traveler != null);
  }

  function validateTravelers(): string | null {
    const payload = buildTravelerPayload();
    if (payload.length === 0) {
      return t('travelerRequired');
    }
    if (travelers.some((traveler) => !traveler.fullName.trim())) {
      return t('travelerNameRequired');
    }
    if (travelers.some((traveler) => parseMoneyToCents(traveler.price) == null)) {
      return t('travelerPriceRequired');
    }
    return null;
  }

  async function runAction(action: () => Promise<void>, onSuccess?: () => void) {
    setActionError(null);
    setLoading(true);
    try {
      await action();
      await onUpdated();
      onSuccess?.();
    } catch (error) {
      setActionError(getBookingsErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function buildVisitDatesPayload() {
    if (!hasVisitDates || !visitStartDate) {
      return null;
    }
    return {
      startDate: visitStartDate,
      endDate: computedVisitEndDate || visitStartDate,
    };
  }

  async function handleSaveVisitDates() {
    const payload = buildVisitDatesPayload();
    if (!payload) {
      return;
    }

    await runAction(
      async () => {
        await getApiClient().updateBookingVisitDates(bookingId, payload);
      },
      () => {
        setVisitDatesDirty(false);
        toast({ variant: 'success', message: t('visitDatesSaved') });
      },
    );
  }

  async function handleApprove() {
    const validationError = validateTravelers();
    if (validationError) {
      setActionError(validationError);
      return;
    }

    const parsedTotal = parseMoneyToCents(adjustedTotal);
    const travelerPayload = buildTravelerPayload();
    const visitPayload = buildVisitDatesPayload();

    await runAction(
      async () => {
        await getApiClient().approveBooking(bookingId, {
          reason: approveReason.trim() || undefined,
          travelers: travelerPayload,
          ...(parsedTotal != null ? { totalCents: parsedTotal } : {}),
          ...(visitPayload
            ? {
                visitStartDate: visitPayload.startDate,
                visitEndDate: visitPayload.endDate,
              }
            : {}),
        });
      },
      () => {
        setApproveDialogOpen(false);
        setApproveReason('');
        toast({ variant: 'success', message: t('approveSuccess') });
      },
    );
  }

  async function handleReject() {
    await runAction(
      async () => {
        await getApiClient().rejectBooking(bookingId, {
          reason: rejectReason.trim() || undefined,
        });
      },
      () => {
        setRejectDialogOpen(false);
        setRejectReason('');
        toast({ variant: 'success', message: t('rejectSuccess') });
      },
    );
  }

  async function handleSavePricing() {
    const validationError = validateTravelers();
    if (validationError) {
      setActionError(validationError);
      return;
    }

    const parsedTotal = parseMoneyToCents(adjustedTotal);
    const travelerPayload = buildTravelerPayload();

    await runAction(
      async () => {
        await getApiClient().updateBookingPricing(bookingId, {
          travelers: travelerPayload.map((traveler) => ({
            id: traveler.id,
            fullName: traveler.fullName,
            age: traveler.age,
            priceCents: traveler.priceCents,
          })),
          ...(parsedTotal != null ? { totalCents: parsedTotal } : {}),
        });
      },
      () => {
        setPricingDirty(false);
        toast({ variant: 'success', message: t('pricingSaved') });
        void loadManifest();
      },
    );
  }

  async function handleInvitePayment() {
    await runAction(async () => {
      const session = await getApiClient().inviteBookingPayment(bookingId);
      toast({
        variant: 'success',
        message: t('inviteSuccess', { url: session.url }),
      });
    });
  }

  function updateTraveler(key: string, patch: Partial<TravelerDraft>) {
    setTravelers((prev) =>
      prev.map((traveler) => (traveler.key === key ? { ...traveler, ...patch } : traveler)),
    );
    setPricingDirty(true);
  }

  function removeTraveler(key: string) {
    setTravelers((prev) => prev.filter((traveler) => traveler.key !== key));
    setPricingDirty(true);
  }

  function addTraveler() {
    const nextBasePrice = basePricesPerTraveler[travelers.length] ?? null;
    const defaultPrice =
      nextBasePrice != null ? formatCentsToMoney(nextBasePrice) : '';
    setTravelers((prev) => [...prev, createEmptyTraveler(defaultPrice, nextBasePrice)]);
    setPricingDirty(true);
  }

  function renderVisitDatesEditor(editable: boolean) {
    if (!hasVisitDates) {
      return null;
    }

    return (
      <div className="space-y-3 rounded-lg border border-atg-border bg-atg-surface/50 p-3">
        <h3 className="text-sm font-semibold text-atg-fg">{t('visitDatesTitle')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t('visitStartDate')}
            name="visitStartDate"
            type="date"
            value={visitStartDate}
            onChange={(e) => {
              setVisitStartDate(e.target.value);
              setVisitDatesDirty(true);
            }}
            disabled={!editable || loading}
          />
          <div>
            <p className="mb-1 text-sm font-medium text-atg-fg">{t('visitEndDate')}</p>
            <p className="flex h-11 items-center rounded-lg border border-atg-border bg-atg-muted/20 px-3 text-sm tabular-nums text-atg-muted">
              {computedVisitEndDate || '—'}
            </p>
            <p className="mt-1 text-xs text-atg-muted">{t('visitEndDateAutoHint')}</p>
          </div>
        </div>
        {editable && status === 'pending_payment' ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading || !visitDatesDirty}
            onClick={() => void handleSaveVisitDates()}
          >
            {t('saveVisitDates')}
          </Button>
        ) : null}
      </div>
    );
  }

  function renderTravelerPricingEditor(editable: boolean) {
    if (manifestLoading) {
      return <p className="text-sm text-atg-muted">{t('loadingTravelers')}</p>;
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-atg-fg">{t('travelersTitle')}</h3>
          {editable ? (
            <Button type="button" size="sm" variant="outline" onClick={addTraveler}>
              {t('addTraveler')}
            </Button>
          ) : null}
        </div>

        {travelers.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('noTravelersHint')}</p>
        ) : (
          <div className="space-y-3">
            {travelers.map((traveler) => (
              <div
                key={traveler.key}
                className="grid gap-3 rounded-lg border border-atg-border bg-atg-surface/50 p-3 sm:grid-cols-[1fr_5rem_7rem_8rem_auto]"
              >
                <Input
                  label={t('travelerName')}
                  name={`traveler-name-${traveler.key}`}
                  value={traveler.fullName}
                  onChange={(e) => updateTraveler(traveler.key, { fullName: e.target.value })}
                  disabled={!editable || loading}
                />
                <Input
                  label={t('travelerAge')}
                  name={`traveler-age-${traveler.key}`}
                  type="number"
                  min={0}
                  max={150}
                  value={traveler.age}
                  onChange={(e) => updateTraveler(traveler.key, { age: e.target.value })}
                  disabled={!editable || loading}
                />
                <div>
                  <p className="mb-1 text-sm font-medium text-atg-fg">
                    {t('travelerBasePrice', { currency })}
                  </p>
                  <p className="flex h-11 items-center rounded-lg border border-atg-border bg-atg-muted/20 px-3 text-sm tabular-nums text-atg-muted">
                    {traveler.basePriceCents != null
                      ? formatMoney(traveler.basePriceCents, currency)
                      : '—'}
                  </p>
                </div>
                <Input
                  label={t('travelerPrice', { currency })}
                  name={`traveler-price-${traveler.key}`}
                  type="text"
                  inputMode="decimal"
                  value={traveler.price}
                  onChange={(e) => updateTraveler(traveler.key, { price: e.target.value })}
                  disabled={!editable || loading}
                />
                {editable && travelers.length > 1 ? (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="!border-red-300 !text-red-700 dark:!text-red-400"
                      onClick={() => removeTraveler(traveler.key)}
                      disabled={loading}
                    >
                      {t('removeTraveler')}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-atg-border bg-atg-muted/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {t('subtotalLabel')}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-atg-fg">
              {formatCentsToMoney(subtotalCents)} {currency}
            </p>
          </div>
          <Input
            label={t('totalLabel', { currency })}
            name="adjustedTotal"
            type="text"
            inputMode="decimal"
            value={adjustedTotal}
            onChange={(e) => {
              setTotalTouched(true);
              setAdjustedTotal(e.target.value);
              setPricingDirty(true);
            }}
            hint={t('totalOverrideHint')}
            disabled={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Card variant="dashboard" padding="md" className="space-y-4 border-primary/20">
        <h2 className="text-lg font-semibold text-atg-fg">{t('title')}</h2>
        <p className="text-sm text-atg-muted">{t('intro')}</p>

        {actionError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {actionError}
          </p>
        ) : null}

        {status === 'pending_approval' ? (
          <div className="space-y-4">
            {renderVisitDatesEditor(true)}
            {renderTravelerPricingEditor(true)}
            <div>
              <label htmlFor={approveReasonId} className="mb-1 block text-sm font-medium text-atg-fg">
                {t('reasonLabel')}
              </label>
              <textarea
                id={approveReasonId}
                rows={2}
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                placeholder={t('reasonPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor={rejectReasonId} className="mb-1 block text-sm font-medium text-atg-fg">
                {t('rejectReasonLabel')}
              </label>
              <textarea
                id={rejectReasonId}
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg"
                placeholder={t('rejectReasonPlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="primary"
                disabled={loading || validateTravelers() != null}
                onClick={() => setApproveDialogOpen(true)}
              >
                {t('approve')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!border-red-300 !text-red-700 hover:!bg-red-50 dark:!text-red-400"
                disabled={loading}
                onClick={() => setRejectDialogOpen(true)}
              >
                {t('reject')}
              </Button>
            </div>
          </div>
        ) : null}

        {status === 'pending_payment' ? (
          <div className="space-y-4">
            {renderVisitDatesEditor(true)}
            {renderTravelerPricingEditor(true)}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                disabled={loading || !pricingDirty}
                onClick={() => void handleSavePricing()}
              >
                {t('savePricing')}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={loading}
                loading={loading}
                onClick={() => void handleInvitePayment()}
              >
                {t('invitePayment')}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(open) => {
          if (!loading) setApproveDialogOpen(open);
        }}
        title={t('approveDialog.title')}
        description={t('approveDialog.description')}
        confirmLabel={t('approve')}
        cancelLabel={tActions('cancel')}
        loading={loading}
        onConfirm={() => void handleApprove()}
        onCancel={() => setApproveDialogOpen(false)}
      />

      <AlertDialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!loading) setRejectDialogOpen(open);
        }}
        title={t('rejectDialog.title')}
        description={
          rejectReason.trim()
            ? t('rejectDialog.descriptionWithReason', { reason: rejectReason.trim() })
            : t('rejectDialog.description')
        }
        confirmLabel={t('reject')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={loading}
        onConfirm={() => void handleReject()}
        onCancel={() => setRejectDialogOpen(false)}
      />
    </>
  );
}
