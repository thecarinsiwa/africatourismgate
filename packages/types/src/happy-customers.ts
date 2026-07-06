import type { AuditFields } from './index.js';

export type HappyCustomersStatus = 'draft' | 'published';

export type HappyCustomersColorKey = 'primary' | 'secondary';

export interface HappyCustomersSection {
  id: string;
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageAlt: string;
  badgeValue: string;
  badgeLabel: string;
  locale: string;
  status: HappyCustomersStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface HappyCustomersStat extends AuditFields {
  id: string;
  label: string;
  percentValue: number;
  colorKey: HappyCustomersColorKey;
  sortOrder: number;
  status: HappyCustomersStatus;
  locale: string;
}

export interface PublicHappyCustomersSection {
  id: string;
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageAlt: string;
  badgeValue: string;
  badgeLabel: string;
  locale: string;
}

export interface PublicHappyCustomersStat {
  id: string;
  label: string;
  percentValue: number;
  colorKey: HappyCustomersColorKey;
  sortOrder: number;
  locale: string;
}

export interface PublicHappyCustomersContent {
  section: PublicHappyCustomersSection | null;
  stats: PublicHappyCustomersStat[];
}

export interface CreateHappyCustomersSectionRequest {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageAlt: string;
  badgeValue?: string;
  badgeLabel?: string;
  locale?: string;
  status?: HappyCustomersStatus;
}

export type UpdateHappyCustomersSectionRequest = Partial<CreateHappyCustomersSectionRequest>;

export interface HappyCustomersSectionsListQuery {
  page?: number;
  limit?: number;
  locale?: string;
  status?: HappyCustomersStatus;
}

export interface CreateHappyCustomersStatRequest {
  label: string;
  percentValue: number;
  colorKey: HappyCustomersColorKey;
  sortOrder?: number;
  status?: HappyCustomersStatus;
  locale?: string;
}

export type UpdateHappyCustomersStatRequest = Partial<CreateHappyCustomersStatRequest>;

export interface HappyCustomersStatsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  status?: HappyCustomersStatus;
}

export interface PublicHappyCustomersListQuery {
  locale?: string;
}
