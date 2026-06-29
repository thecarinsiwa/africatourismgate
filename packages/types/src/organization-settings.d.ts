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
export declare const AUTH_VISUAL_ICON_PRESETS: readonly ["pin", "compass", "globe", "star", "custom"];
export type AuthVisualIconPreset = (typeof AUTH_VISUAL_ICON_PRESETS)[number];
export declare const AUTH_VISUAL_ICON_POSITIONS: readonly ["bottom-right", "top-right", "bottom-left", "top-left"];
export type AuthVisualIconPosition = (typeof AUTH_VISUAL_ICON_POSITIONS)[number];
export declare const AUTH_VISUAL_ICON_SIZES: readonly ["sm", "md", "lg"];
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
export declare const DEFAULT_AUTH_VISUAL_ICONS: AuthVisualDecorIcon[];
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
export declare const DEFAULT_PUBLIC_CONTACT: PublicContact;
export interface EmailBrandingValue {
    displayName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    footerText?: string;
    welcomeSubject?: string;
    bookingSubject?: string;
}
export declare const DEFAULT_EMAIL_BRANDING: EmailBrandingValue;
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
export interface LoyaltyOneKeySettingValue {
    enabled: boolean;
    pointsPerMajorUnit: number;
    programCode: string;
}
export declare const DEFAULT_LOYALTY_ONEKEY_SETTING: LoyaltyOneKeySettingValue;
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
export type UpdateOrganizationBankAccountRequest = Partial<CreateOrganizationBankAccountRequest>;
