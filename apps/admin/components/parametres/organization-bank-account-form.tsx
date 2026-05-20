'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { OrganizationBankAccount } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { isValidCurrency } from '../../lib/org-settings-constants';
import { getOrganizationSettingsErrorMessage } from '../../lib/organization-settings-errors';

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
    accountNumber: account.accountNumber.includes('*') ? '' : account.accountNumber,
    swiftBic: account.swiftBic ?? '',
    currency: account.currency,
    isDefault: account.isDefault,
  };
};

type OrganizationBankAccountFormProps = {
  organizationId: string;
  isSuperAdmin: boolean;
  account?: OrganizationBankAccount;
  onSuccess: () => void;
  onCancel: () => void;
};

export function OrganizationBankAccountForm({
  organizationId,
  isSuperAdmin,
  account,
  onSuccess,
  onCancel,
}: OrganizationBankAccountFormProps) {
  const isEdit = Boolean(account);
  const [values, setValues] = useState<BankAccountFormValues>(() =>
    account ? accountToValues(account) : emptyValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BankAccountFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setValues(accountToValues(account));
    }
  }, [account]);

  const updateField = useCallback(
    <K extends keyof BankAccountFormValues>(key: K, value: BankAccountFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof BankAccountFormValues, string>> = {};
    if (!values.bankName.trim()) errors.bankName = 'Le nom de la banque est obligatoire.';
    if (!values.accountName.trim()) errors.accountName = 'Le nom du compte est obligatoire.';
    if (!isEdit && !values.accountNumber.trim()) {
      errors.accountNumber = 'Le numéro de compte est obligatoire.';
    }
    if (values.accountNumber.includes('*')) {
      errors.accountNumber = 'Saisissez le numéro complet (sans masque).';
    }
    if (!isValidCurrency(values.currency)) {
      errors.currency = 'La devise doit comporter 3 lettres (ex. USD, CDF).';
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
        {isEdit ? 'Modifier le compte' : 'Nouveau compte bancaire'}
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
        label="Banque"
        value={values.bankName}
        onChange={(e) => updateField('bankName', e.target.value)}
        error={fieldErrors.bankName}
      />
      <Input
        label="Nom du compte"
        value={values.accountName}
        onChange={(e) => updateField('accountName', e.target.value)}
        error={fieldErrors.accountName}
      />
      <Input
        label={isEdit ? 'Numéro de compte (laisser vide pour conserver)' : 'Numéro de compte / IBAN'}
        value={values.accountNumber}
        onChange={(e) => updateField('accountNumber', e.target.value)}
        error={fieldErrors.accountNumber}
        autoComplete="off"
      />
      <Input
        label="SWIFT / BIC"
        value={values.swiftBic}
        onChange={(e) => updateField('swiftBic', e.target.value)}
      />
      <Input
        label="Devise"
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
        Compte par défaut
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
