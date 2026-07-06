import type { AuditFields } from './index.js';

export type WhyUsIconKey = 'globe' | 'search' | 'booking' | 'support';

export type WhyUsItemStatus = 'draft' | 'published';

export interface WhyUsSection {
  id: string;
  title: string;
  subtitle: string;
  locale: string;
  status: WhyUsItemStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface WhyUsItem extends AuditFields {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  iconKey: WhyUsIconKey;
  sortOrder: number;
  status: WhyUsItemStatus;
  locale: string;
}

export interface PublicWhyUsSection {
  id: string;
  title: string;
  subtitle: string;
  locale: string;
}

export interface PublicWhyUsItem {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  iconKey: WhyUsIconKey;
  sortOrder: number;
  locale: string;
}

export interface PublicWhyUsContent {
  section: PublicWhyUsSection | null;
  items: PublicWhyUsItem[];
}

export interface CreateWhyUsSectionRequest {
  title: string;
  subtitle: string;
  locale?: string;
  status?: WhyUsItemStatus;
}

export type UpdateWhyUsSectionRequest = Partial<CreateWhyUsSectionRequest>;

export interface WhyUsSectionsListQuery {
  page?: number;
  limit?: number;
  locale?: string;
  status?: WhyUsItemStatus;
}

export interface CreateWhyUsItemRequest {
  title: string;
  description: string;
  linkUrl: string;
  iconKey: WhyUsIconKey;
  sortOrder?: number;
  status?: WhyUsItemStatus;
  locale?: string;
}

export type UpdateWhyUsItemRequest = Partial<CreateWhyUsItemRequest>;

export interface WhyUsItemsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  status?: WhyUsItemStatus;
}

export interface PublicWhyUsListQuery {
  locale?: string;
}
