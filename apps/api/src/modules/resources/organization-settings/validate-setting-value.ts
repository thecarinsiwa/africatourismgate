import { BadRequestException } from '@nestjs/common';

function requireString(
  value: unknown,
  field: string,
  maxLength?: number,
): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} est obligatoire.`);
  }
  const trimmed = value.trim();
  if (maxLength && trimmed.length > maxLength) {
    throw new BadRequestException(
      `${field} ne doit pas dépasser ${maxLength} caractères.`,
    );
  }
  return trimmed;
}

function optionalString(value: unknown, field: string, maxLength?: number): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return requireString(value, field, maxLength);
}

function optionalHexColor(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} doit être une couleur hex (#RRGGBB).`);
  }
  const trimmed = value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    throw new BadRequestException(`${field} doit être une couleur hex (#RRGGBB).`);
  }
  return trimmed.toUpperCase();
}

function optionalHttpUrl(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} doit être une URL valide.`);
  }
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('invalid protocol');
    }
  } catch {
    throw new BadRequestException(`${field} doit être une URL valide (http ou https).`);
  }
  return trimmed;
}

export function validateSettingValue(
  settingKey: string,
  value: Record<string, unknown>,
): Record<string, unknown> {
  switch (settingKey) {
    case 'locale': {
      const currency = requireString(value.currency, 'currency', 3);
      if (currency.length !== 3) {
        throw new BadRequestException(
          'La devise doit comporter 3 lettres (ex. USD, CDF).',
        );
      }
      const language = optionalString(value.language, 'language', 10) ?? 'fr';
      const timezone =
        optionalString(value.timezone, 'timezone', 64) ?? 'Africa/Kinshasa';
      return {
        language,
        currency: currency.toUpperCase(),
        timezone,
      };
    }
    case 'defaults': {
      const holdMinutes = value.holdMinutes;
      if (
        holdMinutes !== undefined &&
        (typeof holdMinutes !== 'number' || holdMinutes < 0 || !Number.isInteger(holdMinutes))
      ) {
        throw new BadRequestException('holdMinutes doit être un entier positif.');
      }
      const allowGuestCheckout = value.allowGuestCheckout;
      if (
        allowGuestCheckout !== undefined &&
        typeof allowGuestCheckout !== 'boolean'
      ) {
        throw new BadRequestException(
          'allowGuestCheckout doit être un booléen.',
        );
      }
      return {
        holdMinutes: typeof holdMinutes === 'number' ? holdMinutes : 15,
        allowGuestCheckout:
          typeof allowGuestCheckout === 'boolean' ? allowGuestCheckout : true,
      };
    }
    case 'platform': {
      const displayName = requireString(value.displayName, 'displayName', 255);
      const primaryColor = optionalString(value.primaryColor, 'primaryColor', 32);
      const secondaryColor = optionalString(
        value.secondaryColor,
        'secondaryColor',
        32,
      );
      const logoUrl = optionalString(value.logoUrl, 'logoUrl', 2048);
      const faviconUrl = optionalString(value.faviconUrl, 'faviconUrl', 2048);
      return {
        displayName,
        ...(primaryColor ? { primaryColor } : {}),
        ...(secondaryColor ? { secondaryColor } : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(faviconUrl ? { faviconUrl } : {}),
      };
    }
    case 'email_branding': {
      const displayName = requireString(value.displayName, 'displayName', 255);
      const logoUrl = optionalString(value.logoUrl, 'logoUrl', 2048);
      const primaryColor = optionalHexColor(value.primaryColor, 'primaryColor');
      const secondaryColor = optionalHexColor(
        value.secondaryColor,
        'secondaryColor',
      );
      const footerText = optionalString(value.footerText, 'footerText', 500);
      const welcomeSubject = optionalString(
        value.welcomeSubject,
        'welcomeSubject',
        255,
      );
      const bookingSubject = optionalString(
        value.bookingSubject,
        'bookingSubject',
        255,
      );
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
    case 'web': {
      const location = optionalString(value.location, 'location', 255);
      const facebookUrl = optionalHttpUrl(value.facebookUrl, 'facebookUrl');
      const twitterUrl = optionalHttpUrl(value.twitterUrl, 'twitterUrl');
      const instagramUrl = optionalHttpUrl(value.instagramUrl, 'instagramUrl');
      return {
        ...(location ? { location } : {}),
        ...(facebookUrl ? { facebookUrl } : {}),
        ...(twitterUrl ? { twitterUrl } : {}),
        ...(instagramUrl ? { instagramUrl } : {}),
      };
    }
    case 'onekey': {
      const enabled = value.enabled;
      if (enabled !== undefined && typeof enabled !== 'boolean') {
        throw new BadRequestException('enabled doit être un booléen.');
      }
      const pointsPerMajorUnit = value.pointsPerMajorUnit;
      if (
        pointsPerMajorUnit !== undefined &&
        (typeof pointsPerMajorUnit !== 'number' ||
          pointsPerMajorUnit < 0 ||
          !Number.isInteger(pointsPerMajorUnit))
      ) {
        throw new BadRequestException(
          'pointsPerMajorUnit doit être un entier positif ou nul.',
        );
      }
      const programCode =
        optionalString(value.programCode, 'programCode', 32) ?? 'ONEKEY';
      return {
        enabled: typeof enabled === 'boolean' ? enabled : true,
        pointsPerMajorUnit:
          typeof pointsPerMajorUnit === 'number' ? pointsPerMajorUnit : 1,
        programCode: programCode.toUpperCase(),
      };
    }
    default:
      return value;
  }
}
