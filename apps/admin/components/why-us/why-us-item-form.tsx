'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateWhyUsItemRequest,
  WhyUsIconKey,
  WhyUsItem,
  WhyUsItemStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const ICON_KEYS: WhyUsIconKey[] = ['globe', 'search', 'booking', 'support'];

export type WhyUsItemFormValues = {
  title: string;
  description: string;
  linkUrl: string;
  iconKey: WhyUsIconKey;
  sortOrder: string;
  status: WhyUsItemStatus;
  locale: string;
};

const defaultValues: WhyUsItemFormValues = {
  title: '',
  description: '',
  linkUrl: '',
  iconKey: 'globe',
  sortOrder: '0',
  status: 'draft',
  locale: 'fr',
};

function itemToFormValues(item: WhyUsItem): WhyUsItemFormValues {
  return {
    title: item.title,
    description: item.description,
    linkUrl: item.linkUrl,
    iconKey: item.iconKey,
    sortOrder: String(item.sortOrder),
    status: item.status,
    locale: item.locale,
  };
}

function toPayload(values: WhyUsItemFormValues): CreateWhyUsItemRequest {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    linkUrl: values.linkUrl.trim(),
    iconKey: values.iconKey,
    sortOrder: Number.parseInt(values.sortOrder, 10) || 0,
    status: values.status,
    locale: values.locale,
  };
}

type WhyUsItemFormProps = {
  mode: 'create' | 'edit';
  itemId?: string;
  initialItem?: WhyUsItem;
  defaultLocale?: string;
};

export function WhyUsItemForm({
  mode,
  itemId,
  initialItem,
  defaultLocale = 'fr',
}: WhyUsItemFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.whyUs.items.form');
  const tIcons = useTranslations('modules.about.whyUs.icons');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();

  const titleId = useId();
  const descriptionId = useId();
  const linkUrlId = useId();
  const iconKeyId = useId();
  const sortOrderId = useId();
  const statusId = useId();
  const localeId = useId();

  const [values, setValues] = useState<WhyUsItemFormValues>(() =>
    initialItem ? itemToFormValues(initialItem) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof WhyUsItemFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = useCallback(
    <K extends keyof WhyUsItemFormValues>(key: K, value: WhyUsItemFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = (): boolean => {
    const errors: Partial<Record<keyof WhyUsItemFormValues, string>> = {};
    if (!values.title.trim()) errors.title = t('validation.titleRequired');
    if (!values.description.trim()) errors.description = t('validation.descriptionRequired');
    if (!values.linkUrl.trim()) errors.linkUrl = t('validation.linkUrlRequired');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createWhyUsItem(payload);
        router.push(`/contenu/pourquoi-nous/${created.id}`);
      } else if (itemId) {
        await client.updateWhyUsItem(itemId, payload);
        router.push('/contenu/pourquoi-nous');
      }
    } catch (error) {
      setSubmitError(getAboutErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
          {t('fields.title')}
        </label>
        <Input
          id={titleId}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={descriptionId} className="mb-1 block text-sm font-medium">
          {t('fields.description')}
        </label>
        <textarea
          id={descriptionId}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-invalid={Boolean(fieldErrors.description)}
        />
        {fieldErrors.description ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.description}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={linkUrlId} className="mb-1 block text-sm font-medium">
          {t('fields.linkUrl')}
        </label>
        <Input
          id={linkUrlId}
          value={values.linkUrl}
          onChange={(e) => updateField('linkUrl', e.target.value)}
          placeholder="/a-propos/qui-nous-sommes"
          aria-invalid={Boolean(fieldErrors.linkUrl)}
        />
        {fieldErrors.linkUrl ? (
          <p className="mt-1 text-sm text-destructive">{fieldErrors.linkUrl}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={iconKeyId} className="mb-1 block text-sm font-medium">
          {t('fields.iconKey')}
        </label>
        <select
          id={iconKeyId}
          value={values.iconKey}
          onChange={(e) => updateField('iconKey', e.target.value as WhyUsIconKey)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {tIcons(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={sortOrderId} className="mb-1 block text-sm font-medium">
            {t('fields.sortOrder')}
          </label>
          <Input
            id={sortOrderId}
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => updateField('sortOrder', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as WhyUsItemStatus)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>

        <div>
          <label htmlFor={localeId} className="mb-1 block text-sm font-medium">
            {t('fields.locale')}
          </label>
          <select
            id={localeId}
            value={values.locale}
            onChange={(e) => updateField('locale', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving
            ? t('saving')
            : mode === 'create'
              ? t('createButton')
              : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/pourquoi-nous">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
