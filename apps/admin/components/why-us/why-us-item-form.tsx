'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Card, Input, Select, Textarea } from '@africatourismgate/ui';
import type {
  CreateWhyUsItemRequest,
  WhyUsIconKey,
  WhyUsItem,
  WhyUsItemStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePermissions } from '../../lib/auth/use-permissions';
import { useContentLocaleOptions } from '../../lib/content/use-content-locale-options';

export const WHY_US_HUB_HREF = '/contenu/site?tab=why-us';

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
  cancelHref?: string;
};

export function WhyUsItemForm({
  mode,
  itemId,
  initialItem,
  defaultLocale = 'fr',
  cancelHref = WHY_US_HUB_HREF,
}: WhyUsItemFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('content.write');
  const t = useTranslations('modules.about.whyUs.items.form');
  const tIcons = useTranslations('modules.about.whyUs.icons');
  const tCommon = useTranslations('modules.common');
  const tStatus = useTranslations('modules.about.status');
  const localeOptions = useContentLocaleOptions('modules.about.locale');
  const router = useRouter();

  const [values, setValues] = useState<WhyUsItemFormValues>(() =>
    initialItem ? itemToFormValues(initialItem) : { ...defaultValues, locale: defaultLocale },
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof WhyUsItemFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const iconOptions = useMemo(
    () => ICON_KEYS.map((key) => ({ value: key, label: tIcons(key) })),
    [tIcons],
  );

  const statusOptions = useMemo(
    () =>
      (['draft', 'published'] as const).map((status) => ({
        value: status,
        label: tStatus(status),
      })),
    [tStatus],
  );

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
    if (!canWrite) return;
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    const payload = toPayload(values);
    const client = getApiClient();

    try {
      if (mode === 'create') {
        const created = await client.createWhyUsItem(payload);
        router.push(`/contenu/pourquoi-nous/${created.id}`);
        router.refresh();
      } else if (itemId) {
        await client.updateWhyUsItem(itemId, payload);
        router.push(cancelHref);
        router.refresh();
      }
    } catch (error) {
      setSubmitError(getAboutErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
          <p>{t('info.sectionHint')}</p>
        </div>

        {submitError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {submitError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('fields.locale')}
            value={values.locale}
            options={localeOptions}
            onChange={(e) => updateField('locale', e.target.value)}
            disabled={!canWrite}
          />
          <Select
            label={tCommon('columns.status')}
            value={values.status}
            options={statusOptions}
            onChange={(e) => updateField('status', e.target.value as WhyUsItemStatus)}
            disabled={!canWrite}
          />
        </div>

        <Input
          label={t('fields.title')}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={fieldErrors.title}
          required
          disabled={!canWrite}
        />

        <Textarea
          label={t('fields.description')}
          rows={4}
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          error={fieldErrors.description}
          required
          disabled={!canWrite}
        />

        <Input
          label={t('fields.linkUrl')}
          value={values.linkUrl}
          onChange={(e) => updateField('linkUrl', e.target.value)}
          placeholder="/about/who-we-are"
          hint={t('fields.linkUrlHint')}
          error={fieldErrors.linkUrl}
          required
          disabled={!canWrite}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('fields.iconKey')}
            value={values.iconKey}
            options={iconOptions}
            onChange={(e) => updateField('iconKey', e.target.value as WhyUsIconKey)}
            disabled={!canWrite}
          />
          <Input
            label={t('fields.sortOrder')}
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(e) => updateField('sortOrder', e.target.value)}
            disabled={!canWrite}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {canWrite ? (
            <Button
              type="submit"
              loading={saving}
              loadingText={t('saving')}
            >
              {mode === 'create' ? t('createButton') : t('saveButton')}
            </Button>
          ) : null}
          <Button type="button" variant="outline" href={cancelHref} disabled={saving}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
