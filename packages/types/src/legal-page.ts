import type { AuditFields } from './index.js';

export type LegalPageSectionKey = 'terms-of-use';

export type LegalPageStatus = 'draft' | 'published';

export interface LegalPage extends AuditFields {
  id: string;
  sectionKey: LegalPageSectionKey;
  title: string;
  content: string;
  status: LegalPageStatus;
  publishedAt: string | null;
  locale: string;
}

export interface PublicLegalPage {
  id: string;
  sectionKey: LegalPageSectionKey;
  title: string;
  content: string;
  publishedAt: string | null;
  locale: string;
}

export interface CreateLegalPageRequest {
  sectionKey: LegalPageSectionKey;
  title: string;
  content: string;
  status?: LegalPageStatus;
  publishedAt?: string | null;
  locale?: string;
}

export type UpdateLegalPageRequest = Partial<CreateLegalPageRequest>;

export interface LegalPagesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: LegalPageStatus;
  sectionKey?: LegalPageSectionKey;
  locale?: string;
}

export interface PublicLegalPagesListQuery {
  sectionKey?: LegalPageSectionKey;
  locale?: string;
}
