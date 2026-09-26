'use client';

import {
  Button,
  cn,
  Input,
  Select,
  useToast,
} from '@africatourismgate/ui';
import type {
  BookingListItem,
  CreateFundEntryRequest,
  FundEntry,
  FundEntrySource,
  OrganizationListItem,
  TreasuryPaymentMethod,
  UpdateFundEntryRequest,
} from '@africatourismgate/types';
import {
  FUND_ENTRY_SOURCES,
  TREASURY_PAYMENT_METHODS,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useFundEntrySourceLabels,
  useTreasuryPaymentMethodLabels,
} from '../../lib/i18n/use-module-labels';

const SEARCH_DEBOUNCE_MS = 300;
const CURRENCY_OPTIONS = ['XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;

export type FundEntryFormValues = {
  organizationId: string;
  amountMajor: string;
  currency: string;
  operationDate: string;
  source: FundEntrySource | '';
  paymentMethod: TreasuryPaymentMethod | '';
  reference: string;
  notes: string;
  bookingIds: string[];
};

const defaultValues: FundEntryFormValues = {
  organizationId: '',
  amountMajor: '',
  currency: 'XOF',
  operationDate: new Date().toISOString().slice(0, 10),
  source: '',
  paymentMethod: '',
  reference: '',
  notes: '',
  bookingIds: [],
};

function centsToMajorString(cents: number): string {
  return (cents / 100).toFixed(2);
}

function parseMoneyToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed * 100);
}

function entryToFormValues(entry: FundEntry): FundEntryFormValues {
  return {
    organizationId: entry.organizationId,
    amountMajor: centsToMajorString(entry.amountCents),
    currency: entry.currency,
    operationDate: entry.operationDate.slice(0, 10),
    source: entry.source,
    paymentMethod: entry.paymentMethod,
    reference: entry.reference ?? '',
    notes: entry.notes ?? '',
    bookingIds: [...(entry.bookingIds ?? [])],
  };
}

function formatBookingLabel(booking: BookingListItem): string {
  const name = `${booking.clientFirstName} ${booking.clientLastName}`.trim();
  const ref = booking.id.slice(0, 8);
  return `${ref}… — ${name || booking.clientEmail} (${formatMoney(booking.totalCents, booking.currency)})`;
}

type FundEntryFormProps = {
  mode: 'create' | 'edit';
  fundEntryId?: string;
  initialEntry?: FundEntry;
};

export function FundEntryForm({
  mode,
  fundEntryId,
  initialEntry,
}: FundEntryFormProps) {
  const t = useTranslations('modules.treasury.entries.form');
  const tFields = useTranslations('modules.treasury.entries.form.fields');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const sourceLabels = useFundEntrySourceLabels();
  const paymentMethodLabels = useTreasuryPaymentMethodLabels();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FundEntryFormValues>(() =>
    initialEntry ? entryToFormValues(initialEntry) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FundEntryFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const [bookingSearchInput, setBookingSearchInput] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingResults, setBookingResults] = useState<BookingListItem[]>([]);
  const [bookingLabels, setBookingLabels] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      for (const id of initialEntry?.bookingIds ?? []) {
        map[id] = `${id.slice(0, 8)}…`;
      }
      return map;
    },
  );
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const commonErrors = useMemo(
    () => ({
      network: tCommonErrors('network'),
      forbidden: tErrors('forbidden'),
      generic: tErrors('saveFailed'),
      apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
    }),
    [tCommonErrors, tErrors],
  );

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (cancelled) return;
        const write =
          me.isSuperAdmin || me.permissions.includes('treasury.entries.write');
        setCanWrite(write);
        setIsSuperAdmin(me.isSuperAdmin);
        setAuthReady(true);
        if (mode === 'create' && me.user.organizationId) {
          setValues((prev) =>
            prev.organizationId
              ? prev
              : { ...prev, organizationId: me.user.organizationId ?? '' },
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanWrite(false);
          setAuthReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    void getApiClient()
      .listOrganizations({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled) setOrganizations(result.data);
      })
      .catch(() => {
        if (!cancelled) setOrganizations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    const query = bookingSearchInput.trim();
    const timer = window.setTimeout(() => setBookingSearch(query), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [bookingSearchInput]);

  useEffect(() => {
    let cancelled = false;
    async function searchBookings() {
      if (!bookingSearch) {
        setBookingResults([]);
        return;
      }
      setBookingsLoading(true);
      try {
        const result = await getApiClient().listBookings({
          page: 1,
          limit: 20,
          search: bookingSearch,
          organizationId: values.organizationId || undefined,
        });
        if (cancelled) return;
        setBookingResults(result.data);
        setBookingLabels((prev) => {
          const next = { ...prev };
          for (const booking of result.data) {
            next[booking.id] = formatBookingLabel(booking);
          }
          return next;
        });
      } catch {
        if (!cancelled) setBookingResults([]);
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    }
    void searchBookings();
    return () => {
      cancelled = true;
    };
  }, [bookingSearch, values.organizationId]);

  const updateField = useCallback(
    <K extends keyof FundEntryFormValues>(key: K, value: FundEntryFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const toggleBooking = useCallback((booking: BookingListItem) => {
    setValues((prev) => {
      const exists = prev.bookingIds.includes(booking.id);
      return {
        ...prev,
        bookingIds: exists
          ? prev.bookingIds.filter((id) => id !== booking.id)
          : [...prev.bookingIds, booking.id],
      };
    });
    setBookingLabels((prev) => ({
      ...prev,
      [booking.id]: formatBookingLabel(booking),
    }));
  }, []);

  const removeBooking = useCallback((bookingId: string) => {
    setValues((prev) => ({
      ...prev,
      bookingIds: prev.bookingIds.filter((id) => id !== bookingId),
    }));
  }, []);

  const sourceOptions = useMemo(
    () =>
      FUND_ENTRY_SOURCES.map((value) => ({
        value,
        label: sourceLabels[value],
      })),
    [sourceLabels],
  );

  const paymentMethodOptions = useMemo(
    () =>
      TREASURY_PAYMENT_METHODS.map((value) => ({
        value,
        label: paymentMethodLabels[value],
      })),
    [paymentMethodLabels],
  );

  const currencyOptions = useMemo(
    () => CURRENCY_OPTIONS.map((code) => ({ value: code, label: code })),
    [],
  );

  const organizationOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...organizations.map((org) => ({ value: org.id, label: org.name })),
    ],
    [organizations],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof FundEntryFormValues, string>> = {};
    if (mode === 'create' && !values.organizationId.trim()) {
      errors.organizationId = t('validation.organizationRequired');
    }
    const amountCents = parseMoneyToCents(values.amountMajor);
    if (amountCents == null) {
      errors.amountMajor = t('validation.amountPositive');
    }
    if (!/^[A-Z]{3}$/.test(values.currency.trim().toUpperCase())) {
      errors.currency = t('validation.currencyRequired');
    }
    if (!values.operationDate) {
      errors.operationDate = t('validation.operationDateRequired');
    }
    if (!values.source) {
      errors.source = t('validation.sourceRequired');
    }
    if (!values.paymentMethod) {
      errors.paymentMethod = t('validation.paymentMethodRequired');
    }
    if (values.source === 'other' && !values.notes.trim()) {
      errors.notes = t('validation.notesRequiredForOther');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function uploadPending(entryId: string): Promise<void> {
    for (const file of pendingFiles) {
      const body = new FormData();
      body.append('file', file);
      await getApiClient().uploadFundEntryAttachment(entryId, body);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!canWrite) {
      setFormError(t('accessDenied'));
      return;
    }
    if (!validate()) return;

    const amountCents = parseMoneyToCents(values.amountMajor);
    if (amountCents == null) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const payload: CreateFundEntryRequest = {
          organizationId: values.organizationId,
          amountCents,
          currency: values.currency.trim().toUpperCase(),
          operationDate: values.operationDate,
          source: values.source as FundEntrySource,
          paymentMethod: values.paymentMethod as TreasuryPaymentMethod,
          reference: values.reference.trim() || null,
          notes: values.notes.trim() || null,
          bookingIds: values.bookingIds,
        };
        const created = await client.createFundEntry(payload);
        if (pendingFiles.length > 0) {
          await uploadPending(created.id);
        }
        toast({
          variant: 'success',
          title: t('toast.createdTitle'),
          message: t('toast.createdMessage'),
        });
        router.push(`/tresorerie/entrees/${created.id}`);
        router.refresh();
      } else if (fundEntryId) {
        const payload: UpdateFundEntryRequest = {
          amountCents,
          currency: values.currency.trim().toUpperCase(),
          operationDate: values.operationDate,
          source: values.source as FundEntrySource,
          paymentMethod: values.paymentMethod as TreasuryPaymentMethod,
          reference: values.reference.trim() || null,
          notes: values.notes.trim() || null,
          bookingIds: values.bookingIds,
        };
        await client.updateFundEntry(fundEntryId, payload);
        toast({
          variant: 'success',
          title: t('toast.updatedTitle'),
          message: t('toast.updatedMessage'),
        });
        router.push('/tresorerie/entrees');
        router.refresh();
      }
    } catch (error) {
      const message = resolveUnknownApiError(error, commonErrors, {
        useParseApiMessage: true,
        forbidden: t('accessDenied'),
      });
      setFormError(message);
      toast({
        variant: 'error',
        title: t('toast.errorTitle'),
        message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (authReady && !canWrite) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {t('accessDenied')}
      </p>
    );
  }

  const disabled = !canWrite || submitting || (initialEntry?.status === 'voided');

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      {isSuperAdmin && mode === 'create' ? (
        <Select
          label={t('organization')}
          value={values.organizationId}
          options={organizationOptions}
          onChange={(e) => updateField('organizationId', e.target.value)}
          error={fieldErrors.organizationId}
          required
          disabled={disabled}
        />
      ) : null}

      <Input
        label={tFields('amountCents')}
        name="amountMajor"
        type="text"
        inputMode="decimal"
        value={values.amountMajor}
        onChange={(e) => updateField('amountMajor', e.target.value)}
        error={fieldErrors.amountMajor}
        hint={t('hints.amountCents')}
        required
        disabled={disabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={tFields('currency')}
          value={values.currency}
          options={currencyOptions}
          onChange={(e) => updateField('currency', e.target.value)}
          error={fieldErrors.currency}
          required
          disabled={disabled}
        />
        <Input
          label={tFields('operationDate')}
          name="operationDate"
          type="date"
          value={values.operationDate}
          onChange={(e) => updateField('operationDate', e.target.value)}
          error={fieldErrors.operationDate}
          required
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={tFields('source')}
          value={values.source}
          options={[{ value: '', label: '—' }, ...sourceOptions]}
          onChange={(e) =>
            updateField('source', e.target.value as FundEntrySource | '')
          }
          error={fieldErrors.source}
          required
          disabled={disabled}
        />
        <Select
          label={tFields('paymentMethod')}
          value={values.paymentMethod}
          options={[{ value: '', label: '—' }, ...paymentMethodOptions]}
          onChange={(e) =>
            updateField(
              'paymentMethod',
              e.target.value as TreasuryPaymentMethod | '',
            )
          }
          error={fieldErrors.paymentMethod}
          required
          disabled={disabled}
        />
      </div>

      <Input
        label={tFields('reference')}
        name="reference"
        value={values.reference}
        onChange={(e) => updateField('reference', e.target.value)}
        disabled={disabled}
      />

      <Input
        label={tFields('notes')}
        name="notes"
        value={values.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        error={fieldErrors.notes}
        hint={values.source === 'other' ? t('hints.sourceOther') : undefined}
        disabled={disabled}
      />

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-sm font-medium text-atg-fg">
            {tFields('bookingIds')}
          </p>
          <p className="mb-2 text-xs text-atg-muted">{t('hints.bookingIds')}</p>
          <p className="mb-2 text-xs text-atg-muted">
            {t('bookingsSelected', { count: values.bookingIds.length })}
          </p>
        </div>

        {values.bookingIds.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {values.bookingIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeBooking(id)}
                  className="rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-atg-fg hover:bg-primary/10"
                >
                  {bookingLabels[id] ?? `${id.slice(0, 8)}…`} ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <Input
          name="bookingsSearch"
          type="search"
          value={bookingSearchInput}
          onChange={(e) => setBookingSearchInput(e.target.value)}
          placeholder={t('bookingsSearch')}
          aria-label={t('bookingsSearchAria')}
          disabled={disabled}
        />

        {bookingsLoading ? (
          <p className="text-sm text-atg-muted">{t('bookingsLoading')}</p>
        ) : bookingSearch && bookingResults.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('bookingsEmpty')}</p>
        ) : bookingResults.length > 0 ? (
          <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {bookingResults.map((booking) => {
              const selected = values.bookingIds.includes(booking.id);
              return (
                <button
                  key={booking.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleBooking(booking)}
                  aria-pressed={selected}
                  className={cn(
                    'min-w-0 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                    selected
                      ? 'border-primary bg-primary/5 font-medium text-atg-fg'
                      : 'border-atg-border bg-atg-elevated text-atg-muted hover:border-primary/40 hover:text-atg-fg',
                  )}
                >
                  {formatBookingLabel(booking)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {mode === 'create' ? (
        <div className="space-y-2 rounded-lg border border-dashed border-atg-border p-4">
          <p className="text-sm font-medium text-atg-fg">
            {t('attachments.title')}
          </p>
          <p className="text-xs text-atg-muted">{t('attachments.pendingHint')}</p>
          <Input
            name="pendingAttachments"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setPendingFiles((prev) => [...prev, file]);
            }}
            label={t('attachments.upload')}
          />
          {pendingFiles.length > 0 ? (
            <ul className="space-y-1 text-sm text-atg-muted">
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex justify-between gap-2">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() =>
                      setPendingFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    {t('attachments.remove')}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={disabled}>
          {submitting
            ? tCommon('loading')
            : mode === 'create'
              ? t('submitCreate')
              : t('submitUpdate')}
        </Button>
        <Button href="/tresorerie/entrees" variant="outline" disabled={submitting}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
