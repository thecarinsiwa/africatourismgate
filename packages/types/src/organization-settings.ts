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
