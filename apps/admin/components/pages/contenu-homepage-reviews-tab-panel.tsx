'use client';

import { Button, Card, Switch } from '@africatourismgate/ui';
import {
  DEFAULT_HOMEPAGE_REVIEWS,
  normalizeHomepageReviews,
  type HomepageReviewsSettingValue,
} from '@africatourismgate/types/organization-settings';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

const SETTING_GROUP = 'site';
const SETTING_KEY = 'homepage_reviews';

export function ContenuHomepageReviewsTabPanel() {
  const t = useTranslations('modules.homepageReviews');
  const tCommon = useTranslations('modules.common');
  const { organizationSettings: getErrorMessage } = useAdminErrorMessages();

  const [access, setAccess] = useState<'loading' | 'denied' | 'read' | 'write'>('loading');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<HomepageReviewsSettingValue>({
    ...DEFAULT_HOMEPAGE_REVIEWS,
  });
  const [initialValues, setInitialValues] = useState<HomepageReviewsSettingValue>({
    ...DEFAULT_HOMEPAGE_REVIEWS,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canWrite = access === 'write';
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );
  const bothOff = !values.showTripadvisorReviews && !values.showPlatformReviews;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        if (cancelled) return;
        const canRead =
          me.isSuperAdmin || me.permissions.includes('organization_settings.read');
        if (!canRead) {
          setAccess('denied');
          return;
        }
        setAccess(
          me.isSuperAdmin || me.permissions.includes('organization_settings.write')
            ? 'write'
            : 'read',
        );

        const page = await client.listOrganizationSettings({ page: 1, limit: 100 });
        if (cancelled) return;
        const setting = page.data.find(
          (item) => item.settingGroup === SETTING_GROUP && item.settingKey === SETTING_KEY,
        );
        const next = normalizeHomepageReviews(setting?.settingValue ?? null);
        setValues(next);
        setInitialValues(next);
      } catch (error) {
        if (!cancelled) setLoadError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [getErrorMessage]);

  function update(patch: Partial<HomepageReviewsSettingValue>) {
    setValues((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) return;
    setSaveError(null);
    setSaved(false);
    setSaving(true);
    try {
      await getApiClient().bulkUpsertOrganizationSettings({
        settings: [
          {
            settingGroup: SETTING_GROUP,
            settingKey: SETTING_KEY,
            settingValue: values as unknown as Record<string, unknown>,
          },
        ],
      });
      setInitialValues(values);
      setSaved(true);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (access === 'loading' || (loading && access !== 'denied')) {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }
  if (access === 'denied') {
    return <p className="text-sm text-destructive">{t('denied')}</p>;
  }
  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold">{t('heading')}</h2>
        <p className="text-sm text-atg-muted">{t('description')}</p>
        {!canWrite ? <p className="text-sm text-atg-muted">{t('readOnlyHint')}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Switch
          id="homepage-reviews-tripadvisor"
          label={
            values.showTripadvisorReviews
              ? t('fields.tripadvisorOn')
              : t('fields.tripadvisorOff')
          }
          checked={values.showTripadvisorReviews}
          onChange={(event) => update({ showTripadvisorReviews: event.target.checked })}
          disabled={!canWrite}
        />

        <Switch
          id="homepage-reviews-platform"
          label={
            values.showPlatformReviews ? t('fields.platformOn') : t('fields.platformOff')
          }
          checked={values.showPlatformReviews}
          onChange={(event) => update({ showPlatformReviews: event.target.checked })}
          disabled={!canWrite}
        />

        {bothOff ? (
          <p className="text-sm text-atg-muted">{t('bothOffHint')}</p>
        ) : null}

        {canWrite ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!isDirty || saving}>
              {saving ? t('saving') : t('saveButton')}
            </Button>
            {saved && !isDirty ? (
              <p className="text-sm text-atg-muted" role="status">
                {t('saved')}
              </p>
            ) : null}
            {saveError ? (
              <p className="text-sm text-destructive" role="alert">
                {saveError}
              </p>
            ) : null}
          </div>
        ) : null}
      </form>
    </Card>
  );
}
