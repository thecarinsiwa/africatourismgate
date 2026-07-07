'use client';

import type { HeroSlide } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { getApiClient } from '../../lib/auth/api';
import { HeroSlideForm } from './hero-slide-form';

type HeroSlideEditPageProps = {
  slideId: string;
};

export function HeroSlideEditPage({ slideId }: HeroSlideEditPageProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const tCommonForm = useTranslations('modules.common.form');
  const t = useTranslations('modules.heroSlides.edit');
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
    return <p className="text-sm text-muted-foreground">{tCommonForm('loading')}</p>;
  }

  if (state.status === 'error') {
    return <p className="text-sm text-destructive">{state.message}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
      <HeroSlideForm mode="edit" slideId={slideId} initialSlide={state.slide} />
    </div>
  );
}
