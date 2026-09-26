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
  CreateFundExitRequest,
  ExpenseRequest,
  FundExit,
  OrganizationListItem,
  TreasuryPaymentMethod,
  UpdateFundExitRequest,
} from '@africatourismgate/types';
import { TREASURY_PAYMENT_METHODS } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import { useTreasuryPaymentMethodLabels } from '../../lib/i18n/use-module-labels';

const SEARCH_DEBOUNCE_MS = 300;
const CURRENCY_OPTIONS = ['XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;

type FormValues = {
  organizationId: string;
  expenseRequestId: string;
  amountMajor: string;
  currency: string;
  operationDate: string;
  paymentMethod: TreasuryPaymentMethod | '';
  reference: string;
  notes: string;
  bookingIds: string[];
};

const defaultValues: FormValues = {
  organizationId: '',
  expenseRequestId: '',
  amountMajor: '',
  currency: 'XOF',
  operationDate: new Date().toISOString().slice(0, 10),
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
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

function exitToFormValues(exit: FundExit): FormValues {
  return {
    organizationId: exit.organizationId,
    expenseRequestId: exit.expenseRequestId,
    amountMajor: centsToMajorString(exit.amountCents),
    currency: exit.currency,
    operationDate: exit.operationDate.slice(0, 10),
    paymentMethod: exit.paymentMethod,
    reference: exit.reference ?? '',
    notes: exit.notes ?? '',
    bookingIds: [...(exit.bookingIds ?? [])],
  };
}

function formatBookingLabel(booking: BookingListItem): string {
  const name = `${booking.clientFirstName} ${booking.clientLastName}`.trim();
  const ref = booking.id.slice(0, 8);
  return `${ref}… — ${name || booking.clientEmail} (${formatMoney(booking.totalCents, booking.currency)})`;
}

function formatEligibleLabel(req: ExpenseRequest): string {
  return `${req.title} — ${formatMoney(req.requestedAmountCents, req.currency)} (${req.id.slice(0, 8)}…)`;
}

type FundExitFormProps = {
  mode: 'create' | 'edit';
  fundExitId?: string;
  initialExit?: FundExit;
  /** Prefill from query / workflow link */
  initialExpenseRequestId?: string;
};

export function FundExitForm({
  mode,
  fundExitId,
  initialExit,
  initialExpenseRequestId,
}: FundExitFormProps) {
  const t = useTranslations('modules.treasury.exits.form');
  const tFields = useTranslations('modules.treasury.exits.form.fields');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const paymentMethodLabels = useTreasuryPaymentMethodLabels();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>(() => {
    if (initialExit) return exitToFormValues(initialExit);
    return {
      ...defaultValues,
      expenseRequestId: initialExpenseRequestId ?? '',
    };
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [eligible, setEligible] = useState<ExpenseRequest[]>([]);
  const [eligibleLoading, setEligibleLoading] = useState(mode === 'create');
  const [linkedRequest, setLinkedRequest] = useState<ExpenseRequest | null>(null);

  const [bookingSearchInput, setBookingSearchInput] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingResults, setBookingResults] = useState<BookingListItem[]>([]);
  const [bookingLabels, setBookingLabels] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      for (const id of initialExit?.bookingIds ?? []) {
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
          me.isSuperAdmin || me.permissions.includes('treasury.exits.write');
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
    if (mode !== 'create') return;
    let cancelled = false;
    setEligibleLoading(true);
    void getApiClient()
      .listExpenseRequests({ page: 1, limit: 100, status: 'authorized' })
      .then((result) => {
        if (cancelled) return;
        setEligible(result.data);
        const prefillId = initialExpenseRequestId;
        if (prefillId) {
          const match = result.data.find((r) => r.id === prefillId);
          if (match) {
            setValues((prev) => ({
              ...prev,
              expenseRequestId: match.id,
              organizationId: match.organizationId,
              currency: match.currency,
              amountMajor: prev.amountMajor || centsToMajorString(match.requestedAmountCents),
            }));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setEligible([]);
      })
      .finally(() => {
        if (!cancelled) setEligibleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, initialExpenseRequestId]);

  useEffect(() => {
    if (mode !== 'edit' || !initialExit?.expenseRequestId) return;
    let cancelled = false;
    void getApiClient()
      .getExpenseRequest(initialExit.expenseRequestId)
      .then((req) => {
        if (!cancelled) setLinkedRequest(req);
      })
      .catch(() => {
        if (!cancelled) setLinkedRequest(null);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, initialExit?.expenseRequestId]);

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
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const selectExpenseRequest = useCallback((requestId: string) => {
    setValues((prev) => {
      const match = eligible.find((r) => r.id === requestId);
      if (!match) {
        return { ...prev, expenseRequestId: requestId };
      }
      return {
        ...prev,
        expenseRequestId: match.id,
        organizationId: match.organizationId,
        currency: match.currency,
        amountMajor: prev.amountMajor || centsToMajorString(match.requestedAmountCents),
      };
    });
    setFieldErrors((prev) => ({ ...prev, expenseRequestId: undefined }));
  }, [eligible]);

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

  const eligibleOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...eligible.map((req) => ({
        value: req.id,
        label: formatEligibleLabel(req),
      })),
    ],
    [eligible],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (mode === 'create') {
      if (!values.expenseRequestId.trim()) {
        errors.expenseRequestId = t('validation.expenseRequestRequired');
      }
      if (!values.organizationId.trim()) {
        errors.organizationId = t('validation.organizationRequired');
      }
      if (eligible.length === 0 && !values.expenseRequestId) {
        errors.expenseRequestId = t('validation.noEligibleRequest');
      }
    }
    if (parseMoneyToCents(values.amountMajor) == null) {
      errors.amountMajor = t('validation.amountPositive');
    }
    if (!/^[A-Z]{3}$/.test(values.currency.trim().toUpperCase())) {
      errors.currency = t('validation.currencyRequired');
    }
    if (!values.operationDate) {
      errors.operationDate = t('validation.operationDateRequired');
    }
    if (!values.paymentMethod) {
      errors.paymentMethod = t('validation.paymentMethodRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function uploadPending(exitId: string): Promise<void> {
    for (const file of pendingFiles) {
      const body = new FormData();
      body.append('file', file);
      await getApiClient().uploadFundExitAttachment(exitId, body);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!canWrite) {
      setFormError(t('accessDenied'));
      return;
    }
    if (mode === 'create' && !values.expenseRequestId.trim()) {
      setFormError(t('validation.expenseRequestRequired'));
      setFieldErrors((prev) => ({
        ...prev,
        expenseRequestId: t('validation.expenseRequestRequired'),
      }));
      return;
    }
    if (!validate()) return;

    const amountCents = parseMoneyToCents(values.amountMajor);
    if (amountCents == null) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const payload: CreateFundExitRequest = {
          organizationId: values.organizationId,
          expenseRequestId: values.expenseRequestId,
          amountCents,
          currency: values.currency.trim().toUpperCase(),
          operationDate: values.operationDate,
          paymentMethod: values.paymentMethod as TreasuryPaymentMethod,
          reference: values.reference.trim() || null,
          notes: values.notes.trim() || null,
          bookingIds: values.bookingIds,
        };
        const created = await client.createFundExit(payload);
        if (pendingFiles.length > 0) {
          await uploadPending(created.id);
        }
        toast({
          variant: 'success',
          title: t('toast.createdTitle'),
          message: t('toast.createdMessage'),
        });
        router.push(`/tresorerie/sorties/${created.id}/voir`);
        router.refresh();
      } else if (fundExitId) {
        const payload: UpdateFundExitRequest = {
          amountCents,
          currency: values.currency.trim().toUpperCase(),
          operationDate: values.operationDate,
          paymentMethod: values.paymentMethod as TreasuryPaymentMethod,
          reference: values.reference.trim() || null,
          notes: values.notes.trim() || null,
          bookingIds: values.bookingIds,
        };
        await client.updateFundExit(fundExitId, payload);
        toast({
          variant: 'success',
          title: t('toast.updatedTitle'),
          message: t('toast.updatedMessage'),
        });
        router.push('/tresorerie/sorties');
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

  const disabled =
    !canWrite || submitting || initialExit?.status === 'voided';
  const canSubmitCreate =
    mode !== 'create' || Boolean(values.expenseRequestId.trim());

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
          disabled={disabled || Boolean(values.expenseRequestId)}
        />
      ) : null}

      {mode === 'create' ? (
        <div className="space-y-1">
          {eligibleLoading ? (
            <p className="text-sm text-atg-muted">{t('eligibleLoading')}</p>
          ) : eligible.length === 0 ? (
            <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">
              {t('eligibleEmpty')}
            </p>
          ) : null}
          <Select
            label={tFields('expenseRequestId')}
            value={values.expenseRequestId}
            options={eligibleOptions}
            onChange={(e) => selectExpenseRequest(e.target.value)}
            error={fieldErrors.expenseRequestId}
            hint={t('hints.expenseRequestId')}
            required
            disabled={disabled || eligibleLoading || eligible.length === 0}
          />
        </div>
      ) : (
        <div>
          <p className="mb-1 text-sm font-medium text-atg-fg">
            {tFields('expenseRequestId')}
          </p>
          {linkedRequest ? (
            <Button
              href={`/tresorerie/besoins/${linkedRequest.id}/voir`}
              variant="outline"
              className="w-full justify-start sm:w-auto"
            >
              {formatEligibleLabel(linkedRequest)}
            </Button>
          ) : (
            <code className="font-mono text-xs text-atg-muted">
              {values.expenseRequestId}
            </code>
          )}
        </div>
      )}

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

      <Select
        label={tFields('paymentMethod')}
        value={values.paymentMethod}
        options={[{ value: '', label: '—' }, ...paymentMethodOptions]}
        onChange={(e) =>
          updateField('paymentMethod', e.target.value as TreasuryPaymentMethod | '')
        }
        error={fieldErrors.paymentMethod}
        required
        disabled={disabled}
      />

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
        disabled={disabled}
      />

      <div className="space-y-3 rounded-lg border border-atg-border p-4">
        <div>
          <p className="text-sm font-medium text-atg-fg">{tFields('bookingIds')}</p>
          <p className="mt-0.5 text-xs text-atg-muted">{t('hints.bookingIds')}</p>
        </div>
        <Input
          name="bookingSearch"
          type="search"
          placeholder={t('bookingsSearch')}
          value={bookingSearchInput}
          onChange={(e) => setBookingSearchInput(e.target.value)}
          aria-label={t('bookingsSearchAria')}
          disabled={disabled}
        />
        {bookingsLoading ? (
          <p className="text-xs text-atg-muted">{t('bookingsLoading')}</p>
        ) : null}
        {bookingSearch && !bookingsLoading && bookingResults.length === 0 ? (
          <p className="text-xs text-atg-muted">{t('bookingsEmpty')}</p>
        ) : null}
        {bookingResults.length > 0 ? (
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {bookingResults.map((booking) => {
              const selected = values.bookingIds.includes(booking.id);
              return (
                <li key={booking.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleBooking(booking)}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'border-primary bg-primary/5 text-atg-fg'
                        : 'border-atg-border text-atg-fg hover:border-primary/50',
                    )}
                  >
                    {formatBookingLabel(booking)}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {values.bookingIds.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-atg-muted">
              {t('bookingsSelected', { count: values.bookingIds.length })}
            </p>
            <ul className="flex flex-wrap gap-2">
              {values.bookingIds.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeBooking(id)}
                    className="inline-flex items-center gap-1 rounded-md border border-atg-border bg-atg-elevated px-2 py-1 text-xs"
                  >
                    {bookingLabels[id] ?? `${id.slice(0, 8)}…`}
                    <span aria-hidden>×</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {mode === 'create' ? (
        <div className="space-y-2 rounded-lg border border-atg-border p-4">
          <p className="text-sm font-medium text-atg-fg">{t('attachments.title')}</p>
          <p className="text-xs text-atg-muted">{t('attachments.pendingHint')}</p>
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setPendingFiles((prev) => [...prev, file]);
            }}
          />
          {pendingFiles.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex justify-between gap-2">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    className="text-xs text-red-600"
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

      {initialExit?.status === 'voided' ? (
        <p className="text-sm text-atg-muted">{t('voidedHint')}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !canSubmitCreate}
        >
          {submitting
            ? tCommon('loading')
            : mode === 'create'
              ? t('submitCreate')
              : t('submitUpdate')}
        </Button>
        <Button href="/tresorerie/sorties" variant="outline" disabled={submitting}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
