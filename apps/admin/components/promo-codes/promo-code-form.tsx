'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreatePromoCodeRequest,
  PromoCode,
  PromoCodeDiscountType,
} from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPromoCodesErrorMessage } from '../../lib/promo-codes-errors';

export type PromoCodeFormValues = {
  code: string;
  discountType: PromoCodeDiscountType;
  discountValue: string;
  validFrom: string;
  validUntil: string;
  maxRedemptions: string;
  active: boolean;
};

const defaultValues: PromoCodeFormValues = {
  code: '',
  discountType: 'percent',
  discountValue: '10',
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .slice(0, 10),
  maxRedemptions: '',
  active: true,
};

function promoCodeToFormValues(promo: PromoCode): PromoCodeFormValues {
  return {
    code: promo.code,
    discountType: promo.discountType,
    discountValue: String(promo.discountValue),
    validFrom: promo.validFrom.slice(0, 10),
    validUntil: promo.validUntil.slice(0, 10),
    maxRedemptions:
      promo.maxRedemptions != null ? String(promo.maxRedemptions) : '',
    active: promo.active === 1,
  };
}

function toPayload(values: PromoCodeFormValues): CreatePromoCodeRequest {
  const maxRaw = values.maxRedemptions.trim();
  return {
    code: values.code.trim().toUpperCase(),
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    validFrom: values.validFrom,
    validUntil: values.validUntil,
    maxRedemptions: maxRaw ? Number(maxRaw) : null,
    active: values.active ? 1 : 0,
  };
}

type PromoCodeFormProps = {
  mode: 'create' | 'edit';
  promoCodeId?: string;
  initialPromoCode?: PromoCode;
};

export function PromoCodeForm({ mode, promoCodeId, initialPromoCode }: PromoCodeFormProps) {
  const router = useRouter();
  const discountTypeId = useId();
  const activeId = useId();
  const [values, setValues] = useState<PromoCodeFormValues>(() =>
    initialPromoCode ? promoCodeToFormValues(initialPromoCode) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PromoCodeFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof PromoCodeFormValues>(key: K, value: PromoCodeFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof PromoCodeFormValues, string>> = {};
    const code = values.code.trim().toUpperCase();
    if (!code) {
      errors.code = 'Le code est obligatoire.';
    } else if (!/^[A-Z0-9_-]+$/.test(code)) {
      errors.code =
        'Lettres majuscules, chiffres, tirets et underscores uniquement.';
    }

    const discountValue = Number(values.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      errors.discountValue = 'La valeur doit être positive.';
    } else if (values.discountType === 'percent' && discountValue > 100) {
      errors.discountValue = 'Le pourcentage ne peut pas dépasser 100.';
    }

    if (!values.validFrom) {
      errors.validFrom = 'Date de début obligatoire.';
    }
    if (!values.validUntil) {
      errors.validUntil = 'Date de fin obligatoire.';
    }
    if (values.validFrom && values.validUntil && values.validFrom > values.validUntil) {
      errors.validUntil = 'La date de fin doit être après la date de début.';
    }

    const maxRaw = values.maxRedemptions.trim();
    if (maxRaw) {
      const max = Number(maxRaw);
      if (!Number.isInteger(max) || max < 1) {
        errors.maxRedemptions = 'Nombre d’utilisations max. invalide (entier ≥ 1).';
      }
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
      const payload = toPayload(values);
      if (mode === 'create') {
        const created = await client.createPromoCode(payload);
        router.push(`/paiements/codes-promo/${created.id}`);
        router.refresh();
      } else if (promoCodeId) {
        await client.updatePromoCode(promoCodeId, payload);
        router.push('/paiements/codes-promo');
        router.refresh();
      }
    } catch (error) {
      setFormError(getPromoCodesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const discountHint =
    values.discountType === 'percent'
      ? 'Pourcentage de réduction (ex. 20 pour −20 %).'
      : 'Montant fixe en unités monétaires (ex. 15 pour −15,00).';

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

      <Input
        label="Code"
        name="code"
        value={values.code}
        onChange={(e) => updateField('code', e.target.value.toUpperCase())}
        hint="Saisi en majuscules ; comparé sans distinction de casse au checkout."
        error={fieldErrors.code}
        required
      />

      <div>
        <label htmlFor={discountTypeId} className="mb-2 block text-sm font-medium text-atg-fg">
          Type de réduction
        </label>
        <select
          id={discountTypeId}
          value={values.discountType}
          onChange={(e) =>
            updateField('discountType', e.target.value as PromoCodeDiscountType)
          }
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="percent">Pourcentage (%)</option>
          <option value="fixed_amount">Montant fixe</option>
        </select>
      </div>

      <Input
        label={values.discountType === 'percent' ? 'Pourcentage' : 'Montant fixe'}
        name="discountValue"
        type="number"
        min="0.01"
        step={values.discountType === 'percent' ? '1' : '0.01'}
        max={values.discountType === 'percent' ? '100' : undefined}
        value={values.discountValue}
        onChange={(e) => updateField('discountValue', e.target.value)}
        hint={discountHint}
        error={fieldErrors.discountValue}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Valide du"
          name="validFrom"
          type="date"
          value={values.validFrom}
          onChange={(e) => updateField('validFrom', e.target.value)}
          error={fieldErrors.validFrom}
          required
        />
        <Input
          label="Valide au"
          name="validUntil"
          type="date"
          value={values.validUntil}
          onChange={(e) => updateField('validUntil', e.target.value)}
          error={fieldErrors.validUntil}
          required
        />
      </div>

      <Input
        label="Utilisations max."
        name="maxRedemptions"
        type="number"
        min="1"
        step="1"
        value={values.maxRedemptions}
        onChange={(e) => updateField('maxRedemptions', e.target.value)}
        hint="Laisser vide pour un nombre illimité."
        error={fieldErrors.maxRedemptions}
      />

      {mode === 'edit' && initialPromoCode ? (
        <p className="text-sm text-atg-muted">
          Utilisations enregistrées :{' '}
          <strong className="text-atg-fg">{initialPromoCode.redemptionCount}</strong>
          {initialPromoCode.maxRedemptions != null
            ? ` / ${initialPromoCode.maxRedemptions}`
            : ' (illimité)'}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <input
          id={activeId}
          type="checkbox"
          checked={values.active}
          onChange={(e) => updateField('active', e.target.checked)}
          className="h-4 w-4 rounded border-atg-border text-primary focus:ring-primary"
        />
        <label htmlFor={activeId} className="text-sm font-medium text-atg-fg">
          Code actif (utilisable au checkout)
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {mode === 'create' ? 'Créer le code promo' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/paiements/codes-promo">
          Annuler
        </Button>
      </div>
    </form>
  );
}
