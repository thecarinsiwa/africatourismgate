'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { AlertDialog, Button, Card, Input, Skeleton, useToast } from '@africatourismgate/ui';
import type {
  BookingIdentityDocument,
  BookingItem,
  BookingManifestEntry,
  BookingPreferredPaymentMethod,
  BookingStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { documentForTravelerIndex } from '../../lib/booking-traveler-documents';
import { formatMoney } from '../../lib/format-money';
import { BookingTravelerDocumentModal } from './booking-traveler-document-modal';

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
  identityDocuments?: BookingIdentityDocument[];
  preferredPaymentMethod?: BookingPreferredPaymentMethod | null;
  canApprove: boolean;
  manifestSyncKey?: number;
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
  const starts = dated.map((item) => toDateOnlyString(item.startDate!)).sort();
  const ends = dated
    .map((item) => toDateOnlyString(item.endDate ?? item.startDate!))
    .sort();
  return {
    startDate: starts[0]!,
    endDate: ends[ends.length - 1]!,
  };
}

function toDateOnlyString(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1]! : value.slice(0, 10);
}

function addDaysToDateOnly(iso: string, days: number): string {
  const date = new Date(`${toDateOnlyString(iso)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function visitSpanDays(startDate: string, endDate: string): number {
  const start = new Date(`${toDateOnlyString(startDate)}T00:00:00Z`);
  const end = new Date(`${toDateOnlyString(endDate)}T00:00:00Z`);
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
  const priceCents = entry.priceCents ?? basePriceCents ?? null;
  return {
    key: entry.id,
    id: entry.id,
    fullName: entry.fullName,
    age: entry.age != null ? String(entry.age) : '',
    price: priceCents != null ? formatCentsToMoney(priceCents) : '',
    basePriceCents: basePriceCents ?? entry.priceCents ?? null,
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

function ReadOnlyMoneyField({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div>
      <p
        className={
          compact
            ? 'mb-1 text-xs font-medium uppercase tracking-wide text-atg-muted lg:sr-only lg:mb-0 lg:h-0 lg:overflow-hidden'
            : 'mb-2 text-sm font-medium text-atg-fg'
        }
      >
        {label}
      </p>
      <p className="flex h-[42px] items-center rounded-lg border border-atg-border/70 bg-atg-muted/10 px-3 text-sm tabular-nums text-atg-muted">
        {value}
      </p>
    </div>
  );
}

export function BookingAssistedApprovalPanel({
  bookingId,
  status,
  totalCents,
  currency,
  items,
  identityDocuments = [],
  preferredPaymentMethod = null,
  canApprove,
  manifestSyncKey = 0,
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
  const [approveDialogError, setApproveDialogError] = useState<string | null>(null);
  const [rejectDialogError, setRejectDialogError] = useState<string | null>(null);
  const [documentModalTravelerIndex, setDocumentModalTravelerIndex] = useState<number | null>(
    null,
  );

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
      } else {
        setTravelers([]);
      }
      setPricingDirty(false);
    } catch {
      setTravelers([]);
    } finally {
      setManifestLoading(false);
    }
  }, [bookingId, status, basePricesPerTraveler]);

  useEffect(() => {
    void loadManifest();
  }, [loadManifest, manifestSyncKey]);

  useEffect(() => {
    if (initialVisitDates) {
      setVisitStartDate(toDateOnlyString(initialVisitDates.startDate));
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

  async function runAction(
    action: () => Promise<void>,
    onSuccess?: () => void,
    options?: { onError?: (message: string) => void },
  ): Promise<boolean> {
    setActionError(null);
    setLoading(true);
    try {
      await action();
      await onUpdated();
      onSuccess?.();
      return true;
    } catch (error) {
      const message = getBookingsErrorMessage(error);
      setActionError(message);
      options?.onError?.(message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function buildVisitDatesPayload() {
    if (!hasVisitDates || !visitStartDate) {
      return null;
    }
    return {
      startDate: toDateOnlyString(visitStartDate),
      endDate: toDateOnlyString(computedVisitEndDate || visitStartDate),
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
    setApproveDialogError(null);
    const validationError = validateTravelers();
    if (validationError) {
      setApproveDialogError(validationError);
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
        setApproveDialogError(null);
        toast({ variant: 'success', message: t('approveSuccess') });
      },
      { onError: setApproveDialogError },
    );
  }

  async function handleReject() {
    setRejectDialogError(null);
    await runAction(
      async () => {
        await getApiClient().rejectBooking(bookingId, {
          reason: rejectReason.trim() || undefined,
        });
      },
      () => {
        setRejectDialogOpen(false);
        setRejectReason('');
        setRejectDialogError(null);
        toast({ variant: 'success', message: t('rejectSuccess') });
      },
      { onError: setRejectDialogError },
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
    if (pricingDirty) {
      const validationError = validateTravelers();
      if (validationError) {
        setActionError(validationError);
        return;
      }

      const parsedTotal = parseMoneyToCents(adjustedTotal);
      const travelerPayload = buildTravelerPayload();

      const saved = await runAction(
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
          void loadManifest();
        },
      );
      if (!saved) {
        return;
      }
    }

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
      return (
        <div className="overflow-hidden rounded-xl border border-atg-border">
          <div className="border-b border-atg-border bg-atg-muted/10 px-4 py-3">
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="space-y-0 divide-y divide-atg-border">
            <div className="px-4 py-4">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <div className="px-4 py-4">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
          <div className="border-t border-atg-border bg-atg-muted/5 px-4 py-4">
            <Skeleton className="ml-auto h-14 w-full max-w-sm rounded-lg" />
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-atg-border bg-atg-surface/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atg-border bg-atg-muted/10 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-atg-fg">{t('travelersTitle')}</h3>
            {travelers.length > 0 ? (
              <p className="mt-0.5 text-xs text-atg-muted">
                {t('travelersCount', { count: travelers.length })}
              </p>
            ) : null}
          </div>
          {editable ? (
            <Button type="button" size="sm" variant="outline" onClick={addTraveler} disabled={loading}>
              {t('addTraveler')}
            </Button>
          ) : null}
        </div>

        {travelers.length === 0 ? (
          <div className="border-b border-dashed border-atg-border/80 px-4 py-10 text-center">
            <p className="text-sm text-atg-muted">{t('noTravelersHint')}</p>
            {editable ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={addTraveler}
                disabled={loading}
              >
                {t('addTraveler')}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div
              className="hidden border-b border-atg-border bg-atg-muted/5 px-4 py-2 lg:grid lg:grid-cols-[2.25rem_minmax(0,1fr)_auto_5rem_7rem_7rem_5.5rem] lg:items-center lg:gap-3"
              aria-hidden
            >
              <span />
              <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('travelerName')}
              </span>
              <span className="hidden lg:block" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('travelerAge')}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('travelerBasePrice', { currency })}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('travelerPrice', { currency })}
              </span>
              <span />
            </div>

            <ul className="divide-y divide-atg-border">
              {travelers.map((traveler, index) => (
                <li key={traveler.key} className="px-4 py-4">
                  <div className="mb-3 flex items-center gap-2 lg:hidden">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-atg-fg">
                      {t('travelerNumber', { number: index + 1 })}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2.25rem_minmax(0,1fr)_auto_5rem_7rem_7rem_5.5rem] lg:items-end lg:gap-3">
                    <span
                      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary lg:flex"
                      aria-hidden
                    >
                      {index + 1}
                    </span>

                    <Input
                      label={t('travelerName')}
                      name={`traveler-name-${traveler.key}`}
                      value={traveler.fullName}
                      onChange={(e) => updateTraveler(traveler.key, { fullName: e.target.value })}
                      disabled={!editable || loading}
                      wrapperClassName="sm:col-span-2 lg:col-span-1 lg:[&>div:first-child]:sr-only lg:[&>div:first-child]:mb-0 lg:[&>div:first-child]:h-0"
                      inputClassName="py-2.5"
                    />

                    {canApprove ? (
                      <div className="flex items-end sm:col-span-2 lg:col-span-1 lg:justify-start">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full whitespace-nowrap sm:w-auto"
                          disabled={loading}
                          onClick={() => setDocumentModalTravelerIndex(index)}
                        >
                          {documentForTravelerIndex(identityDocuments, index)?.status ===
                          'pending_review'
                            ? t('viewDocumentPending')
                            : t('viewDocument')}
                        </Button>
                      </div>
                    ) : (
                      <span className="hidden lg:block" aria-hidden />
                    )}

                    <Input
                      label={t('travelerAge')}
                      name={`traveler-age-${traveler.key}`}
                      type="number"
                      min={0}
                      max={150}
                      value={traveler.age}
                      onChange={(e) => updateTraveler(traveler.key, { age: e.target.value })}
                      disabled={!editable || loading}
                      wrapperClassName="lg:[&>div:first-child]:sr-only lg:[&>div:first-child]:mb-0 lg:[&>div:first-child]:h-0"
                      inputClassName="py-2.5"
                    />

                    <ReadOnlyMoneyField
                      label={t('travelerBasePrice', { currency })}
                      compact
                      value={
                        traveler.basePriceCents != null
                          ? formatMoney(traveler.basePriceCents, currency)
                          : '—'
                      }
                    />

                    <Input
                      label={t('travelerPrice', { currency })}
                      name={`traveler-price-${traveler.key}`}
                      type="text"
                      inputMode="decimal"
                      value={traveler.price}
                      onChange={(e) => updateTraveler(traveler.key, { price: e.target.value })}
                      disabled={!editable || loading}
                      wrapperClassName="lg:[&>div:first-child]:sr-only lg:[&>div:first-child]:mb-0 lg:[&>div:first-child]:h-0"
                      inputClassName="py-2.5 tabular-nums"
                    />

                    {editable && travelers.length > 1 ? (
                      <div className="flex items-end sm:col-span-2 lg:col-span-1 lg:justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
                          onClick={() => removeTraveler(traveler.key)}
                          disabled={loading}
                        >
                          {t('removeTraveler')}
                        </Button>
                      </div>
                    ) : (
                      <span className="hidden lg:block" aria-hidden />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="border-t border-atg-border bg-atg-muted/5 px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">
            <div className="rounded-lg border border-atg-border/70 bg-atg-elevated px-4 py-3 sm:min-w-[11rem] sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t('subtotalLabel')}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-atg-fg">
                {formatMoney(subtotalCents, currency)}
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
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
                disabled={loading || !editable}
                inputClassName="py-2.5 tabular-nums font-semibold"
              />
            </div>
          </div>
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
                onClick={() => {
                  setApproveDialogError(null);
                  setApproveDialogOpen(true);
                }}
              >
                {t('approve')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="!border-red-300 !text-red-700 hover:!bg-red-50 dark:!text-red-400"
                disabled={loading}
                onClick={() => {
                  setRejectDialogError(null);
                  setRejectDialogOpen(true);
                }}
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
              {preferredPaymentMethod === 'cash' ? (
                <p className="w-full text-sm text-atg-muted">{t('cashPaymentHint')}</p>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  disabled={loading}
                  loading={loading}
                  onClick={() => void handleInvitePayment()}
                >
                  {t('invitePayment')}
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={(open) => {
          if (!loading) {
            setApproveDialogOpen(open);
            if (!open) {
              setApproveDialogError(null);
            }
          }
        }}
        title={t('approveDialog.title')}
        description={t('approveDialog.description')}
        confirmLabel={t('approve')}
        cancelLabel={tActions('cancel')}
        loading={loading}
        error={approveDialogError}
        containerClassName="z-[60]"
        onConfirm={() => void handleApprove()}
        onCancel={() => setApproveDialogOpen(false)}
      />

      <AlertDialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!loading) {
            setRejectDialogOpen(open);
            if (!open) {
              setRejectDialogError(null);
            }
          }
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
        error={rejectDialogError}
        containerClassName="z-[60]"
        onConfirm={() => void handleReject()}
        onCancel={() => setRejectDialogOpen(false)}
      />

      {documentModalTravelerIndex != null ? (
        <BookingTravelerDocumentModal
          bookingId={bookingId}
          travelerName={travelers[documentModalTravelerIndex]?.fullName ?? ''}
          travelerIndex={documentModalTravelerIndex}
          document={documentForTravelerIndex(identityDocuments, documentModalTravelerIndex)}
          canReview={canApprove}
          open
          onOpenChange={(open) => {
            if (!open) {
              setDocumentModalTravelerIndex(null);
            }
          }}
          onUpdated={onUpdated}
        />
      ) : null}
    </>
  );
}
