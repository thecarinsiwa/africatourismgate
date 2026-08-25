import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EmailBrandingValue } from '@africatourismgate/types';
import { DEFAULT_EMAIL_BRANDING } from './email-branding.constants';
import { IsNull, Repository } from 'typeorm';
import { OrganizationSettings } from '../../entities/generated';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeHex(value: unknown): string | undefined {
  const raw = optionalString(value);
  if (!raw) return undefined;
  const match = /^#?([0-9a-fA-F]{6})$/.exec(raw);
  if (!match) return undefined;
  return `#${match[1].toUpperCase()}`;
}

@Injectable()
export class EmailBrandingService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly settingsRepository: Repository<OrganizationSettings>,
  ) {}

  async resolveForOrganization(organizationId: string): Promise<EmailBrandingValue> {
    const [emailSetting, platformSetting] = await Promise.all([
      this.loadSetting(organizationId, 'email', 'email_branding'),
      this.loadSetting(organizationId, 'branding', 'platform'),
    ]);

    const email = asRecord(emailSetting?.settingValue);
    const platform = asRecord(platformSetting?.settingValue);

    const displayName =
      optionalString(email.displayName) ??
      optionalString(platform.displayName) ??
      DEFAULT_EMAIL_BRANDING.displayName;

    const logoUrl =
      optionalString(email.logoUrl) ?? optionalString(platform.logoUrl);

    const primaryColor =
      normalizeHex(email.primaryColor) ??
      normalizeHex(platform.primaryColor) ??
      DEFAULT_EMAIL_BRANDING.primaryColor;

    const secondaryColor =
      normalizeHex(email.secondaryColor) ?? normalizeHex(platform.secondaryColor);

    const footerText = optionalString(email.footerText);

    const welcomeSubject = optionalString(email.welcomeSubject);
    const bookingSubject = optionalString(email.bookingSubject);

    return {
      displayName,
      ...(logoUrl ? { logoUrl } : {}),
      ...(primaryColor ? { primaryColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(footerText ? { footerText } : {}),
      ...(welcomeSubject ? { welcomeSubject } : {}),
      ...(bookingSubject ? { bookingSubject } : {}),
    };
  }

  /** Fusionne un override partiel (preview admin) sur le branding résolu. */
  mergeWithOverride(
    base: EmailBrandingValue,
    override?: Partial<EmailBrandingValue>,
  ): EmailBrandingValue {
    if (!override) {
      return base;
    }

    const displayName =
      optionalString(override.displayName) ?? base.displayName;
    const logoUrl = optionalString(override.logoUrl) ?? base.logoUrl;
    const primaryColor =
      normalizeHex(override.primaryColor) ?? base.primaryColor;
    const secondaryColor =
      normalizeHex(override.secondaryColor) ?? base.secondaryColor;
    const footerText = optionalString(override.footerText) ?? base.footerText;
    const welcomeSubject =
      optionalString(override.welcomeSubject) ?? base.welcomeSubject;
    const bookingSubject =
      optionalString(override.bookingSubject) ?? base.bookingSubject;

    return {
      displayName,
      ...(logoUrl ? { logoUrl } : {}),
      ...(primaryColor ? { primaryColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(footerText ? { footerText } : {}),
      ...(welcomeSubject ? { welcomeSubject } : {}),
      ...(bookingSubject ? { bookingSubject } : {}),
    };
  }

  private async loadSetting(
    organizationId: string,
    settingGroup: string,
    settingKey: string,
  ): Promise<OrganizationSettings | null> {
    return this.settingsRepository.findOne({
      where: {
        organizationId,
        settingGroup,
        settingKey,
        deletedAt: IsNull(),
      },
    });
  }
}
