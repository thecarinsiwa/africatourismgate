import type {
  CreateBlogCommentRequest,
  PublicBlogComment,
  PublicBlogEngagement,
  UpsertBlogReactionRequest,
} from '@africatourismgate/types';
import { ensureClientAccessToken } from '../auth/client-session';

const defaultApiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org/api'
    : 'http://localhost:3000/api';
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

async function requestJson<T>(
  path: string,
  init?: RequestInit,
  options?: { requireAuth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const token = await ensureClientAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (options?.requireAuth) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

/** Public read; sends Bearer when logged in so viewerReaction can be resolved. */
export async function getBlogEngagement(
  slug: string,
): Promise<PublicBlogEngagement> {
  return requestJson<PublicBlogEngagement>(
    `/public/blog/${encodeURIComponent(slug)}/engagement`,
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
    { requireAuth: true },
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
    { requireAuth: true },
  );
}
