'use client';

import { Button, Input, Select, Textarea, useToast } from '@africatourismgate/ui';
import type {
  Budget,
  BudgetPeriodType,
  BudgetProductType,
  BudgetScopeType,
  CreateBudgetRequest,
  OrganizationListItem,
  UpdateBudgetRequest,
} from '@africatourismgate/types';
import {
  BUDGET_PERIOD_TYPES,
  BUDGET_PRODUCT_TYPES,
  BUDGET_SCOPE_TYPES,
} from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import {
  useBudgetPeriodLabels,
  useBudgetProductTypeLabels,
  useBudgetScopeLabels,
} from '../../lib/i18n/use-module-labels';

const CURRENCY_OPTIONS = ['XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;
const SEARCH_DEBOUNCE_MS = 300;

type SearchOption = { id: string; label: string };

type FormValues = {
  organizationId: string;
  label: string;
  periodType: BudgetPeriodType;
  year: string;
  month: string;
  amountMajor: string;
  currency: string;
  scopeType: BudgetScopeType;
  activityId: string;
  productType: BudgetProductType | '';
  productId: string;
  notes: string;
};

const defaultValues: FormValues = {
  organizationId: '',
  label: '',
  periodType: 'monthly',
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1),
  amountMajor: '',
  currency: 'XOF',
  scopeType: 'general',
  activityId: '',
  productType: '',
  productId: '',
  notes: '',
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

function toFormValues(item: Budget): FormValues {
  return {
    organizationId: item.organizationId,
    label: item.label,
    periodType: item.periodType,
    year: String(item.year),
    month: item.month != null ? String(item.month) : '',
    amountMajor: centsToMajorString(item.amountCents),
    currency: item.currency,
    scopeType: item.scopeType,
    activityId: item.activityId ?? '',
    productType: item.productType ?? '',
    productId: item.productId ?? '',
    notes: item.notes ?? '',
  };
}

async function searchActivities(
  search: string,
  organizationId?: string,
): Promise<SearchOption[]> {
  const result = await getApiClient().listActivities({
    page: 1,
    limit: 20,
    search: search || undefined,
    organizationId: organizationId || undefined,
  });
  return result.data.map((a) => ({
    id: a.id,
    label: `${a.title} (${a.id.slice(0, 8)}…)`,
  }));
}

async function searchProducts(
  productType: BudgetProductType,
  search: string,
): Promise<SearchOption[]> {
  const client = getApiClient();
  const q = search.trim().toLowerCase();
  switch (productType) {
    case 'room': {
      const result = await client.listRooms({ page: 1, limit: 50 });
      return result.data
        .filter((r) => !q || r.name.toLowerCase().includes(q) || r.id.includes(q))
        .slice(0, 20)
        .map((r) => ({ id: r.id, label: `${r.name} (${r.id.slice(0, 8)}…)` }));
    }
    case 'vehicle': {
      const result = await client.listVehicles({
        page: 1,
        limit: 20,
        search: search || undefined,
      });
      return result.data.map((v) => ({
        id: v.id,
        label: `${v.licensePlate ?? v.id.slice(0, 8)} (${v.id.slice(0, 8)}…)`,
      }));
    }
    case 'cabin': {
      const result = await client.listCabins({ page: 1, limit: 50 });
      return result.data
        .filter(
          (c) =>
            !q ||
            c.categoryName.toLowerCase().includes(q) ||
            c.id.includes(q),
        )
        .slice(0, 20)
        .map((c) => ({
          id: c.id,
          label: `${c.categoryName} (${c.id.slice(0, 8)}…)`,
        }));
    }
    case 'package': {
      const result = await client.listPackages({
        page: 1,
        limit: 20,
        search: search || undefined,
      });
      return result.data.map((p) => ({
        id: p.id,
        label: `${p.name} (${p.id.slice(0, 8)}…)`,
      }));
    }
    case 'flight_class': {
      const result = await client.listFlightClasses({ page: 1, limit: 50 });
      return result.data
        .filter(
          (fc) =>
            !q ||
            fc.className.toLowerCase().includes(q) ||
            fc.id.includes(q),
        )
        .slice(0, 20)
        .map((fc) => ({
          id: fc.id,
          label: `${fc.className} (${fc.id.slice(0, 8)}…)`,
        }));
    }
    case 'activity_schedule': {
      const result = await client.listActivitySchedules({ page: 1, limit: 50 });
      return result.data
        .filter((s) => !q || s.id.includes(q) || s.activityId.includes(q))
        .slice(0, 20)
        .map((s) => ({
          id: s.id,
          label: `${s.startDatetime.slice(0, 16)} — ${s.id.slice(0, 8)}…`,
        }));
    }
    default:
      return [];
  }
}

type BudgetFormProps = {
  mode: 'create' | 'edit';
  budgetId?: string;
  initialBudget?: Budget;
};

export function BudgetForm({ mode, budgetId, initialBudget }: BudgetFormProps) {
  const t = useTranslations('modules.treasury.budgets.form');
  const tFields = useTranslations('modules.treasury.budgets.form.fields');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const locale = useLocale();
  const periodLabels = useBudgetPeriodLabels();
  const scopeLabels = useBudgetScopeLabels();
  const productTypeLabels = useBudgetProductTypeLabels();
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>(() =>
    initialBudget ? toFormValues(initialBudget) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const [activitySearch, setActivitySearch] = useState('');
  const [activityOptions, setActivityOptions] = useState<SearchOption[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityLabel, setActivityLabel] = useState(
    initialBudget?.activityId
      ? `${initialBudget.activityId.slice(0, 8)}…`
      : '',
  );

  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<SearchOption[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productLabel, setProductLabel] = useState(
    initialBudget?.productId
      ? `${initialBudget.productId.slice(0, 8)}…`
      : '',
  );

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
          me.isSuperAdmin || me.permissions.includes('treasury.budgets.write');
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
    if (values.scopeType !== 'activity') return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setActivityLoading(true);
      void searchActivities(activitySearch, values.organizationId || undefined)
        .then((opts) => {
          if (!cancelled) setActivityOptions(opts);
        })
        .catch(() => {
          if (!cancelled) setActivityOptions([]);
        })
        .finally(() => {
          if (!cancelled) setActivityLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activitySearch, values.scopeType, values.organizationId]);

  useEffect(() => {
    if (values.scopeType !== 'product' || !values.productType) {
      setProductOptions([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setProductLoading(true);
      void searchProducts(values.productType as BudgetProductType, productSearch)
        .then((opts) => {
          if (!cancelled) setProductOptions(opts);
        })
        .catch(() => {
          if (!cancelled) setProductOptions([]);
        })
        .finally(() => {
          if (!cancelled) setProductLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [productSearch, values.scopeType, values.productType]);

  const updateField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'periodType' && value === 'annual') {
          next.month = '';
        }
        if (key === 'scopeType') {
          if (value === 'general') {
            next.activityId = '';
            next.productType = '';
            next.productId = '';
          } else if (value === 'activity') {
            next.productType = '';
            next.productId = '';
          } else if (value === 'product') {
            next.activityId = '';
          }
        }
        if (key === 'productType') {
          next.productId = '';
        }
        return next;
      });
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      if (key === 'scopeType') {
        setActivityLabel('');
        setProductLabel('');
        setActivitySearch('');
        setProductSearch('');
      }
      if (key === 'productType') {
        setProductLabel('');
        setProductSearch('');
      }
    },
    [],
  );

  const periodOptions = useMemo(
    () =>
      BUDGET_PERIOD_TYPES.map((value) => ({
        value,
        label: periodLabels[value],
      })),
    [periodLabels],
  );

  const scopeOptions = useMemo(
    () =>
      BUDGET_SCOPE_TYPES.map((value) => ({
        value,
        label: scopeLabels[value],
      })),
    [scopeLabels],
  );

  const productTypeOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...BUDGET_PRODUCT_TYPES.map((value) => ({
        value,
        label: productTypeLabels[value],
      })),
    ],
    [productTypeLabels],
  );

  const monthOptions = useMemo(() => {
    const opts = [{ value: '', label: '—' }];
    for (let m = 1; m <= 12; m += 1) {
      let label = String(m);
      try {
        label = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
          new Date(2000, m - 1, 1),
        );
      } catch {
        /* keep numeric */
      }
      opts.push({ value: String(m), label });
    }
    return opts;
  }, [locale]);

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
    if (!values.label.trim()) {
      errors.label = t('validation.labelRequired');
    }
    const yearNum = Number.parseInt(values.year.trim(), 10);
    if (!Number.isFinite(yearNum) || yearNum < 2000 || yearNum > 2100) {
      errors.year = t('validation.yearRequired');
    }
    if (values.periodType === 'monthly') {
      const monthNum = Number.parseInt(values.month, 10);
      if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) {
        errors.month = t('validation.monthRequiredForMonthly');
      }
    }
    if (parseMoneyToCents(values.amountMajor) == null) {
      errors.amountMajor = t('validation.amountPositive');
    }
    if (!/^[A-Z]{3}$/.test(values.currency.trim().toUpperCase())) {
      errors.currency = t('validation.currencyRequired');
    }
    if (values.scopeType === 'activity' && !values.activityId.trim()) {
      errors.activityId = t('validation.activityRequired');
    }
    if (values.scopeType === 'product') {
      if (!values.productType) {
        errors.productType = t('validation.productTypeRequired');
      }
      if (!values.productId.trim()) {
        errors.productId = t('validation.productIdRequired');
      }
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
    if (!validate()) return;

    const amountCents = parseMoneyToCents(values.amountMajor);
    if (amountCents == null) return;
    const yearNum = Number.parseInt(values.year.trim(), 10);
    const monthNum =
      values.periodType === 'monthly'
        ? Number.parseInt(values.month, 10)
        : null;

    setSubmitting(true);
    try {
      const client = getApiClient();
      if (mode === 'create') {
        const payload: CreateBudgetRequest = {
          organizationId: values.organizationId,
          label: values.label.trim(),
          periodType: values.periodType,
          year: yearNum,
          month: monthNum,
          amountCents,
          currency: values.currency.trim().toUpperCase(),
          scopeType: values.scopeType,
          activityId:
            values.scopeType === 'activity' ? values.activityId.trim() : null,
          productType:
            values.scopeType === 'product'
              ? (values.productType as BudgetProductType)
              : null,
          productId:
            values.scopeType === 'product' ? values.productId.trim() : null,
          notes: values.notes.trim() || null,
        };
        const created = await client.createBudget(payload);
        toast({
          variant: 'success',
          title: t('toast.createdTitle'),
          message: t('toast.createdMessage'),
        });
        router.push(`/tresorerie/budgets/${created.id}/voir`);
        router.refresh();
      } else if (budgetId) {
        const payload: UpdateBudgetRequest = {
          label: values.label.trim(),
          periodType: values.periodType,
          year: yearNum,
          month: monthNum,
          amountCents,
          currency: values.currency.trim().toUpperCase(),
          scopeType: values.scopeType,
          activityId:
            values.scopeType === 'activity' ? values.activityId.trim() : null,
          productType:
            values.scopeType === 'product'
              ? (values.productType as BudgetProductType)
              : null,
          productId:
            values.scopeType === 'product' ? values.productId.trim() : null,
          notes: values.notes.trim() || null,
        };
        await client.updateBudget(budgetId, payload);
        toast({
          variant: 'success',
          title: t('toast.updatedTitle'),
          message: t('toast.updatedMessage'),
        });
        router.push('/tresorerie/budgets');
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

  const disabled = !canWrite || submitting;

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
        label={tFields('label')}
        name="label"
        value={values.label}
        onChange={(e) => updateField('label', e.target.value)}
        error={fieldErrors.label}
        required
        disabled={disabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={tFields('periodType')}
          value={values.periodType}
          options={periodOptions}
          onChange={(e) =>
            updateField('periodType', e.target.value as BudgetPeriodType)
          }
          required
          disabled={disabled}
        />
        <Select
          label={tFields('scopeType')}
          value={values.scopeType}
          options={scopeOptions}
          onChange={(e) =>
            updateField('scopeType', e.target.value as BudgetScopeType)
          }
          hint={t('hints.scopeType')}
          required
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={tFields('year')}
          name="year"
          type="number"
          inputMode="numeric"
          value={values.year}
          onChange={(e) => updateField('year', e.target.value)}
          error={fieldErrors.year}
          required
          disabled={disabled}
        />
        {values.periodType === 'monthly' ? (
          <Select
            label={tFields('month')}
            value={values.month}
            options={monthOptions}
            onChange={(e) => updateField('month', e.target.value)}
            error={fieldErrors.month}
            required
            disabled={disabled}
          />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

      {values.scopeType === 'activity' ? (
        <div className="space-y-2">
          <Input
            label={tFields('activityId')}
            name="activitySearch"
            type="search"
            placeholder={t('activitySearch')}
            value={activitySearch}
            onChange={(e) => setActivitySearch(e.target.value)}
            hint={t('hints.activityId')}
            error={fieldErrors.activityId}
            required
            disabled={disabled}
          />
          {values.activityId ? (
            <p className="text-xs text-atg-muted">
              {activityLabel || values.activityId}
            </p>
          ) : null}
          {activityLoading ? (
            <p className="text-xs text-atg-muted">{t('activityLoading')}</p>
          ) : activityOptions.length === 0 ? (
            <p className="text-xs text-atg-muted">{t('activityEmpty')}</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-atg-border p-2">
              {activityOptions.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      updateField('activityId', opt.id);
                      setActivityLabel(opt.label);
                      setFieldErrors((prev) => ({
                        ...prev,
                        activityId: undefined,
                      }));
                    }}
                    className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-primary/10 ${
                      values.activityId === opt.id
                        ? 'bg-primary/10 font-medium'
                        : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {values.scopeType === 'product' ? (
        <div className="space-y-4">
          <Select
            label={tFields('productType')}
            value={values.productType}
            options={productTypeOptions}
            onChange={(e) =>
              updateField(
                'productType',
                e.target.value as BudgetProductType | '',
              )
            }
            error={fieldErrors.productType}
            required
            disabled={disabled}
          />
          {values.productType ? (
            <div className="space-y-2">
              <Input
                label={tFields('productId')}
                name="productSearch"
                type="search"
                placeholder={t('productSearch')}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                hint={t('hints.productId')}
                error={fieldErrors.productId}
                required
                disabled={disabled}
              />
              {values.productId ? (
                <p className="text-xs text-atg-muted">
                  {productLabel || values.productId}
                </p>
              ) : null}
              {productLoading ? (
                <p className="text-xs text-atg-muted">{t('productLoading')}</p>
              ) : productOptions.length === 0 ? (
                <p className="text-xs text-atg-muted">{t('productEmpty')}</p>
              ) : (
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-atg-border p-2">
                  {productOptions.map((opt) => (
                    <li key={opt.id}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          updateField('productId', opt.id);
                          setProductLabel(opt.label);
                          setFieldErrors((prev) => ({
                            ...prev,
                            productId: undefined,
                          }));
                        }}
                        className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-primary/10 ${
                          values.productId === opt.id
                            ? 'bg-primary/10 font-medium'
                            : ''
                        }`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <Textarea
        label={tFields('notes')}
        name="notes"
        value={values.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        disabled={disabled}
        rows={3}
      />

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" disabled={disabled}>
          {mode === 'create' ? t('submitCreate') : t('submitUpdate')}
        </Button>
      </div>
    </form>
  );
}
