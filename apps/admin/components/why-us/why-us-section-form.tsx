'use client';

import { Button, Card, DataTableBadge, Input, useToast } from '@africatourismgate/ui';
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
  const { toast } = useToast();
  const t = useTranslations('modules.about.whyUs.section');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tCommonForm = useTranslations('modules.common.form');
  const tToast = useTranslations('modules.common.toast');
  const titleId = useId();
  const subtitleId = useId();
  const statusId = useId();

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  /** Collapsed by default so the cards list stays above the fold. */
  const [expanded, setExpanded] = useState(false);

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
        setExpanded(true);
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
      toast({ variant: 'success', message: tToast('saved') });
      setExpanded(false);
      onSaved?.();
    } catch (err) {
      setError(getAboutErrorMessage(err));
      toast({ variant: 'error', message: getAboutErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

  const summaryTitle = values.title.trim() || t('emptyTitle');
  const summarySubtitle = values.subtitle.trim();

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atg-border px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-atg-fg">{t('heading')}</h2>
            <DataTableBadge variant={values.status === 'published' ? 'success' : 'muted'}>
              {values.status === 'published' ? tStatus('published') : tStatus('draft')}
            </DataTableBadge>
          </div>
          {!expanded ? (
            <p className="mt-1 truncate text-sm text-atg-muted" title={summarySubtitle || undefined}>
              <span className="font-medium text-atg-fg">{summaryTitle}</span>
              {summarySubtitle ? ` — ${summarySubtitle}` : null}
            </p>
          ) : (
            <p className="mt-1 text-xs text-atg-muted">{t('hint')}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? t('collapse') : t('expand')}
        </Button>
      </div>

      {expanded ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2">
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
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {canWrite ? (
            <Button type="submit" loading={saving} loadingText={t('saving')}>
              {t('saveButton')}
            </Button>
          ) : null}
        </form>
      ) : null}
    </Card>
  );
}
