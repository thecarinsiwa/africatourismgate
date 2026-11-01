import type {
  BlogReactionType,
  CreateBlogCommentRequest,
  PublicBlogComment,
  PublicBlogEngagement,
  UpsertBlogReactionRequest,
} from '@africatourismgate/types';

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export async function getBlogEngagement(
  slug: string,
  visitorKey?: string,
): Promise<PublicBlogEngagement> {
  const qs = visitorKey
    ? `?visitorKey=${encodeURIComponent(visitorKey)}`
    : '';
  return requestJson<PublicBlogEngagement>(
    `/public/blog/${encodeURIComponent(slug)}/engagement${qs}`,
  );
}

export async function upsertBlogReaction(
  slug: string,
  payload: UpsertBlogReactionRequest,
): Promise<PublicBlogEngagement> {
  return requestJson<PublicBlogEngagement>(
    `/public/blog/${encodeURIComponent(slug)}/reactions`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function createBlogComment(
  slug: string,
  payload: CreateBlogCommentRequest,
): Promise<PublicBlogComment> {
  return requestJson<PublicBlogComment>(
    `/public/blog/${encodeURIComponent(slug)}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export type { BlogReactionType, PublicBlogComment, PublicBlogEngagement };
