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
