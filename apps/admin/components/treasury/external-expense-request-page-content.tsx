'use client';

import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  TextLink,
  ThemeToggle,
  useToast,
} from '@africatourismgate/ui';
import type { ValidateTreasuryAccessTokenResponse } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { BrandingLogo } from '../branding-logo';

const CURRENCY_OPTIONS = ['XOF', 'XAF', 'EUR', 'USD', 'MAD', 'GHS', 'NGN'] as const;

function parseMoneyToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

function mapTokenError(message: string, t: (key: string) => string): string {
  const lower = message.toLowerCase();
  if (lower.includes('expired')) return t('tokenExpired');
  if (lower.includes('revoked')) return t('tokenRevoked');
  if (lower.includes('deactivated')) return t('tokenInactive');
  if (lower.includes('missing required scope') || lower.includes('forbidden')) {
    return t('tokenForbidden');
  }
  if (
    lower.includes('invalid') ||
    lower.includes('unknown') ||
    lower.includes('not found')
  ) {
    return t('tokenInvalid');
  }
  return message || t('tokenInvalid');
}

function ExternalExpenseRequestFormInner() {
  const t = useTranslations('modules.treasury.externalAccess');
  const tFields = useTranslations('modules.treasury.externalAccess.fields');
  const tCommonErrors = useTranslations('common.errors');
  const tTheme = useTranslations('theme');
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const { toast } = useToast();

  const [access, setAccess] = useState<ValidateTreasuryAccessTokenResponse | null>(
    null,
  );
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountMajor, setAmountMajor] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [neededByDate, setNeededByDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const currencyOptions = useMemo(
    () => CURRENCY_OPTIONS.map((code) => ({ value: code, label: code })),
    [],
  );

  const validateToken = useCallback(async () => {
    if (!token) {
      setTokenError(t('tokenMissing'));
      setValidating(false);
      return;
    }
    setValidating(true);
    setTokenError(null);
    try {
      const result = await getApiClient().validateTreasuryAccessToken({
        token,
        requiredScope: 'expense_requests.create',
      });
      setAccess(result);
    } catch (error) {
      const raw = resolveUnknownApiError(
        error,
        {
          network: tCommonErrors('network'),
          forbidden: t('tokenForbidden'),
          generic: t('tokenInvalid'),
          apiStatus: (status: number) =>
            tCommonErrors('apiStatus', { status }),
        },
        { useParseApiMessage: true },
      );
      setTokenError(mapTokenError(raw, t));
      setAccess(null);
    } finally {
      setValidating(false);
    }
  }, [t, tCommonErrors, token]);

  useEffect(() => {
    void validateToken();
  }, [validateToken]);

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = t('validation.titleRequired');
    if (!description.trim()) {
      errors.description = t('validation.descriptionRequired');
    }
    if (parseMoneyToCents(amountMajor) == null) {
      errors.amountMajor = t('validation.amountPositive');
    }
    if (!/^[A-Z]{3}$/.test(currency.trim().toUpperCase())) {
      errors.currency = t('validation.currencyRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!token || !access) {
      setFormError(t('tokenInvalid'));
      return;
    }
    if (!validateForm()) return;

    const amountCents = parseMoneyToCents(amountMajor);
    if (amountCents == null) return;

    setSubmitting(true);
    try {
      const created = await getApiClient().createExpenseRequestExternal({
        token,
        title: title.trim(),
        description: description.trim(),
        requestedAmountCents: amountCents,
        currency: currency.trim().toUpperCase(),
        neededByDate: neededByDate || null,
      });
      setCreatedId(created.id);
      toast({
        variant: 'success',
        title: t('toast.successTitle'),
        message: t('successMessage'),
      });
    } catch (error) {
      const raw = resolveUnknownApiError(
        error,
        {
          network: tCommonErrors('network'),
          forbidden: t('tokenForbidden'),
          generic: tCommonErrors('apiStatus', { status: 500 }),
          apiStatus: (status: number) =>
            tCommonErrors('apiStatus', { status }),
        },
        { useParseApiMessage: true },
      );
      const message = mapTokenError(raw, t);
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

  const displayName =
    access?.collaborator.displayName?.trim() ||
    access?.collaborator.email ||
    '';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10 md:py-6">
        <div className="min-w-0 flex-1">
          <BrandingLogo />
        </div>
        <div className="shrink-0">
          <ThemeToggle
            labels={{ light: tTheme('light'), dark: tTheme('dark') }}
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg">
          <Card accent>
            <h1 className="text-2xl font-bold text-atg-fg">{t('title')}</h1>
            <p className="mt-2 text-sm leading-relaxed text-atg-muted">
              {t('subtitle')}
            </p>

            {validating ? (
              <p className="mt-8 text-sm text-atg-muted">{t('validating')}</p>
            ) : tokenError ? (
              <p
                role="alert"
                className="mt-8 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
              >
                {tokenError}
              </p>
            ) : createdId ? (
              <div className="mt-8 space-y-3">
                <h2 className="text-lg font-semibold text-atg-fg">
                  {t('successTitle')}
                </h2>
                <p className="text-sm text-atg-muted">{t('successMessage')}</p>
                <p className="font-mono text-xs text-atg-fg">
                  {t('successRef', { id: createdId })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {displayName ? (
                  <p className="text-sm font-medium text-atg-fg">
                    {t('welcome', { name: displayName })}
                  </p>
                ) : null}

                {formError ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                  >
                    {formError}
                  </p>
                ) : null}

                <Input
                  label={tFields('title')}
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={fieldErrors.title}
                  required
                  disabled={submitting}
                />
                <Textarea
                  label={tFields('description')}
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={fieldErrors.description}
                  required
                  disabled={submitting}
                  rows={4}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={tFields('amountCents')}
                    name="amountMajor"
                    type="text"
                    inputMode="decimal"
                    value={amountMajor}
                    onChange={(e) => setAmountMajor(e.target.value)}
                    error={fieldErrors.amountMajor}
                    hint={t('hints.amountCents')}
                    required
                    disabled={submitting}
                  />
                  <Select
                    label={tFields('currency')}
                    value={currency}
                    options={currencyOptions}
                    onChange={(e) => setCurrency(e.target.value)}
                    error={fieldErrors.currency}
                    required
                    disabled={submitting}
                  />
                </div>
                <Input
                  label={tFields('neededByDate')}
                  name="neededByDate"
                  type="date"
                  value={neededByDate}
                  onChange={(e) => setNeededByDate(e.target.value)}
                  disabled={submitting}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {t('submit')}
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-sm">
              <TextLink href="/login">{t('backToLogin')}</TextLink>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

export function ExternalExpenseRequestPageContent() {
  const tCommon = useTranslations('common.loading');

  return (
    <Suspense fallback={<p className="p-8 text-sm text-atg-muted">{tCommon('page')}</p>}>
      <ExternalExpenseRequestFormInner />
    </Suspense>
  );
}
