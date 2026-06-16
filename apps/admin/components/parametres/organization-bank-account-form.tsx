'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type { OrganizationBankAccount } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { isValidCurrency } from '../../lib/org-settings-constants';
import {
  containsMaskChars,
  maskAccountNumberForDisplay,
} from '../../lib/bank-account-masking';

export type BankAccountFormValues = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftBic: string;
  currency: string;
  isDefault: boolean;
};

const emptyValues: BankAccountFormValues = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  swiftBic: '',
  currency: 'USD',
  isDefault: false,
};

function accountToValues(account: OrganizationBankAccount): BankAccountFormValues {
  return {
    bankName: account.bankName,
    accountName: account.accountName,
    accountNumber: containsMaskChars(account.accountNumber) ? '' : account.accountNumber,
    swiftBic: account.swiftBic ?? '',
    currency: account.currency,
    isDefault: account.isDefault,
  };
}

type OrganizationBankAccountFormProps = {
  organizationId: string;
  isSuperAdmin: boolean;
  account?: OrganizationBankAccount;
  onSuccess: () => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

export function OrganizationBankAccountForm({
  organizationId,
  isSuperAdmin,
  account,
  onSuccess,
  onCancel,
  onDirtyChange,
}: OrganizationBankAccountFormProps) {
  const { organizationSettings: getOrganizationSettingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.settings.bankAccounts.form');
  const isEdit = Boolean(account);
  const [values, setValues] = useState<BankAccountFormValues>(() =>
    account ? accountToValues(account) : emptyValues,
  );
  const [initialValues, setInitialValues] = useState<BankAccountFormValues>(() =>
    account ? accountToValues(account) : emptyValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BankAccountFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      const nextValues = accountToValues(account);
      setValues(nextValues);
      setInitialValues(nextValues);
    } else {
      setValues(emptyValues);
      setInitialValues(emptyValues);
    }
  }, [account]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateField = useCallback(
    <K extends keyof BankAccountFormValues>(key: K, value: BankAccountFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof BankAccountFormValues, string>> = {};
    if (!values.bankName.trim()) errors.bankName = t('validation.bankNameRequired');
    if (!values.accountName.trim()) errors.accountName = t('validation.accountNameRequired');
    if (!isEdit && !values.accountNumber.trim()) {
      errors.accountNumber = t('validation.accountNumberRequired');
    }
    if (containsMaskChars(values.accountNumber)) {
      errors.accountNumber = t('validation.accountNumberNoMask');
    }
    if (!isValidCurrency(values.currency)) {
      errors.currency = t('validation.currencyInvalid');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const client = getApiClient();
      const currency = values.currency.trim().toUpperCase();

      if (isEdit && account) {
        const body: Record<string, unknown> = {
          bankName: values.bankName.trim(),
          accountName: values.accountName.trim(),
          currency,
          isDefault: values.isDefault,
          swiftBic: values.swiftBic.trim() || undefined,
        };
        if (values.accountNumber.trim()) {
          body.accountNumber = values.accountNumber.trim();
        }
        await client.updateOrganizationBankAccount(
          account.id,
          body,
          isSuperAdmin ? organizationId : undefined,
        );
      } else {
        await client.createOrganizationBankAccount({
          ...(isSuperAdmin ? { organizationId } : {}),
          bankName: values.bankName.trim(),
          accountName: values.accountName.trim(),
          accountNumber: values.accountNumber.trim(),
          currency,
          isDefault: values.isDefault,
          ...(values.swiftBic.trim() ? { swiftBic: values.swiftBic.trim() } : {}),
        });
      }
      setInitialValues(values);
      onDirtyChange?.(false);
      onSuccess();
    } catch (error) {
      setFormError(getOrganizationSettingsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-atg-border bg-atg-elevated p-6">
      <h3 className="text-lg font-semibold text-atg-fg">
        {isEdit ? t('editTitle') : t('createTitle')}
      </h3>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <Input
        label={t('bankName')}
        value={values.bankName}
        onChange={(e) => updateField('bankName', e.target.value)}
        error={fieldErrors.bankName}
      />
      <Input
        label={t('accountName')}
        value={values.accountName}
        onChange={(e) => updateField('accountName', e.target.value)}
        error={fieldErrors.accountName}
      />
      <Input
        label={isEdit ? t('accountNumberEdit') : t('accountNumberCreate')}
        value={values.accountNumber}
        onChange={(e) => updateField('accountNumber', e.target.value)}
        error={fieldErrors.accountNumber}
        autoComplete="off"
      />
      {isEdit && account ? (
        <p className="text-xs text-atg-muted">
          {t('storedValue', { masked: maskAccountNumberForDisplay(account.accountNumber) })}
        </p>
      ) : null}
      <Input
        label={t('swiftBic')}
        value={values.swiftBic}
        onChange={(e) => updateField('swiftBic', e.target.value)}
      />
      <Input
        label={t('currency')}
        value={values.currency}
        onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
        error={fieldErrors.currency}
        maxLength={3}
      />
      <label className="flex items-center gap-2 text-sm text-atg-fg">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => updateField('isDefault', e.target.checked)}
          className="rounded border-atg-border"
        />
        {t('isDefault')}
      </label>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          loading={submitting}
          loadingText={t('saving')}
          disabled={!isDirty}
        >
          {isEdit ? t('update') : t('create')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (isDirty) {
              setValues(initialValues);
              setFieldErrors({});
              setFormError(null);
              return;
            }
            onCancel();
          }}
        >
          {t('cancel')}
        </Button>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-atg-border bg-atg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-atg-fg">
            {isDirty ? t('dirty') : t('clean')}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValues(initialValues);
                setFieldErrors({});
                setFormError(null);
              }}
              disabled={!isDirty || submitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={submitting}
              loadingText={t('saving')}
              disabled={!isDirty}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
