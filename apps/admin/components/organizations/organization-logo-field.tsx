'use client';

import { cn, useToast } from '@africatourismgate/ui';
import type { BrandingPlatformValue } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';
import { OrganizationLogo } from './organization-logo';

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);
const LOGO_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg';

type OrganizationLogoFieldProps = {
  organizationId: string;
  name: string;
  /** Logo stocké sur l’entité organisation (repli). */
  organizationLogoUrl?: string | null;
  canWrite: boolean;
  isSuperAdmin: boolean;
  className?: string;
};

export function OrganizationLogoField({
  organizationId,
  name,
  organizationLogoUrl,
  canWrite,
  isSuperAdmin,
  className,
}: OrganizationLogoFieldProps) {
  const t = useTranslations('modules.organizations.detail.logo');
  const tValidation = useTranslations('modules.common.validation');
  const { toast } = useToast();
  const inputId = useId();

  const [brandingLogoUrl, setBrandingLogoUrl] = useState<string | null>(null);
  const [brandingPlatform, setBrandingPlatform] = useState<BrandingPlatformValue | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayLogoUrl = brandingLogoUrl?.trim() || organizationLogoUrl?.trim() || null;

  const loadBrandingLogo = useCallback(async () => {
    try {
      const result = await getApiClient().listOrganizationSettings({
        organizationId,
        page: 1,
        limit: 100,
      });
      const platformSetting = result.data.find(
        (s) => s.settingGroup === 'branding' && s.settingKey === 'platform',
      );
      const value = (platformSetting?.settingValue ?? null) as BrandingPlatformValue | null;
      setBrandingPlatform(value);
      setBrandingLogoUrl(
        typeof value?.logoUrl === 'string' && value.logoUrl.trim() ? value.logoUrl.trim() : null,
      );
    } catch {
      setBrandingPlatform(null);
      setBrandingLogoUrl(null);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadBrandingLogo();
  }, [loadBrandingLogo]);

  async function uploadLogo(file: File): Promise<string> {
    const session = getSession();
    if (!session?.accessToken) {
      throw new Error('session');
    }
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(`${resolveApiBaseUrl()}/organization-settings/upload-branding`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
      body,
    });
    if (!response.ok) {
      throw new Error('upload');
    }
    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      throw new Error('upload');
    }
    return payload.url;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !canWrite) return;

    try {
      if (!ALLOWED_LOGO_TYPES.has(file.type)) {
        toast({ variant: 'error', message: t('invalidFormat') });
        return;
      }
      if (file.size > LOGO_MAX_BYTES) {
        toast({ variant: 'error', message: t('tooLarge') });
        return;
      }

      setUploading(true);
      const url = await uploadLogo(file);
      const nextPlatform: BrandingPlatformValue = {
        displayName: brandingPlatform?.displayName?.trim() || name,
        primaryColor: brandingPlatform?.primaryColor,
        secondaryColor: brandingPlatform?.secondaryColor,
        faviconUrl: brandingPlatform?.faviconUrl,
        logoUrl: url,
      };

      await getApiClient().bulkUpsertOrganizationSettings({
        ...(isSuperAdmin ? { organizationId } : {}),
        settings: [
          {
            settingGroup: 'branding',
            settingKey: 'platform',
            settingValue: {
              displayName: nextPlatform.displayName,
              ...(nextPlatform.primaryColor ? { primaryColor: nextPlatform.primaryColor } : {}),
              ...(nextPlatform.secondaryColor
                ? { secondaryColor: nextPlatform.secondaryColor }
                : {}),
              logoUrl: url,
              ...(nextPlatform.faviconUrl ? { faviconUrl: nextPlatform.faviconUrl } : {}),
            },
          },
        ],
      });

      setBrandingPlatform(nextPlatform);
      setBrandingLogoUrl(url);
      toast({ variant: 'success', message: t('uploadSuccess') });
    } catch {
      toast({ variant: 'error', message: tValidation('uploadFailed') });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  if (!canWrite) {
    return (
      <OrganizationLogo
        name={name}
        logoUrl={displayLogoUrl}
        size="lg"
        className={className}
      />
    );
  }

  return (
    <div className={cn('relative shrink-0', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'group relative block cursor-pointer rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
          uploading && 'pointer-events-none opacity-70',
        )}
        title={t('changeHint')}
      >
        <OrganizationLogo name={name} logoUrl={displayLogoUrl} size="lg" />
        <span className="absolute inset-0 flex items-end justify-center rounded-lg bg-black/0 pb-1 text-[10px] font-medium text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
          {uploading ? t('uploading') : t('change')}
        </span>
        <input
          id={inputId}
          type="file"
          accept={LOGO_ACCEPT}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleFileChange(e)}
        />
      </label>
    </div>
  );
}
