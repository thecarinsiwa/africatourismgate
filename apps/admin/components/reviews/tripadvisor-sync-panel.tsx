'use client';

import {
  Button,
  Card,
  Input,
  PasswordInput,
  useToast,
} from '@africatourismgate/ui';
import {
  DEFAULT_TRIPADVISOR_SYNC,
  TRIPADVISOR_SYNC_SETTING_KEY,
  toTripadvisorSyncAdminValue,
} from '@africatourismgate/types/organization-settings';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePermissions } from '../../lib/auth/use-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

const SETTING_GROUP = 'site';

type FormValues = {
  locationId: string;
  apiKey: string;
  language: string;
};

type Props = {
  onSynced?: () => void;
};

export function TripadvisorSyncPanel({ onSynced }: Props) {
  const t = useTranslations('modules.reviews.tripadvisorSync');
  const tCommon = useTranslations('modules.common');
  const {
    organizationSettings: getSettingsError,
    reviews: getReviewsError,
  } = useAdminErrorMessages();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { toast } = useToast();

  const canReadSettings =
    isSuperAdmin || hasPermission('organization_settings.read');
  const canWriteSettings =
    isSuperAdmin || hasPermission('organization_settings.write');
  const canSync = isSuperAdmin || hasPermission('reviews.write');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [values, setValues] = useState<FormValues>({
    locationId: DEFAULT_TRIPADVISOR_SYNC.locationId,
    apiKey: '',
    language: DEFAULT_TRIPADVISOR_SYNC.language,
  });
  const [initial, setInitial] = useState<FormValues>({
    locationId: DEFAULT_TRIPADVISOR_SYNC.locationId,
    apiKey: '',
    language: DEFAULT_TRIPADVISOR_SYNC.language,
  });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const isDirty = useMemo(
    () =>
      values.locationId !== initial.locationId ||
      values.language !== initial.language ||
      values.apiKey.trim().length > 0,
    [initial, values],
  );

  const load = useCallback(async () => {
    if (!canReadSettings) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const page = await getApiClient().listOrganizationSettings({
        page: 1,
        limit: 100,
      });
      const setting = page.data.find(
        (item) =>
          item.settingGroup === SETTING_GROUP &&
          item.settingKey === TRIPADVISOR_SYNC_SETTING_KEY,
      );
      const admin = toTripadvisorSyncAdminValue(setting?.settingValue ?? null);
      const next: FormValues = {
        locationId: admin.locationId,
        apiKey: '',
        language: admin.language || DEFAULT_TRIPADVISOR_SYNC.language,
      };
      setValues(next);
      setInitial(next);
      setHasApiKey(admin.hasApiKey);
      setApiKeyMasked(admin.apiKeyMasked);
    } catch (error) {
      setLoadError(getSettingsError(error));
    } finally {
      setLoading(false);
    }
  }, [canReadSettings, getSettingsError]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!canWriteSettings) return;
    setSaving(true);
    try {
      const saved = await getApiClient().bulkUpsertOrganizationSettings({
        settings: [
          {
            settingGroup: SETTING_GROUP,
            settingKey: TRIPADVISOR_SYNC_SETTING_KEY,
            settingValue: {
              locationId: values.locationId.trim(),
              language: values.language.trim() || DEFAULT_TRIPADVISOR_SYNC.language,
              apiKey: values.apiKey.trim(),
            },
          },
        ],
      });
      const row = saved.find(
        (item) => item.settingKey === TRIPADVISOR_SYNC_SETTING_KEY,
      );
      const admin = toTripadvisorSyncAdminValue(row?.settingValue ?? null);
      const next: FormValues = {
        locationId: admin.locationId,
        apiKey: '',
        language: admin.language || DEFAULT_TRIPADVISOR_SYNC.language,
      };
      setValues(next);
      setInitial(next);
      setHasApiKey(admin.hasApiKey);
      setApiKeyMasked(admin.apiKeyMasked);
      toast({
        variant: 'success',
        title: t('toast.saved.title'),
        message: t('toast.saved.message'),
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: t('toast.saveFailed.title'),
        message: getSettingsError(error),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSync() {
    if (!canSync) return;
    setSyncing(true);
    try {
      const result = await getApiClient().syncTripadvisorReviews();
      toast({
        variant: 'success',
        title: t('toast.synced.title'),
        message: t('toast.synced.message', {
          imported: result.imported,
          updated: result.updated,
          skipped: result.skipped,
          pages: result.pages,
        }),
      });
      onSynced?.();
    } catch (error) {
      toast({
        variant: 'error',
        title: t('toast.syncFailed.title'),
        message: getReviewsError(error),
      });
    } finally {
      setSyncing(false);
    }
  }

  if (!canReadSettings && !canSync) {
    return null;
  }

  if (canReadSettings && loading) {
    return (
      <Card className="mb-6 p-6">
        <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="mb-6 p-6">
        <p className="text-sm text-destructive">{loadError}</p>
      </Card>
    );
  }

  return (
    <Card className="mb-6 p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold">{t('heading')}</h2>
        <p className="text-sm text-atg-muted">{t('description')}</p>
        <p className="text-sm text-atg-muted">{t('locationIdHelp')}</p>
      </div>

      {canReadSettings ? (
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Input
            id="tripadvisor-location-id"
            label={t('fields.locationId')}
            value={values.locationId}
            onChange={(event) => updateField('locationId', event.target.value)}
            placeholder={t('fields.locationIdPlaceholder')}
            disabled={!canWriteSettings}
            inputMode="numeric"
            autoComplete="off"
          />

          <div className="space-y-1">
            <PasswordInput
              id="tripadvisor-api-key"
              label={t('fields.apiKey')}
              value={values.apiKey}
              onChange={(event) => updateField('apiKey', event.target.value)}
              placeholder={
                hasApiKey
                  ? t('fields.apiKeyPlaceholderConfigured', { masked: apiKeyMasked })
                  : t('fields.apiKeyPlaceholder')
              }
              disabled={!canWriteSettings}
              autoComplete="new-password"
            />
            {hasApiKey && !values.apiKey.trim() ? (
              <p className="text-xs text-atg-muted">{t('fields.apiKeyKeepHint')}</p>
            ) : null}
          </div>

          <Input
            id="tripadvisor-language"
            label={t('fields.language')}
            value={values.language}
            onChange={(event) => updateField('language', event.target.value)}
            placeholder={t('fields.languagePlaceholder')}
            hint={t('fields.languageHint')}
            disabled={!canWriteSettings}
            autoComplete="off"
          />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {canWriteSettings ? (
              <Button type="submit" disabled={!isDirty || saving || syncing}>
                {saving ? t('saving') : t('saveButton')}
              </Button>
            ) : (
              <p className="text-sm text-atg-muted">{t('readOnlyHint')}</p>
            )}
            {canSync ? (
              <Button
                type="button"
                variant="secondary"
                disabled={syncing || saving}
                onClick={() => void handleSync()}
              >
                {syncing ? t('syncing') : t('syncButton')}
              </Button>
            ) : null}
          </div>
        </form>
      ) : canSync ? (
        <div className="space-y-3">
          <p className="text-sm text-atg-muted">{t('settingsDeniedHint')}</p>
          <Button
            type="button"
            disabled={syncing}
            onClick={() => void handleSync()}
          >
            {syncing ? t('syncing') : t('syncButton')}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
