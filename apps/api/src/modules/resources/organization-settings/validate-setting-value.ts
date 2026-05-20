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
      return {
        displayName,
        ...(primaryColor ? { primaryColor } : {}),
        ...(secondaryColor ? { secondaryColor } : {}),
      };
    }
    default:
      return value;
  }
}
