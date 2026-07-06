import type { AuditFields } from './index.js';

export type AboutPageSectionKey =
  | 'who-we-are'
  | 'how-we-work'
  | 'governance'
  | 'responsibility';

export type AboutPageStatus = 'draft' | 'published';

export interface AboutPage extends AuditFields {
  id: string;
  sectionKey: AboutPageSectionKey;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: AboutPageStatus;
  publishedAt: string | null;
  locale: string;
}

export interface PublicAboutPage {
  id: string;
  sectionKey: AboutPageSectionKey;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  locale: string;
}

export interface CreateAboutPageRequest {
  sectionKey: AboutPageSectionKey;
  title: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  status?: AboutPageStatus;
  publishedAt?: string | null;
  locale?: string;
}

export type UpdateAboutPageRequest = Partial<CreateAboutPageRequest>;

export interface AboutPagesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AboutPageStatus;
  sectionKey?: AboutPageSectionKey;
  locale?: string;
}

export interface PublicAboutPagesListQuery {
  sectionKey?: AboutPageSectionKey;
  locale?: string;
}
