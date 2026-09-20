'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { Button, Input } from '@africatourismgate/ui';
import type {
  CreateLegalPageRequest,
  LegalPage,
  LegalPageSectionKey,
  LegalPageStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import { toDatetimeLocalValue } from '../../lib/about/form-utils';
import { getApiClient } from '../../lib/auth/api';
import { LEGAL_PAGE_SECTION_KEYS } from '../../lib/legal/constants';
import { isRichTextEmpty } from '../../lib/rich-text';
import { RichTextEditor } from '../rich-text-editor';

export type LegalPageFormValues = {
  sectionKey: LegalPageSectionKey;
  title: string;
  content: string;
  status: LegalPageStatus;
  publishedAt: string;
  locale: string;
};

const defaultValues: LegalPageFormValues = {
  sectionKey: 'terms-of-use',
  title: '',
  content: '',
  status: 'draft',
  publishedAt: '',
  locale: 'fr',
};

function legalPageToFormValues(page: LegalPage): LegalPageFormValues {
  return {
    sectionKey: page.sectionKey,
    title: page.title,
    content: page.content,
    status: page.status,
    publishedAt: toDatetimeLocalValue(page.publishedAt),
    locale: page.locale,
  };
}

function toPayload(values: LegalPageFormValues): CreateLegalPageRequest {
  const publishedAt = values.publishedAt.trim();
  return {
    sectionKey: values.sectionKey,
    title: values.title.trim(),
    content: values.content.trim(),
    status: values.status,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    locale: values.locale,
  };
}

type LegalPageFormProps = {
  mode: 'create' | 'edit';
  pageId?: string;
  initialPage?: LegalPage;
};

export function LegalPageForm({ mode, pageId, initialPage }: LegalPageFormProps) {
  const { about: getLegalErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.legal.pages.form');
  const tSections = useTranslations('modules.legal.sections');
  const tCommon = useTranslations('modules.common');
  const tLocale = useTranslations('modules.about.locale');
  const tStatus = useTranslations('modules.about.status');
  const router = useRouter();
  const statusId = useId();
  const localeId = useId();
  const sectionId = useId();
  const [values, setValues] = useState<LegalPageFormValues>(() =>
    initialPage ? legalPageToFormValues(initialPage) : defaultValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LegalPageFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof LegalPageFormValues>(key: K, value: LegalPageFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  function validate(): boolean {
    const errors: Partial<Record<keyof LegalPageFormValues, string>> = {};
    if (!values.title.trim()) {
      errors.title = tCommon('validation.titleRequired');
    }
    if (isRichTextEmpty(values.content)) {
      errors.content = t('validation.contentRequired');
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
        const created = await client.createLegalPage(payload);
        router.push(`/contenu/legal/${created.id}`);
        router.refresh();
      } else if (pageId) {
        await client.updateLegalPage(pageId, payload);
        router.push('/contenu/legal');
        router.refresh();
      }
    } catch (error) {
      setFormError(getLegalErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-3 text-sm text-atg-muted">
        <p>{t('info.sectionLocaleUnique')}</p>
        <p className="mt-2">{t('info.publishedAtHint')}</p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor={sectionId} className="mb-2 block text-sm font-medium text-atg-fg">
          {t('fields.section')}
        </label>
        {mode === 'edit' ? (
          <p className="text-sm text-atg-muted">{tSections(values.sectionKey)}</p>
        ) : (
          <select
            id={sectionId}
            value={values.sectionKey}
            onChange={(e) => updateField('sectionKey', e.target.value as LegalPageSectionKey)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {LEGAL_PAGE_SECTION_KEYS.map((key) => (
              <option key={key} value={key}>
                {tSections(key)}
              </option>
            ))}
          </select>
        )}
      </div>

      <Input
        label={t('fields.title')}
        name="title"
        value={values.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={fieldErrors.title}
        required
      />

      <RichTextEditor
        label={t('fields.content')}
        value={values.content}
        onChange={(html) => updateField('content', html)}
        placeholder={t('fields.contentPlaceholder')}
        contentClassName="min-h-[280px]"
      />
      {fieldErrors.content ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.content}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="mb-2 block text-sm font-medium text-atg-fg">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) => updateField('status', e.target.value as LegalPageStatus)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>
        <div>
          <label htmlFor={localeId} className="mb-2 block text-sm font-medium text-atg-fg">
            {t('fields.locale')}
          </label>
          <select
            id={localeId}
            value={values.locale}
            onChange={(e) => updateField('locale', e.target.value)}
            className="w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
        </div>
      </div>

      <Input
        label={t('fields.publishedAtOptional')}
        name="publishedAt"
        type="datetime-local"
        value={values.publishedAt}
        onChange={(e) => updateField('publishedAt', e.target.value)}
        hint={t('hints.publishedAt')}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" loading={submitting} loadingText={t('saving')}>
          {mode === 'create' ? t('createButton') : t('saveButton')}
        </Button>
        <Button type="button" variant="outline" href="/contenu/legal">
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  );
}
