'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DatePicker,
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
import {
  composePromotionDescription,
  parsePromotionDescription,
  type PromotionTargetAudience,
} from '../../lib/promotions-target-meta';
import { PromotionPreviewBanner } from './promotion-preview-banner';

export type PromotionFormValues = {
  name: string;
  description: string;
  targetAudience: PromotionTargetAudience;
  targetDetails: string;
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
  targetAudience: 'all',
  targetDetails: '',
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
  const parsed = parsePromotionDescription(promo.description);
  return {
    name: promo.name,
    description: parsed.description,
    targetAudience: parsed.targetAudience,
    targetDetails: parsed.targetDetails,
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
    description: composePromotionDescription({
      description: values.description,
      targetAudience: values.targetAudience,
      targetDetails: values.targetDetails,
    }),
    discountType: values.hasDiscount ? values.discountType : null,
    discountValue: values.hasDiscount ? Number(values.discountValue) : null,
    validFrom: values.validFrom.trim() || null,
    validUntil: values.validUntil.trim() || null,
    maxRedemptions: maxRaw ? Number(maxRaw) : null,
    active: values.active ? 1 : 0,
  };
}

function generateSuggestedPromoCode(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || 'PROMO'}${suffix}`;
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
  const targetDetailsId = useId();
  const [values, setValues] = useState<PromotionFormValues>(() =>
    initialPromotion ? promotionToFormValues(initialPromotion) : defaultValues,
  );
  const [suggestedCode, setSuggestedCode] = useState(() =>
    generateSuggestedPromoCode(initialPromotion?.name ?? ''),
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

  const targetAudienceOptions = useMemo(
    () => [
      { value: 'all', label: t('fields.targetAudienceAll') },
      { value: 'new_users', label: t('fields.targetAudienceNewUsers') },
      { value: 'specific_products', label: t('fields.targetAudienceSpecific') },
    ],
    [t],
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

    if (
      values.targetAudience === 'specific_products' &&
      !values.targetDetails.trim()
    ) {
      errors.targetDetails = t('validation.targetDetailsRequired');
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

  const previewTargetLabel =
    values.targetAudience === 'all'
      ? t('fields.targetAudienceAll')
      : values.targetAudience === 'new_users'
        ? t('fields.targetAudienceNewUsers')
        : values.targetDetails.trim() || t('fields.targetAudienceSpecific');

  const newPromoCodeHref = `/paiements/codes-promo/nouveau?code=${encodeURIComponent(suggestedCode)}`;

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      <div className="rounded-xl border border-atg-border/80 bg-gradient-to-br from-atg-elevated via-atg-elevated to-primary/5 px-4 py-3.5 text-sm text-atg-muted sm:px-5">
        <p>
          {t('info.codesVsPromotions')}{' '}
          <Link href="/paiements/codes-promo" className="font-medium text-primary hover:underline">
            {t('info.managePromoCodesLink')}
          </Link>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start">
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
              hint={t('hints.name')}
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
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.target')}
              </h2>
              <p className="mt-1 text-xs text-atg-muted">{t('sections.targetHint')}</p>
            </div>
            <Select
              label={t('fields.targetAudience')}
              name="targetAudience"
              value={values.targetAudience}
              options={targetAudienceOptions}
              onChange={(e) =>
                updateField('targetAudience', e.target.value as PromotionTargetAudience)
              }
            />
            {values.targetAudience === 'specific_products' ? (
              <Textarea
                id={targetDetailsId}
                label={t('fields.targetDetails')}
                name="targetDetails"
                rows={3}
                value={values.targetDetails}
                onChange={(e) => updateField('targetDetails', e.target.value)}
                placeholder={t('fields.targetDetailsPlaceholder')}
                error={fieldErrors.targetDetails}
                required
              />
            ) : (
              <p className="rounded-lg border border-dashed border-atg-border bg-atg-surface/40 px-3 py-2.5 text-xs text-atg-muted">
                {t('sections.targetAllHint')}
              </p>
            )}
          </Card>

          <Card variant="dashboard" padding="md" className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                {t('sections.promoCode')}
              </h2>
              <p className="mt-1 text-xs text-atg-muted">{t('sections.promoCodeHint')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <Input
                  label={t('fields.suggestedCode')}
                  name="suggestedCode"
                  value={suggestedCode}
                  onChange={(e) =>
                    setSuggestedCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
                  }
                  hint={t('hints.suggestedCode')}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSuggestedCode(generateSuggestedPromoCode(values.name))}
              >
                {t('actions.generateCode')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" href={newPromoCodeHref}>
                {t('actions.createPromoCode')}
              </Button>
              <Button type="button" variant="ghost" href="/paiements/codes-promo">
                {t('info.managePromoCodesLink')}
              </Button>
            </div>
          </Card>

          <div className="grid min-w-0 gap-6 md:grid-cols-2 md:items-stretch">
            <Card variant="dashboard" padding="md" className="min-w-0 w-full space-y-4">
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
                <div className="space-y-4">
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

            <Card variant="dashboard" padding="md" className="min-w-0 w-full space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
                  {t('sections.schedule')}
                </h2>
                <p className="mt-1 text-xs text-atg-muted">{t('sections.scheduleHint')}</p>
              </div>
              <div className="space-y-4">
                <DatePicker
                  label={t('fields.validFromOptional')}
                  name="validFrom"
                  value={values.validFrom}
                  max={values.validUntil || undefined}
                  onChange={(e) => updateField('validFrom', e.target.value)}
                  error={fieldErrors.validFrom}
                />
                <DatePicker
                  label={t('fields.validUntilOptional')}
                  name="validUntil"
                  value={values.validUntil}
                  min={values.validFrom || undefined}
                  onChange={(e) => updateField('validUntil', e.target.value)}
                  error={fieldErrors.validUntil}
                />
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
              </div>
            </Card>
          </div>

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
        </div>

        <aside className="min-w-0 space-y-3 lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t('sections.preview')}
          </p>
          <PromotionPreviewBanner
            name={values.name}
            description={values.description}
            coverImageUrl={mode === 'edit' ? initialPromotion?.coverImageUrl : null}
            hasDiscount={values.hasDiscount}
            discountType={values.hasDiscount ? values.discountType : null}
            discountValue={values.hasDiscount ? values.discountValue : null}
            validFrom={values.validFrom || null}
            validUntil={values.validUntil || null}
            active={values.active}
            redemptionCount={mode === 'edit' ? initialPromotion?.redemptionCount : undefined}
            maxRedemptions={previewMaxRedemptions}
            targetLabel={previewTargetLabel}
            suggestedCode={suggestedCode}
          />
          <p className="text-xs leading-relaxed text-atg-muted">{t('sections.previewHint')}</p>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap gap-3 border-t border-atg-border bg-atg-bg/95 px-1 py-3 backdrop-blur">
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
