'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreatePromotionRequest,
  PromoCodeDiscountType,
  Promotion,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePromoDiscountTypeLabels } from '../../lib/i18n/use-module-labels';
import { PromotionPreviewBanner } from './promotion-preview-banner';

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
  const { promotions: getPromotionsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.promotions.form');
  const tCommon = useTranslations('modules.common.form');
  const discountTypeLabels = usePromoDiscountTypeLabels();
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
      errors.name = t('validation.nameRequired');
    }

    if (values.hasDiscount) {
      const discountValue = Number(values.discountValue);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        errors.discountValue = t('validation.discountPositive');
      } else if (values.discountType === 'percent' && discountValue > 100) {
        errors.discountValue = t('validation.percentMax');
      }
    }

    if (values.validFrom && values.validUntil && values.validFrom > values.validUntil) {
      errors.validUntil = t('validation.endAfterStart');
    }

    const maxRaw = values.maxRedemptions.trim();
    if (maxRaw) {
      const max = Number(maxRaw);
      if (!Number.isInteger(max) || max < 1) {
        errors.maxRedemptions = t('validation.maxRedemptionsInvalid');
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
      ? t('hints.discountPercent')
      : t('hints.discountFixed');

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
        <p>
          {t('info.codesVsPromotions')}{' '}
          <Link href="/paiements/codes-promo" className="font-medium text-primary hover:underline">
            {t('info.managePromoCodesLink')}
          </Link>
        </p>
        <p className="mt-2">{t('info.targetHint')}</p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <PromotionPreviewBanner
        name={values.name}
        description={values.description}
        hasDiscount={values.hasDiscount}
        discountType={values.hasDiscount ? values.discountType : null}
        discountValue={values.hasDiscount ? values.discountValue : null}
        validFrom={values.validFrom || null}
        validUntil={values.validUntil || null}
        active={values.active}
        redemptionCount={mode === 'edit' ? initialPromotion?.redemptionCount : undefined}
        maxRedemptions={
          mode === 'edit' && initialPromotion?.maxRedemptions != null
            ? initialPromotion.maxRedemptions
            : values.maxRedemptions.trim()
              ? Number(values.maxRedemptions)
              : null
        }
      />

      <Input
        label={t('fields.name')}
        name="name"
        value={values.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={fieldErrors.name}
        required
      />

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-atg-fg">
          {tCommon('description')}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder={t('fields.descriptionPlaceholder')}
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
          {t('fields.hasDiscount')}
        </label>
      </div>

      {values.hasDiscount ? (
        <>
          <div>
            <label
              htmlFor={discountTypeId}
              className="mb-2 block text-sm font-medium text-atg-fg"
            >
              {t('fields.discountType')}
            </label>
            <select
              id={discountTypeId}
              value={values.discountType}
              onChange={(e) =>
                updateField('discountType', e.target.value as PromoCodeDiscountType)
              }
              className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="percent">{discountTypeLabels.percent}</option>
              <option value="fixed_amount">{discountTypeLabels.fixed_amount}</option>
            </select>
          </div>
          <Input
            label={
              values.discountType === 'percent'
                ? t('fields.discountValuePercent')
                : t('fields.discountValueFixed')
            }
            name="discountValue"
            type="number"
            min="0.01"
            step="0.01"
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
          label={t('fields.validFromOptional')}
          name="validFrom"
          type="date"
          value={values.validFrom}
          onChange={(e) => updateField('validFrom', e.target.value)}
          error={fieldErrors.validFrom}
        />
        <Input
          label={t('fields.validUntilOptional')}
          name="validUntil"
          type="date"
          value={values.validUntil}
          onChange={(e) => updateField('validUntil', e.target.value)}
          error={fieldErrors.validUntil}
        />
      </div>

      <Input
        label={t('fields.maxRedemptions')}
        name="maxRedemptions"
        type="number"
        min="1"
        step="1"
        value={values.maxRedemptions}
        onChange={(e) => updateField('maxRedemptions', e.target.value)}
        hint={t('hints.maxRedemptions')}
        error={fieldErrors.maxRedemptions}
      />

      {mode === 'edit' && initialPromotion ? (
        <div className="space-y-2 text-sm text-atg-muted">
          <p>
            {t('usage.label')}{' '}
            <strong className="text-atg-fg">{initialPromotion.redemptionCount}</strong>
            {initialPromotion.maxRedemptions != null
              ? ` / ${initialPromotion.maxRedemptions}`
              : ` ${t('usage.unlimited')}`}
          </p>
          <p>
            {t('checkoutId')}{' '}
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
          {t('fields.active')}
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={t('saving')}>
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/paiements/promotions">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
