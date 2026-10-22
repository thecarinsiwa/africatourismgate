export interface LocaleSettingValue {
  language: string;
  currency: string;
  timezone: string;
}

export interface BookingDefaultsValue {
  holdMinutes: number;
  allowGuestCheckout: boolean;
}

export interface BrandingPlatformValue {
  displayName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export const AUTH_VISUAL_ICON_PRESETS = [
  'pin',
  'compass',
  'globe',
  'star',
  'custom',
] as const;
export type AuthVisualIconPreset = (typeof AUTH_VISUAL_ICON_PRESETS)[number];

export const AUTH_VISUAL_ICON_POSITIONS = [
  'bottom-right',
  'top-right',
  'bottom-left',
  'top-left',
] as const;
export type AuthVisualIconPosition = (typeof AUTH_VISUAL_ICON_POSITIONS)[number];

export const AUTH_VISUAL_ICON_SIZES = ['sm', 'md', 'lg'] as const;
export type AuthVisualIconSize = (typeof AUTH_VISUAL_ICON_SIZES)[number];

export interface AuthVisualDecorIcon {
  preset: AuthVisualIconPreset;
  imageUrl?: string;
  opacity: number;
  size: AuthVisualIconSize;
  position: AuthVisualIconPosition;
  enabled: boolean;
}

export interface AuthVisualSettingValue {
  icons: AuthVisualDecorIcon[];
}

export const DEFAULT_AUTH_VISUAL_ICONS: AuthVisualDecorIcon[] = [
  {
    preset: 'pin',
    opacity: 25,
    size: 'lg',
    position: 'bottom-right',
    enabled: true,
  },
  {
    preset: 'pin',
    opacity: 60,
    size: 'sm',
    position: 'top-right',
    enabled: true,
  },
];

export interface PublicAuthVisualIcon {
  preset: AuthVisualIconPreset;
  imageUrl: string | null;
  opacity: number;
  size: AuthVisualIconSize;
  position: AuthVisualIconPosition;
  enabled: boolean;
}

export interface PublicAuthVisual {
  icons: PublicAuthVisualIcon[];
}

/** Contact web — `organization_settings` (group `contact`, key `web`). */
export interface ContactWebSettingValue {
  location?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

export interface PublicContact {
  phone: string | null;
  email: string | null;
  location: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
}

export const DEFAULT_PUBLIC_CONTACT: PublicContact = {
  phone: '+243 815 000 000',
  email: 'support@africatourismgate.com',
  location: 'Kinshasa, RD Congo',
  facebookUrl: 'https://www.facebook.com/africatourismgate/',
  twitterUrl: 'https://x.com/Congotourismga1',
  instagramUrl: 'https://www.instagram.com/africatourismgate/',
};

/** Branding e-mails transactionnels — `organization_settings` (group `email`, key `email_branding`). */
export interface EmailBrandingValue {
  displayName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  footerText?: string;
  welcomeSubject?: string;
  bookingSubject?: string;
}

export const DEFAULT_EMAIL_BRANDING: EmailBrandingValue = {
  displayName: 'Africa Tourism Gate',
  primaryColor: '#0d9488',
};

export type EmailPreviewTemplate = 'welcome' | 'booking' | 'password_reset';

export interface EmailPreviewRequest {
  template: EmailPreviewTemplate;
  organizationId?: string;
  branding?: Partial<EmailBrandingValue>;
}

export interface EmailPreviewResponse {
  subject: string;
  html: string;
  text: string;
}

/** Programme OneKey — `organization_settings` (group `loyalty`, key `onekey`). */
export interface LoyaltyOneKeySettingValue {
  enabled: boolean;
  /** Points crédités par unité majeure de devise (ex. 1 USD → 1 point si taux = 1). */
  pointsPerMajorUnit: number;
  programCode: string;
}

export const DEFAULT_LOYALTY_ONEKEY_SETTING: LoyaltyOneKeySettingValue = {
  enabled: true,
  pointsPerMajorUnit: 1,
  programCode: 'ONEKEY',
};

/**
 * Moyens de paiement du site public (checkout web).
 * `organization_settings` group `booking`, key `payment_methods`.
 * Le POS n’est pas soumis à ce réglage.
 */
export type WebPaymentMethodKey = 'stripe' | 'cash' | 'bank_transfer' | 'mobile_money';

export type WebPaymentMethodsSettingValue = Partial<
  Record<WebPaymentMethodKey, boolean>
>;

export type ResolvedWebPaymentMethods = Record<WebPaymentMethodKey, boolean>;

export const WEB_PAYMENT_METHOD_KEYS = [
  'stripe',
  'cash',
  'bank_transfer',
  'mobile_money',
] as const satisfies readonly WebPaymentMethodKey[];

/** Stripe on by default ; cash / virement / Mobile Money off until admin enables (PR-08: cash web off). */
export const DEFAULT_WEB_PAYMENT_METHODS: ResolvedWebPaymentMethods = {
  stripe: true,
  cash: false,
  bank_transfer: false,
  mobile_money: false,
};

export function normalizeWebPaymentMethods(
  value?: WebPaymentMethodsSettingValue | null,
): ResolvedWebPaymentMethods {
  const resolved = { ...DEFAULT_WEB_PAYMENT_METHODS };
  if (!value || typeof value !== 'object') {
    return resolved;
  }
  for (const key of WEB_PAYMENT_METHOD_KEYS) {
    const flag = value[key];
    if (typeof flag === 'boolean') {
      resolved[key] = flag;
    }
  }
  return resolved;
}

export function isWebPaymentMethodEnabled(
  method: WebPaymentMethodKey,
  methods: ResolvedWebPaymentMethods = DEFAULT_WEB_PAYMENT_METHODS,
): boolean {
  return methods[method] === true;
}

/**
 * Verticales du menu public « Nos Produits ».
 * `organization_settings` group `catalog`, key `products_enabled`.
 * Désactivé = masqué de la nav / footer / recherche et inaccessible (404).
 */
export type CatalogProductKey =
  | 'hotels'
  | 'flights'
  | 'cars'
  | 'cruises'
  | 'tours'
  | 'packages';

export type CatalogProductsSettingValue = Partial<Record<CatalogProductKey, boolean>>;

export type ResolvedCatalogProducts = Record<CatalogProductKey, boolean>;

export const CATALOG_PRODUCT_KEYS = [
  'hotels',
  'flights',
  'cars',
  'cruises',
  'tours',
  'packages',
] as const satisfies readonly CatalogProductKey[];

/** Toutes les verticales activées par défaut (rétrocompatible). */
export const DEFAULT_CATALOG_PRODUCTS: ResolvedCatalogProducts = {
  hotels: true,
  flights: true,
  cars: true,
  cruises: true,
  tours: true,
  packages: true,
};

export function normalizeCatalogProducts(
  value?: CatalogProductsSettingValue | null,
): ResolvedCatalogProducts {
  const resolved = { ...DEFAULT_CATALOG_PRODUCTS };
  if (!value || typeof value !== 'object') {
    return resolved;
  }
  for (const key of CATALOG_PRODUCT_KEYS) {
    const flag = value[key];
    if (typeof flag === 'boolean') {
      resolved[key] = flag;
    }
  }
  return resolved;
}

export function isCatalogProductEnabled(
  product: CatalogProductKey,
  products: ResolvedCatalogProducts = DEFAULT_CATALOG_PRODUCTS,
): boolean {
  return products[product] === true;
}

/**
 * Bandeau d’annonce affiché au-dessus du header public.
 * `organization_settings` group `site`, key `announcement_banner`.
 */
export const ANNOUNCEMENT_BANNER_COLORS = [
  'red',
  'yellow',
  'green',
  'blue',
  'gray',
] as const;
export type AnnouncementBannerColor = (typeof ANNOUNCEMENT_BANNER_COLORS)[number];

export const ANNOUNCEMENT_BANNER_INTENSITIES = ['low', 'high'] as const;
export type AnnouncementBannerIntensity =
  (typeof ANNOUNCEMENT_BANNER_INTENSITIES)[number];

export const ANNOUNCEMENT_BANNER_LOCALES = ['fr', 'en', 'es'] as const;
export type AnnouncementBannerLocale = (typeof ANNOUNCEMENT_BANNER_LOCALES)[number];

export const ANNOUNCEMENT_BANNER_FALLBACK_LOCALE: AnnouncementBannerLocale = 'fr';
export const ANNOUNCEMENT_BANNER_TEXT_MAX_LENGTH = 280;
export const ANNOUNCEMENT_BANNER_CTA_LABEL_MAX_LENGTH = 40;
export const ANNOUNCEMENT_BANNER_CTA_URL_MAX_LENGTH = 512;

export interface AnnouncementBannerMessage {
  text: string;
  ctaLabel?: string;
}

export interface AnnouncementBannerSettingValue {
  enabled: boolean;
  color: AnnouncementBannerColor;
  intensity: AnnouncementBannerIntensity;
  messages: Partial<Record<AnnouncementBannerLocale, AnnouncementBannerMessage>>;
  /** `https://…` ou chemin relatif commençant par `/`. */
  ctaUrl?: string;
  ctaNewTab?: boolean;
}

/** Bandeau résolu pour une locale donnée (endpoint public). */
export interface PublicAnnouncementBanner {
  enabled: boolean;
  text: string;
  color: AnnouncementBannerColor;
  intensity: AnnouncementBannerIntensity;
  ctaLabel: string | null;
  ctaUrl: string | null;
  ctaNewTab: boolean;
  /** Empreinte du contenu ; change à chaque modification (fermeture côté client). */
  version: string;
}

export const DEFAULT_ANNOUNCEMENT_BANNER: AnnouncementBannerSettingValue = {
  enabled: false,
  color: 'blue',
  intensity: 'low',
  messages: {},
};

export const DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER: PublicAnnouncementBanner = {
  enabled: false,
  text: '',
  color: 'blue',
  intensity: 'low',
  ctaLabel: null,
  ctaUrl: null,
  ctaNewTab: false,
  version: '',
};

export function isAnnouncementBannerColor(value: unknown): value is AnnouncementBannerColor {
  return (
    typeof value === 'string' &&
    (ANNOUNCEMENT_BANNER_COLORS as readonly string[]).includes(value)
  );
}

export function isAnnouncementBannerIntensity(
  value: unknown,
): value is AnnouncementBannerIntensity {
  return (
    typeof value === 'string' &&
    (ANNOUNCEMENT_BANNER_INTENSITIES as readonly string[]).includes(value)
  );
}

export function isAnnouncementBannerLocale(value: unknown): value is AnnouncementBannerLocale {
  return (
    typeof value === 'string' &&
    (ANNOUNCEMENT_BANNER_LOCALES as readonly string[]).includes(value)
  );
}

/** `https?://…` ou chemin interne `/…` (pas `//`, qui serait un lien protocol-relative). */
export function isValidAnnouncementBannerCtaUrl(value: string): boolean {
  if (value.startsWith('/')) {
    return !value.startsWith('//');
  }
  return /^https?:\/\/[^\s]+$/i.test(value);
}

function normalizeAnnouncementBannerMessage(
  value: unknown,
): AnnouncementBannerMessage | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const text = typeof raw.text === 'string' ? raw.text.trim() : '';
  if (!text) {
    return null;
  }
  const ctaLabel = typeof raw.ctaLabel === 'string' ? raw.ctaLabel.trim() : '';
  return ctaLabel ? { text, ctaLabel } : { text };
}

/** Tolérant : ignore les valeurs invalides et retombe sur les valeurs par défaut. */
export function normalizeAnnouncementBanner(
  value?: Partial<AnnouncementBannerSettingValue> | Record<string, unknown> | null,
): AnnouncementBannerSettingValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_ANNOUNCEMENT_BANNER, messages: {} };
  }
  const raw = value as Record<string, unknown>;

  const messages: AnnouncementBannerSettingValue['messages'] = {};
  const rawMessages = raw.messages;
  if (rawMessages && typeof rawMessages === 'object' && !Array.isArray(rawMessages)) {
    for (const locale of ANNOUNCEMENT_BANNER_LOCALES) {
      const message = normalizeAnnouncementBannerMessage(
        (rawMessages as Record<string, unknown>)[locale],
      );
      if (message) {
        messages[locale] = message;
      }
    }
  }

  const resolved: AnnouncementBannerSettingValue = {
    enabled: raw.enabled === true,
    color: isAnnouncementBannerColor(raw.color)
      ? raw.color
      : DEFAULT_ANNOUNCEMENT_BANNER.color,
    intensity: isAnnouncementBannerIntensity(raw.intensity)
      ? raw.intensity
      : DEFAULT_ANNOUNCEMENT_BANNER.intensity,
    messages,
  };

  const ctaUrl = typeof raw.ctaUrl === 'string' ? raw.ctaUrl.trim() : '';
  if (ctaUrl && isValidAnnouncementBannerCtaUrl(ctaUrl)) {
    resolved.ctaUrl = ctaUrl;
    resolved.ctaNewTab = raw.ctaNewTab === true;
  }

  return resolved;
}

/** djb2 — empreinte courte et déterministe (Node + navigateur). */
function hashAnnouncementBannerContent(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/**
 * Résout le bandeau pour une locale : locale demandée, puis `fr`.
 * Sans texte disponible, le bandeau est considéré comme désactivé.
 */
export function resolvePublicAnnouncementBanner(
  value: Partial<AnnouncementBannerSettingValue> | Record<string, unknown> | null | undefined,
  locale?: string | null,
): PublicAnnouncementBanner {
  const normalized = normalizeAnnouncementBanner(value);
  const requested = isAnnouncementBannerLocale(locale)
    ? locale
    : ANNOUNCEMENT_BANNER_FALLBACK_LOCALE;
  const message =
    normalized.messages[requested] ??
    normalized.messages[ANNOUNCEMENT_BANNER_FALLBACK_LOCALE];

  if (!normalized.enabled || !message) {
    return { ...DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER };
  }

  const ctaUrl = normalized.ctaUrl ?? null;
  const ctaLabel = ctaUrl ? message.ctaLabel ?? null : null;
  const ctaNewTab = ctaUrl ? normalized.ctaNewTab === true : false;

  return {
    enabled: true,
    text: message.text,
    color: normalized.color,
    intensity: normalized.intensity,
    ctaLabel,
    ctaUrl: ctaLabel ? ctaUrl : null,
    ctaNewTab: ctaLabel ? ctaNewTab : false,
    version: hashAnnouncementBannerContent(
      JSON.stringify([
        message.text,
        normalized.color,
        normalized.intensity,
        ctaLabel,
        ctaUrl,
      ]),
    ),
  };
}

/**
 * Acomptes checkout — `organization_settings` group `booking`, key `deposits`.
 * Exactement un de `depositPercent` | `depositFixedCents` quand `enabled`.
 * Statut réservation : reste `pending_payment` jusqu’au solde intégral.
 */
export type BookingDepositsMode = 'percent' | 'fixed';

export interface BookingDepositsSettingValue {
  enabled: boolean;
  /** Entier 1–100. Mutuellement exclusif avec `depositFixedCents`. */
  depositPercent?: number;
  /** Montant fixe en centimes. Mutuellement exclusif avec `depositPercent`. */
  depositFixedCents?: number;
}

export interface ResolvedBookingDeposits {
  enabled: boolean;
  depositPercent: number | null;
  depositFixedCents: number | null;
}

export const DEFAULT_BOOKING_DEPOSITS: ResolvedBookingDeposits = {
  enabled: false,
  depositPercent: null,
  depositFixedCents: null,
};

export function normalizeBookingDeposits(
  value?: BookingDepositsSettingValue | null,
): ResolvedBookingDeposits {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_BOOKING_DEPOSITS };
  }

  const enabled = value.enabled === true;
  let depositPercent: number | null = null;
  let depositFixedCents: number | null = null;

  if (
    typeof value.depositPercent === 'number' &&
    Number.isInteger(value.depositPercent) &&
    value.depositPercent >= 1 &&
    value.depositPercent <= 100
  ) {
    depositPercent = value.depositPercent;
  }

  if (
    typeof value.depositFixedCents === 'number' &&
    Number.isInteger(value.depositFixedCents) &&
    value.depositFixedCents > 0
  ) {
    depositFixedCents = value.depositFixedCents;
  }

  // Données incohérentes : préférer le pourcentage.
  if (depositPercent != null && depositFixedCents != null) {
    depositFixedCents = null;
  }

  return { enabled, depositPercent, depositFixedCents };
}

/** Montant du premier encaissement (acompte ou total si acomptes désactivés). */
export function computeDepositRequiredCents(
  totalCents: number,
  deposits: ResolvedBookingDeposits = DEFAULT_BOOKING_DEPOSITS,
): number {
  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    return 0;
  }
  if (!deposits.enabled) {
    return totalCents;
  }
  if (deposits.depositFixedCents != null) {
    return Math.min(deposits.depositFixedCents, totalCents);
  }
  if (deposits.depositPercent != null) {
    return Math.min(
      Math.max(1, Math.round((totalCents * deposits.depositPercent) / 100)),
      totalCents,
    );
  }
  return totalCents;
}

export function bookingDepositsMode(
  deposits: ResolvedBookingDeposits,
): BookingDepositsMode {
  return deposits.depositFixedCents != null ? 'fixed' : 'percent';
}

/** @deprecated Prefer `organization-maintenances` table + types. Re-exported for legacy EAV. */
export type {
  PublicSiteMaintenance,
  SiteMaintenanceSettingValue,
} from './organization-maintenances.js';

export {
  DEFAULT_SITE_MAINTENANCE,
  isSiteMaintenanceActive,
  normalizeSiteMaintenance,
} from './organization-maintenances.js';

export interface OrganizationSetting {
  id: string;
  organizationId: string;
  settingGroup: string;
  settingKey: string;
  settingValue: Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpsertOrganizationSettingItem {
  settingGroup: string;
  settingKey: string;
  settingValue: Record<string, unknown>;
}

export interface BulkUpsertOrganizationSettingsRequest {
  organizationId?: string;
  settings: UpsertOrganizationSettingItem[];
}

export interface OrganizationSettingsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
}

export interface OrganizationBankAccount {
  id: string;
  organizationId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftBic: string | null;
  currency: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrganizationBankAccountsListQuery {
  page?: number;
  limit?: number;
  organizationId?: string;
}

export interface CreateOrganizationBankAccountRequest {
  organizationId?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftBic?: string;
  currency: string;
  isDefault?: boolean;
}

export type UpdateOrganizationBankAccountRequest =
  Partial<CreateOrganizationBankAccountRequest>;
