'use client';

import type {
  BlogReactionCounts,
  BlogReactionType,
  PublicBlogComment,
  PublicBlogEngagement,
} from '@africatourismgate/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  ensureClientAccessToken,
  getWebSession,
} from '../../lib/auth/client-session';
import {
  createBlogComment,
  getBlogEngagement,
  upsertBlogReaction,
} from '../../lib/blog/engagement-api';
import { BlogComments } from './blog-comments';
import { BlogReactions } from './blog-reactions';
import { BlogShareBar } from './blog-share-bar';

const EMPTY_COUNTS: BlogReactionCounts = {
  like: 0,
  love: 0,
  clap: 0,
  wow: 0,
};

type BlogEngagementSectionProps = {
  slug: string;
  title: string;
};

export function BlogEngagementSection({ slug, title }: BlogEngagementSectionProps) {
  const t = useTranslations('blog.engagement');
  const pathname = usePathname();
  const [shareUrl, setShareUrl] = useState('');
  const [counts, setCounts] = useState<BlogReactionCounts>(EMPTY_COUNTS);
  const [viewerReaction, setViewerReaction] = useState<BlogReactionType | null>(null);
  const [comments, setComments] = useState<PublicBlogComment[]>([]);
  const [reactionBusy, setReactionBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [defaultAuthorName, setDefaultAuthorName] = useState('');
  const [defaultAuthorEmail, setDefaultAuthorEmail] = useState('');

  const loginHref = `/booking/login?next=${encodeURIComponent(pathname || `/blog/${slug}`)}`;

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      const token = await ensureClientAccessToken();
      if (cancelled) return;
      const user = getWebSession()?.user;
      setIsAuthenticated(Boolean(token && user));
      if (user) {
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        setDefaultAuthorName(name || user.email || '');
        setDefaultAuthorEmail(user.email || '');
      } else {
        setDefaultAuthorName('');
        setDefaultAuthorEmail('');
      }
      setSessionChecked(true);
    }

    void syncSession();

    const onAuthChanged = () => {
      void syncSession();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    };
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;
    let cancelled = false;
    void getBlogEngagement(slug)
      .then((payload: PublicBlogEngagement) => {
        if (cancelled) return;
        setCounts(payload.reactions);
        setViewerReaction(payload.viewerReaction);
        setComments(payload.comments);
      })
      .catch(() => {
        // Keep empty engagement UI if API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, [slug, sessionChecked, isAuthenticated]);

  async function handleReaction(type: BlogReactionType) {
    if (!isAuthenticated) return;
    setReactionBusy(true);
    try {
      const next = await upsertBlogReaction(slug, { reactionType: type });
      setCounts(next.reactions);
      setViewerReaction(next.viewerReaction);
      setComments(next.comments);
    } catch {
      // Ignore — keep previous state.
    } finally {
      setReactionBusy(false);
    }
  }

  async function handleComment(input: {
    authorName: string;
    authorEmail?: string;
    body: string;
  }) {
    if (!isAuthenticated) {
      setCommentError(t('signInRequired'));
      throw new Error('not_authenticated');
    }
    setCommentBusy(true);
    setCommentError(null);
    try {
      const created = await createBlogComment(slug, input);
      setComments((prev) => [created, ...prev]);
    } catch {
      setCommentError(t('commentSubmitError'));
      throw new Error('comment_submit_failed');
    } finally {
      setCommentBusy(false);
    }
  }

  return (
    <div className="mt-10 space-y-10 border-t border-atg-border pt-10">
      {shareUrl ? <BlogShareBar title={title} url={shareUrl} /> : null}

      <div className="space-y-3">
        <BlogReactions
          counts={counts}
          viewerReaction={isAuthenticated ? viewerReaction : null}
          busy={!sessionChecked || !isAuthenticated || reactionBusy}
          onToggle={(type) => {
            if (!isAuthenticated) return;
            void handleReaction(type);
          }}
        />
        {sessionChecked && !isAuthenticated ? (
          <p className="text-sm text-atg-muted">
            {t('signInPrompt')}{' '}
            <Link href={loginHref} className="font-medium text-primary hover:text-primary/80">
              {t('signInCta')}
            </Link>
          </p>
        ) : null}
      </div>

      {sessionChecked && isAuthenticated ? (
        <BlogComments
          comments={comments}
          submitting={commentBusy}
          error={commentError}
          defaultAuthorName={defaultAuthorName}
          defaultAuthorEmail={defaultAuthorEmail}
          onSubmit={handleComment}
        />
      ) : sessionChecked ? (
        <section className="space-y-4" aria-label={t('commentsAria')}>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
              {t('commentsTitle')}
            </h2>
            <p className="mt-1 text-sm text-atg-muted">
              {t('commentsCount', { count: comments.length })}
            </p>
          </div>
          {comments.length === 0 ? (
            <p className="text-sm text-atg-muted">{t('commentsEmpty')}</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-atg-fg">{comment.authorName}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-atg-muted">
                    {comment.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-atg-muted">
            {t('signInToComment')}{' '}
            <Link href={loginHref} className="font-medium text-primary hover:text-primary/80">
              {t('signInCta')}
            </Link>
          </p>
        </section>
      ) : (
        <p className="text-sm text-atg-muted">{t('checkingSession')}</p>
      )}
    </div>
  );
}
