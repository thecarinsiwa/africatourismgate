'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { BlogPost } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { BlogPostForm } from './blog-post-form';

type BlogPostEditPageProps = {
  postId: string;
};

export function BlogPostEditPage({ postId }: BlogPostEditPageProps) {
  const { blog: getBlogErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.blog.edit');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; post: BlogPost }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('pageTitle'),
    entityLabel: state.status === 'ready' ? state.post.title : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const post = await getApiClient().getBlogPost(postId);
        if (!cancelled) setState({ status: 'ready', post });
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getBlogErrorMessage(error) });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [postId, getBlogErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/contenu/blog"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          {tCommon('back.toList')}
        </Link>
      </div>
    );
  }

  const { post } = state;

  return <BlogPostForm mode="edit" postId={postId} initialPost={post} />;
}
