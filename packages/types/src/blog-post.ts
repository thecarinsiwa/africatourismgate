import type { AuditFields } from './index.js';

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost extends AuditFields {
  id: string;
  title: string;
  slug: string;
  translationKey: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  locale: string;
}

export interface PublicBlogPostListItem {
  id: string;
  title: string;
  slug: string;
  /** Links FR/EN/ES translations when present (falls back to publishedAt). */
  translationKey?: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  locale: string;
}

export interface PublicBlogPostDetail extends PublicBlogPostListItem {
  content: string;
}

export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  translationKey?: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  status?: BlogPostStatus;
  publishedAt?: string | null;
  locale?: string;
}

export type UpdateBlogPostRequest = Partial<CreateBlogPostRequest>;

export interface BlogPostsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus;
  locale?: string;
}

export interface PublicBlogPostsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
}
