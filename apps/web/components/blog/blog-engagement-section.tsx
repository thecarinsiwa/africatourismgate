'use client';

import type {
  BlogReactionCounts,
  BlogReactionType,
  PublicBlogComment,
  PublicBlogEngagement,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  createBlogComment,
  getBlogEngagement,
  upsertBlogReaction,
} from '../../lib/blog/engagement-api';
import { getBlogVisitorKey } from '../../lib/blog/visitor-key';
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
  const [shareUrl, setShareUrl] = useState('');
  const [counts, setCounts] = useState<BlogReactionCounts>(EMPTY_COUNTS);
  const [viewerReaction, setViewerReaction] = useState<BlogReactionType | null>(null);
  const [comments, setComments] = useState<PublicBlogComment[]>([]);
  const [reactionBusy, setReactionBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const visitorKey = getBlogVisitorKey();
    void getBlogEngagement(slug, visitorKey || undefined)
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
  }, [slug]);

  async function handleReaction(type: BlogReactionType) {
    const visitorKey = getBlogVisitorKey();
    if (!visitorKey) return;
    setReactionBusy(true);
    try {
      const next = await upsertBlogReaction(slug, {
        visitorKey,
        reactionType: type,
      });
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
    setCommentBusy(true);
    setCommentError(null);
    try {
      const created = await createBlogComment(slug, {
        ...input,
        visitorKey: getBlogVisitorKey() || undefined,
      });
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
      <BlogReactions
        counts={counts}
        viewerReaction={viewerReaction}
        busy={reactionBusy}
        onToggle={(type) => void handleReaction(type)}
      />
      <BlogComments
        comments={comments}
        submitting={commentBusy}
        error={commentError}
        onSubmit={handleComment}
      />
    </div>
  );
}
