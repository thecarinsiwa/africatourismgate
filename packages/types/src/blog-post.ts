import type { AuditFields } from './index.js';

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost extends AuditFields {
  id: string;
  title: string;
  slug: string;
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

export const BLOG_REACTION_TYPES = ['like', 'love', 'clap', 'wow'] as const;
export type BlogReactionType = (typeof BLOG_REACTION_TYPES)[number];

export type BlogReactionCounts = Record<BlogReactionType, number>;

export interface PublicBlogComment {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface PublicBlogEngagement {
  reactions: BlogReactionCounts;
  viewerReaction: BlogReactionType | null;
  comments: PublicBlogComment[];
  commentsCount: number;
}

export interface UpsertBlogReactionRequest {
  visitorKey: string;
  reactionType: BlogReactionType;
}

export interface CreateBlogCommentRequest {
  visitorKey?: string;
  authorName: string;
  authorEmail?: string;
  body: string;
}
