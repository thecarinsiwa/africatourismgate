import type { AuditFields } from './index.js';

export type AboutResourceType = 'financial' | 'media';

export type AboutResourceStatus = 'draft' | 'published';

export interface AboutResource extends AuditFields {
  id: string;
  type: AboutResourceType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  status: AboutResourceStatus;
  locale: string;
}

export interface PublicAboutResource {
  id: string;
  type: AboutResourceType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  locale: string;
}

export interface CreateAboutResourceRequest {
  type: AboutResourceType;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  externalUrl?: string | null;
  publishedAt?: string | null;
  sortOrder?: number;
  status?: AboutResourceStatus;
  locale?: string;
}

export type UpdateAboutResourceRequest = Partial<CreateAboutResourceRequest>;

export interface AboutResourcesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: AboutResourceType;
  status?: AboutResourceStatus;
  locale?: string;
}

export interface PublicAboutResourcesListQuery {
  page?: number;
  limit?: number;
  type?: AboutResourceType;
  locale?: string;
}
