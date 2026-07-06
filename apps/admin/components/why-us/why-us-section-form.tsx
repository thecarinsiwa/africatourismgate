'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import type { CreateWhyUsSectionRequest, WhyUsSection, WhyUsItemStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';

type SectionFormValues = {
  title: string;
  subtitle: string;
  status: WhyUsItemStatus;
};

const emptyValues: SectionFormValues = {
  title: '',
  subtitle: '',
  status: 'draft',
};

type WhyUsSectionFormProps = {
  locale: string;
  onSaved?: () => void;
};

export function WhyUsSectionForm({ locale, onSaved }: WhyUsSectionFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.whyUs.section');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const titleId = useId();
  const subtitleId = useId();
  const statusId = useId();

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('content.write'));
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listWhyUsSections({ locale, limit: 1 });
      const section = result.data[0] as WhyUsSection | undefined;
      if (section) {
        setSectionId(section.id);
        setValues({
          title: section.title,
          subtitle: section.subtitle,
          status: section.status,
        });
      } else {
        setSectionId(null);
        setValues(emptyValues);
      }
    } catch (err) {
      setError(getAboutErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getAboutErrorMessage, locale]);

  useEffect(() => {
    void loadSection();
  }, [loadSection]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canWrite) return;

    setSaving(true);
    setError(null);

    const payload: CreateWhyUsSectionRequest = {
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      status: values.status,
      locale,
    };

    try {
      const client = getApiClient();
      if (sectionId) {
        await client.updateWhyUsSection(sectionId, payload);
      } else {
        const created = await client.createWhyUsSection(payload);
        setSectionId(created.id);
      }
      onSaved?.();
    } catch (err) {
      setError(getAboutErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">{t('heading')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={titleId} className="mb-1 block text-sm font-medium">
            {t('fields.title')}
          </label>
          <Input
            id={titleId}
            value={values.title}
            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            disabled={!canWrite}
            required
          />
        </div>

        <div>
          <label htmlFor={subtitleId} className="mb-1 block text-sm font-medium">
            {t('fields.subtitle')}
          </label>
          <textarea
            id={subtitleId}
            value={values.subtitle}
            onChange={(e) => setValues((prev) => ({ ...prev, subtitle: e.target.value }))}
            disabled={!canWrite}
            required
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
            {tCommon('columns.status')}
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, status: e.target.value as WhyUsItemStatus }))
            }
            disabled={!canWrite}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {canWrite ? (
          <Button type="submit" disabled={saving}>
            {saving ? t('saving') : t('saveButton')}
          </Button>
        ) : null}
      </form>
    </Card>
  );
}
