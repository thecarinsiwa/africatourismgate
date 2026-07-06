'use client';

import { Button, Card, Input } from '@africatourismgate/ui';
import type {
  CreateHappyCustomersSectionRequest,
  HappyCustomersSection,
  HappyCustomersStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';

type SectionFormValues = {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageAlt: string;
  badgeValue: string;
  badgeLabel: string;
  status: HappyCustomersStatus;
};

const emptyValues: SectionFormValues = {
  title: '',
  subtitle: '',
  paragraph1: '',
  paragraph2: '',
  imageUrl: '',
  imageAlt: '',
  badgeValue: '10K+',
  badgeLabel: 'Clients',
  status: 'draft',
};

type HappyCustomersSectionFormProps = {
  locale: string;
};

export function HappyCustomersSectionForm({ locale }: HappyCustomersSectionFormProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.happyCustomers.section');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  const titleId = useId();
  const subtitleId = useId();
  const paragraph1Id = useId();
  const paragraph2Id = useId();
  const imageUrlId = useId();
  const imageAltId = useId();
  const badgeValueId = useId();
  const badgeLabelId = useId();
  const statusId = useId();

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
      const result = await getApiClient().listHappyCustomersSections({ locale, limit: 1 });
      const section = result.data[0] as HappyCustomersSection | undefined;
      if (section) {
        setSectionId(section.id);
        setValues({
          title: section.title,
          subtitle: section.subtitle,
          paragraph1: section.paragraph1,
          paragraph2: section.paragraph2,
          imageUrl: section.imageUrl,
          imageAlt: section.imageAlt,
          badgeValue: section.badgeValue,
          badgeLabel: section.badgeLabel,
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

    const payload: CreateHappyCustomersSectionRequest = {
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      paragraph1: values.paragraph1.trim(),
      paragraph2: values.paragraph2.trim(),
      imageUrl: values.imageUrl.trim(),
      imageAlt: values.imageAlt.trim(),
      badgeValue: values.badgeValue.trim(),
      badgeLabel: values.badgeLabel.trim(),
      status: values.status,
      locale,
    };

    try {
      const client = getApiClient();
      if (sectionId) {
        await client.updateHappyCustomersSection(sectionId, payload);
      } else {
        const created = await client.createHappyCustomersSection(payload);
        setSectionId(created.id);
      }
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
        <div className="grid gap-4 sm:grid-cols-2">
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
            <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
              {tCommon('columns.status')}
            </label>
            <select
              id={statusId}
              value={values.status}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, status: e.target.value as HappyCustomersStatus }))
              }
              disabled={!canWrite}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">{tStatus('draft')}</option>
              <option value="published">{tStatus('published')}</option>
            </select>
          </div>
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
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor={paragraph1Id} className="mb-1 block text-sm font-medium">
            {t('fields.paragraph1')}
          </label>
          <textarea
            id={paragraph1Id}
            value={values.paragraph1}
            onChange={(e) => setValues((prev) => ({ ...prev, paragraph1: e.target.value }))}
            disabled={!canWrite}
            required
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor={paragraph2Id} className="mb-1 block text-sm font-medium">
            {t('fields.paragraph2')}
          </label>
          <textarea
            id={paragraph2Id}
            value={values.paragraph2}
            onChange={(e) => setValues((prev) => ({ ...prev, paragraph2: e.target.value }))}
            disabled={!canWrite}
            required
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={imageUrlId} className="mb-1 block text-sm font-medium">
              {t('fields.imageUrl')}
            </label>
            <Input
              id={imageUrlId}
              value={values.imageUrl}
              onChange={(e) => setValues((prev) => ({ ...prev, imageUrl: e.target.value }))}
              disabled={!canWrite}
              required
            />
          </div>
          <div>
            <label htmlFor={imageAltId} className="mb-1 block text-sm font-medium">
              {t('fields.imageAlt')}
            </label>
            <Input
              id={imageAltId}
              value={values.imageAlt}
              onChange={(e) => setValues((prev) => ({ ...prev, imageAlt: e.target.value }))}
              disabled={!canWrite}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={badgeValueId} className="mb-1 block text-sm font-medium">
              {t('fields.badgeValue')}
            </label>
            <Input
              id={badgeValueId}
              value={values.badgeValue}
              onChange={(e) => setValues((prev) => ({ ...prev, badgeValue: e.target.value }))}
              disabled={!canWrite}
              required
            />
          </div>
          <div>
            <label htmlFor={badgeLabelId} className="mb-1 block text-sm font-medium">
              {t('fields.badgeLabel')}
            </label>
            <Input
              id={badgeLabelId}
              value={values.badgeLabel}
              onChange={(e) => setValues((prev) => ({ ...prev, badgeLabel: e.target.value }))}
              disabled={!canWrite}
              required
            />
          </div>
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
