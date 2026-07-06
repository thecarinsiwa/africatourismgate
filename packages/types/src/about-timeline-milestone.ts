import type { AuditFields } from './index.js';

export type AboutTimelineMilestoneStatus = 'draft' | 'published';

export interface AboutTimelineMilestone extends AuditFields {
  id: string;
  periodLabel: string;
  periodTitle: string;
  periodSortOrder: number;
  year: number;
  title: string;
  excerpt: string | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  status: AboutTimelineMilestoneStatus;
  locale: string;
}

export interface PublicAboutTimelineMilestone {
  id: string;
  periodLabel: string;
  periodTitle: string;
  periodSortOrder: number;
  year: number;
  title: string;
  excerpt: string | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  locale: string;
}

export interface CreateAboutTimelineMilestoneRequest {
  periodLabel: string;
  periodTitle: string;
  periodSortOrder?: number;
  year: number;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  status?: AboutTimelineMilestoneStatus;
  locale?: string;
}

export type UpdateAboutTimelineMilestoneRequest = Partial<CreateAboutTimelineMilestoneRequest>;

export interface AboutTimelineMilestonesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AboutTimelineMilestoneStatus;
  locale?: string;
}

export interface PublicAboutTimelineMilestonesListQuery {
  page?: number;
  limit?: number;
  locale?: string;
}
