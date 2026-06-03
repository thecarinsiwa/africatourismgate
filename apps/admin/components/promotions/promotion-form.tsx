'use client';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreatePromotionRequest,
  PromoCodeDiscountType,
  Promotion,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPromotionsErrorMessage } from '../../lib/promotions-errors';

export type PromotionFormValues = {
  name: string;
  description: string;
  hasDiscount: boolean;
  discountType: PromoCodeDiscountType;
  discountValue: string;
  validFrom: string;
  validUntil: string;
  maxRedemptions: string;
  active: boolean;
};

const defaultValues: PromotionFormValues = {
  name: '',
  description: '',
  hasDiscount: true,
  discountType: 'percent',
  discountValue: '10',
  validFrom: '',
  validUntil: '',
  maxRedemptions: '',
  active: true,
};

function promotionToFormValues(promo: Promotion): PromotionFormValues {
  const hasDiscount = promo.discountType != null && promo.discountValue != null;
  return {
    name: promo.name,
    description: promo.description ?? '',
    hasDiscount,
    discountType: promo.discountType ?? 'percent',
    discountValue: hasDiscount ? String(promo.discountValue) : '',
    validFrom: promo.validFrom?.slice(0, 10) ?? '',
    validUntil: promo.validUntil?.slice(0, 10) ?? '',
    maxRedemptions:
      promo.maxRedemptions != null ? String(promo.maxRedemptions) : '',
    active: promo.active === 1,
  };
}

function toPayload(values: PromotionFormValues): CreatePromotionRequest {
  const maxRaw = values.maxRedemptions.trim();
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    discountType: values.hasDiscount ? values.discountType : null,
    discountValue: values.hasDiscount ? Number(values.discountValue) : null,
    validFrom: values.validFrom.trim() || null,
    validUntil: values.validUntil.trim() || null,
    maxRedemptions: maxRaw ? Number(maxRaw) : null,
    active: values.active ? 1 : 0,
  };
}

type PromotionFormProps = {
  mode: 'create' | 'edit';
  promotionId?: string;
  initialPromotion?: Promotion;
};

export function PromotionForm({ mode, promotionId, initialPromotion }: PromotionFormProps) {
  const router = useRouter();
  const discountTypeId = useId();
  const hasDiscountId = useId();
  const activeId = useId();
  const [values, setValues] = useState<PromotionFormValues>(() =>
    initialPromotion ? promotionToFormValues(initialPromotion) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PromotionFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof PromotionFormValues>(key: K, value: PromotionFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof PromotionFormValues, string>> = {};
    if (!values.name.trim()) {
      errors.name = 'Le titre est obligatoire.';
    }

    if (values.hasDiscount) {
      const discountValue = Number(values.discountValue);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        errors.discountValue = 'La valeur doit être positive.';
      } else if (values.discountType === 'percent' && discountValue > 100) {
        errors.discountValue = 'Le pourcentage ne peut pas dépasser 100.';
      }
    }

    if (values.validFrom && values.validUntil && values.validFrom > values.validUntil) {
      errors.validUntil = 'La date de fin doit être après la date de début.';
    }

    const maxRaw = values.maxRedemptions.trim();
    if (maxRaw) {
      const max = Number(maxRaw);
      if (!Number.isInteger(max) || max < 1) {
        errors.maxRedemptions = 'Nombre max. invalide (entier ≥ 1).';
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
        const created = await client.createPromotion(payload);
        router.push(`/paiements/promotions/${created.id}`);
        router.refresh();
      } else if (promotionId) {
        await client.updatePromotion(promotionId, payload);
        router.push('/paiements/promotions');
        router.refresh();
      }
    } catch (error) {
      setFormError(getPromotionsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const discountHint =
    values.discountType === 'percent'
      ? 'Pourcentage (ex. 15 pour −15 %).'
      : 'Montant fixe en unités monétaires (ex. 20 pour −20,00).';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
        <p>
          Les <strong className="text-atg-fg">codes promo</strong> sont saisis par le client au
          checkout ; les <strong className="text-atg-fg">promotions</strong> sont appliquées via
          l’identifiant campagne (<code className="text-xs">promotionId</code>).{' '}
          <Link href="/paiements/codes-promo" className="font-medium text-primary hover:underline">
            Gérer les codes promo
          </Link>
        </p>
        <p className="mt-2">
          Cible produit / destination : précisez-la dans la description (pas encore de champ dédié en
          base).
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <Input
        label="Titre de la campagne"
        name="name"
        value={values.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={fieldErrors.name}
        required
      />

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-atg-fg">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Ex. −20 % sur les hébergements à Nairobi, juin–août 2026…"
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id={hasDiscountId}
          type="checkbox"
          checked={values.hasDiscount}
          onChange={(e) => updateField('hasDiscount', e.target.checked)}
          className="h-4 w-4 rounded border-atg-border text-primary focus:ring-primary"
        />
        <label htmlFor={hasDiscountId} className="text-sm font-medium text-atg-fg">
          Appliquer une réduction au checkout
        </label>
      </div>

      {values.hasDiscount ? (
        <>
          <div>
            <label
              htmlFor={discountTypeId}
              className="mb-2 block text-sm font-medium text-atg-fg"
            >
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
        </>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Valide du (optionnel)"
          name="validFrom"
          type="date"
          value={values.validFrom}
          onChange={(e) => updateField('validFrom', e.target.value)}
          error={fieldErrors.validFrom}
        />
        <Input
          label="Valide au (optionnel)"
          name="validUntil"
          type="date"
          value={values.validUntil}
          onChange={(e) => updateField('validUntil', e.target.value)}
          error={fieldErrors.validUntil}
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
        hint="Laisser vide pour illimité."
        error={fieldErrors.maxRedemptions}
      />

      {mode === 'edit' && initialPromotion ? (
        <div className="space-y-2 text-sm text-atg-muted">
          <p>
            Utilisations :{' '}
            <strong className="text-atg-fg">{initialPromotion.redemptionCount}</strong>
            {initialPromotion.maxRedemptions != null
              ? ` / ${initialPromotion.maxRedemptions}`
              : ' (illimité)'}
          </p>
          <p>
            ID checkout :{' '}
            <code className="break-all rounded bg-atg-surface px-1.5 py-0.5 font-mono text-xs text-atg-fg">
              {initialPromotion.id}
            </code>
          </p>
        </div>
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
          Campagne active
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText="Enregistrement…">
          {mode === 'create' ? 'Créer la promotion' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/paiements/promotions">
          Annuler
        </Button>
      </div>
    </form>
  );
}
