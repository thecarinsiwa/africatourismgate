import type { AuditFields } from './index.js';

export type LegalPageSectionKey = 'terms-of-use' | 'privacy-policy';

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
  /**
   * Pages whose last edit (or creation if never updated) is within the last N days.
   * Used by Contenu › Legal KPI cards (“Recently updated”).
   */
  updatedWithinDays?: number;
  /**
   * Pages whose last edit (or creation if never updated) is older than N days.
   * Used by Contenu › Legal KPI cards (“Outdated”).
   */
  updatedOlderThanDays?: number;
}

export interface PublicLegalPagesListQuery {
  sectionKey?: LegalPageSectionKey;
  locale?: string;
}
