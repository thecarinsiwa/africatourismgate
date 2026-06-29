import { BadRequestException } from '@nestjs/common';
import {
  AUTH_VISUAL_ICON_POSITIONS,
  AUTH_VISUAL_ICON_PRESETS,
  AUTH_VISUAL_ICON_SIZES,
} from './auth-visual.constants';
import {
  BOOKING_ITEM_TYPE_KEYS,
  isBookingMode,
  normalizeBookingItemTypeModes,
} from '@africatourismgate/types';
import type { AuthVisualDecorIcon } from '@africatourismgate/types';

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

function validateAuthVisualIcon(raw: unknown, index: number): AuthVisualDecorIcon {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException(`icons[${index}] est invalide.`);
  }
  const icon = raw as Record<string, unknown>;
  const preset = icon.preset;
  if (
    typeof preset !== 'string' ||
    !AUTH_VISUAL_ICON_PRESETS.includes(preset as AuthVisualDecorIcon['preset'])
  ) {
    throw new BadRequestException(
      `icons[${index}].preset doit être l'une des valeurs : ${AUTH_VISUAL_ICON_PRESETS.join(', ')}.`,
    );
  }

  const position = icon.position;
  if (
    typeof position !== 'string' ||
    !AUTH_VISUAL_ICON_POSITIONS.includes(position as AuthVisualDecorIcon['position'])
  ) {
    throw new BadRequestException(
      `icons[${index}].position doit être l'une des valeurs : ${AUTH_VISUAL_ICON_POSITIONS.join(', ')}.`,
    );
  }

  const size = icon.size;
  if (
    typeof size !== 'string' ||
    !AUTH_VISUAL_ICON_SIZES.includes(size as AuthVisualDecorIcon['size'])
  ) {
    throw new BadRequestException(
      `icons[${index}].size doit être l'une des valeurs : ${AUTH_VISUAL_ICON_SIZES.join(', ')}.`,
    );
  }

  const opacity = icon.opacity;
  if (
    typeof opacity !== 'number' ||
    !Number.isInteger(opacity) ||
    opacity < 0 ||
    opacity > 100
  ) {
    throw new BadRequestException(
      `icons[${index}].opacity doit être un entier entre 0 et 100.`,
    );
  }

  const enabled = icon.enabled;
  if (typeof enabled !== 'boolean') {
    throw new BadRequestException(`icons[${index}].enabled doit être un booléen.`);
  }

  const imageUrl = optionalString(icon.imageUrl, `icons[${index}].imageUrl`, 2048);
  if (preset === 'custom' && !imageUrl) {
    throw new BadRequestException(
      `icons[${index}].imageUrl est obligatoire pour le preset custom.`,
    );
  }

  return {
    preset: preset as AuthVisualDecorIcon['preset'],
    position: position as AuthVisualDecorIcon['position'],
    size: size as AuthVisualDecorIcon['size'],
    opacity,
    enabled,
    ...(imageUrl ? { imageUrl } : {}),
  };
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
    case 'auth_visual': {
      const rawIcons = value.icons;
      if (!Array.isArray(rawIcons)) {
        throw new BadRequestException('icons doit être un tableau.');
      }
      if (rawIcons.length > 6) {
        throw new BadRequestException('icons ne peut pas contenir plus de 6 éléments.');
      }
      const icons = rawIcons.map((icon, index) => validateAuthVisualIcon(icon, index));
      return { icons };
    }
    case 'item_type_modes': {
      const modes: Record<string, string> = {};
      for (const key of BOOKING_ITEM_TYPE_KEYS) {
        const mode = value[key];
        if (mode === undefined || mode === null) {
          continue;
        }
        if (!isBookingMode(mode)) {
          throw new BadRequestException(
            `${key} doit être « immediate » ou « assisted ».`,
          );
        }
        modes[key] = mode;
      }
      return normalizeBookingItemTypeModes(modes);
    }
    default:
      return value;
  }
}
