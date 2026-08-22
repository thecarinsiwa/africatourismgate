'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  Input,
  Select,
  Switch,
  Textarea,
} from '@africatourismgate/ui';
import type {
  CreatePromotionRequest,
  PromoCodeDiscountType,
  Promotion,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
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
  const descriptionId = useId();
  const [values, setValues] = useState<PromotionFormValues>(() =>
    initialPromotion ? promotionToFormValues(initialPromotion) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PromotionFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const discountTypeOptions = useMemo(
    () => [
      { value: 'percent', label: discountTypeLabels.percent },
      { value: 'fixed_amount', label: discountTypeLabels.fixed_amount },
    ],
    [discountTypeLabels],
  );

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

  const previewMaxRedemptions =
    mode === 'edit' && initialPromotion?.maxRedemptions != null
      ? initialPromotion.maxRedemptions
      : values.maxRedemptions.trim()
        ? Number(values.maxRedemptions)
        : null;

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto w-full max-w-5xl space-y-6"
    >
      <div className="rounded-xl border border-atg-border/80 bg-gradient-to-br from-atg-elevated via-atg-elevated to-primary/5 px-4 py-3.5 text-sm text-atg-muted sm:px-5">
        <p>
          {t('info.codesVsPromotions')}{' '}
          <Link href="/paiements/codes-promo" className="font-medium text-primary hover:underline">
            {t('info.managePromoCodesLink')}
          </Link>
        </p>
        <p className="mt-1.5 text-xs sm:text-sm">{t('info.targetHint')}</p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Card variant="dashboard" padding="md" className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.campaign')}
              </h2>
              <p className="mt-1 text-xs text-atg-muted">{t('sections.campaignHint')}</p>
            </div>
            <Input
              label={t('fields.name')}
              name="name"
              value={values.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={fieldErrors.name}
              required
            />
            <Textarea
              id={descriptionId}
              label={tCommon('description')}
              name="description"
              rows={4}
              value={values.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('fields.descriptionPlaceholder')}
            />
          </Card>

          <Card variant="dashboard" padding="md" className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                  {t('sections.discount')}
                </h2>
                <p className="mt-1 text-xs text-atg-muted">{t('sections.discountHint')}</p>
              </div>
              <Switch
                name="hasDiscount"
                checked={values.hasDiscount}
                onChange={(e) => updateField('hasDiscount', e.target.checked)}
                label={t('fields.hasDiscount')}
              />
            </div>

            {values.hasDiscount ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label={t('fields.discountType')}
                  name="discountType"
                  value={values.discountType}
                  options={discountTypeOptions}
                  onChange={(e) =>
                    updateField('discountType', e.target.value as PromoCodeDiscountType)
                  }
                />
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
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-atg-border bg-atg-surface/40 px-3 py-2.5 text-xs text-atg-muted">
                {t('sections.discountOff')}
              </p>
            )}
          </Card>

          <Card variant="dashboard" padding="md" className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.schedule')}
              </h2>
              <p className="mt-1 text-xs text-atg-muted">{t('sections.scheduleHint')}</p>
            </div>
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
          </Card>

          <Card variant="dashboard" padding="md" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                  {t('sections.publication')}
                </h2>
                <p className="mt-1 text-xs text-atg-muted">{t('sections.publicationHint')}</p>
              </div>
              <Switch
                name="active"
                checked={values.active}
                onChange={(e) => updateField('active', e.target.checked)}
                label={t('fields.active')}
              />
            </div>

            {mode === 'edit' && initialPromotion ? (
              <div className="space-y-2 rounded-lg border border-atg-border/70 bg-atg-surface/50 px-3 py-2.5 text-sm text-atg-muted">
                <p>
                  {t('usage.label')}{' '}
                  <strong className="text-atg-fg">{initialPromotion.redemptionCount}</strong>
                  {initialPromotion.maxRedemptions != null
                    ? ` / ${initialPromotion.maxRedemptions}`
                    : ` ${t('usage.unlimited')}`}
                </p>
                <p>
                  {t('checkoutId')}{' '}
                  <code className="break-all rounded bg-atg-elevated px-1.5 py-0.5 font-mono text-xs text-atg-fg">
                    {initialPromotion.id}
                  </code>
                </p>
              </div>
            ) : null}
          </Card>

          <div className="flex flex-wrap gap-3 border-t border-atg-border/60 pt-4">
            <Button type="submit" loading={submitting} loadingText={t('saving')}>
              {mode === 'create' ? t('createButton') : t('saveButton')}
            </Button>
            <Button type="button" variant="outline" href="/paiements/promotions">
              {t('cancelButton')}
            </Button>
          </div>
        </div>

        <aside className="min-w-0 space-y-3 lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t('sections.preview')}
          </p>
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
            maxRedemptions={previewMaxRedemptions}
          />
          <p className="text-xs leading-relaxed text-atg-muted">{t('sections.previewHint')}</p>
        </aside>
      </div>
    </form>
  );
}
