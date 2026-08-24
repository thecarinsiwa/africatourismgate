'use client';

import type { HeroSlide } from '@africatourismgate/types';
import { Skeleton } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { HeroSlideForm } from './hero-slide-form';

type HeroSlideEditPageProps = {
  slideId: string;
};

export function HeroSlideEditPage({ slideId }: HeroSlideEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const tCommonForm = useTranslations('modules.common.form');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; slide: HeroSlide }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getHeroSlide(slideId)
      .then((slide) => {
        if (!cancelled) setState({ status: 'ready', slide });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', message: getAboutErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [getAboutErrorMessage, slideId]);

  if (state.status === 'loading') {
    return (
      <AdminIntroPage
        routePath="contenu/hero/id"
        backHref="/contenu/site?tab=hero"
        backLabelKey="backLabel"
      >
        <Skeleton className="h-96 w-full max-w-2xl" />
        <p className="sr-only">{tCommonForm('loading')}</p>
      </AdminIntroPage>
    );
  }

  if (state.status === 'error') {
    return (
      <AdminIntroPage
        routePath="contenu/hero/id"
        backHref="/contenu/site?tab=hero"
        backLabelKey="backLabel"
      >
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      </AdminIntroPage>
    );
  }

  return (
    <AdminIntroPage
      routePath="contenu/hero/id"
      backHref="/contenu/site?tab=hero"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <HeroSlideForm mode="edit" slideId={slideId} initialSlide={state.slide} />
      </div>
    </AdminIntroPage>
  );
}
