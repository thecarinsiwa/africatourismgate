'use client';

import { Button, Input, Select, Textarea, useToast } from '@africatourismgate/ui';
import type {
  CreateExpenseRequestRequest,
  ExpenseRequest,
  OrganizationListItem,
  UpdateExpenseRequestRequest,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';

const CURRENCY_OPTIONS = ['XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;

type FormValues = {
  organizationId: string;
  title: string;
  description: string;
  amountMajor: string;
  currency: string;
  neededByDate: string;
};

const defaultValues: FormValues = {
  organizationId: '',
  title: '',
  description: '',
  amountMajor: '',
  currency: 'XOF',
  neededByDate: '',
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

function toFormValues(item: ExpenseRequest): FormValues {
  return {
    organizationId: item.organizationId,
    title: item.title,
    description: item.description,
    amountMajor: centsToMajorString(item.requestedAmountCents),
    currency: item.currency,
    neededByDate: item.neededByDate?.slice(0, 10) ?? '',
  };
}

type ExpenseRequestFormProps = {
  mode: 'create' | 'edit';
  expenseRequestId?: string;
  initialRequest?: ExpenseRequest;
};

export function ExpenseRequestForm({
  mode,
  expenseRequestId,
  initialRequest,
}: ExpenseRequestFormProps) {
  const t = useTranslations('modules.treasury.expenseRequests.form');
  const tFields = useTranslations('modules.treasury.expenseRequests.form.fields');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>(() =>
    initialRequest ? toFormValues(initialRequest) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [authReady, setAuthReady] = useState(false);

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
          me.isSuperAdmin ||
          me.permissions.includes('treasury.expense_requests.create');
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

  const updateField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
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
    const errors: Partial<Record<keyof FormValues, string>> = {};
    if (mode === 'create' && !values.organizationId.trim()) {
      errors.organizationId = t('validation.organizationRequired');
    }
    if (!values.title.trim()) {
      errors.title = t('validation.titleRequired');
    }
    if (!values.description.trim()) {
      errors.description = t('validation.descriptionRequired');
    }
    if (parseMoneyToCents(values.amountMajor) == null) {
      errors.amountMajor = t('validation.amountPositive');
    }
    if (!/^[A-Z]{3}$/.test(values.currency.trim().toUpperCase())) {
      errors.currency = t('validation.currencyRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!canWrite) {
      setFormError(t('accessDenied'));
      return;
    }
    if (mode === 'edit' && initialRequest && initialRequest.status !== 'draft') {
      setFormError(t('draftOnlyHint'));
      return;
    }
    if (!validate()) return;

    const amountCents = parseMoneyToCents(values.amountMajor);
    if (amountCents == null) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const payload: CreateExpenseRequestRequest = {
          organizationId: values.organizationId,
          title: values.title.trim(),
          description: values.description.trim(),
          requestedAmountCents: amountCents,
          currency: values.currency.trim().toUpperCase(),
          neededByDate: values.neededByDate || null,
        };
        const created = await client.createExpenseRequest(payload);
        toast({
          variant: 'success',
          title: t('toast.createdTitle'),
          message: t('toast.createdMessage'),
        });
        router.push(`/tresorerie/besoins/${created.id}/voir`);
        router.refresh();
      } else if (expenseRequestId) {
        const payload: UpdateExpenseRequestRequest = {
          title: values.title.trim(),
          description: values.description.trim(),
          requestedAmountCents: amountCents,
          currency: values.currency.trim().toUpperCase(),
          neededByDate: values.neededByDate || null,
        };
        await client.updateExpenseRequest(expenseRequestId, payload);
        toast({
          variant: 'success',
          title: t('toast.updatedTitle'),
          message: t('toast.updatedMessage'),
        });
        router.push('/tresorerie/besoins');
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
    !canWrite ||
    submitting ||
    (mode === 'edit' && initialRequest?.status !== 'draft');

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
        label={tFields('title')}
        name="title"
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={fieldErrors.title}
        required
        disabled={disabled}
      />

      <Textarea
        label={tFields('description')}
        name="description"
        value={values.description}
        onChange={(e) => updateField('description', e.target.value)}
        error={fieldErrors.description}
        required
        disabled={disabled}
        rows={4}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tFields('requestedAmountCents')}
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
        <Select
          label={tFields('currency')}
          value={values.currency}
          options={currencyOptions}
          onChange={(e) => updateField('currency', e.target.value)}
          error={fieldErrors.currency}
          required
          disabled={disabled}
        />
      </div>

      <Input
        label={tFields('neededByDate')}
        name="neededByDate"
        type="date"
        value={values.neededByDate}
        onChange={(e) => updateField('neededByDate', e.target.value)}
        disabled={disabled}
      />

      {mode === 'edit' && initialRequest?.status !== 'draft' ? (
        <p className="text-sm text-atg-muted">{t('draftOnlyHint')}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={disabled}>
          {submitting
            ? tCommon('loading')
            : mode === 'create'
              ? t('submitCreate')
              : t('submitUpdate')}
        </Button>
        <Button href="/tresorerie/besoins" variant="outline" disabled={submitting}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  );
}
