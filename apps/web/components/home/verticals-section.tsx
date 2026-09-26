'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { PublicWhyUsContent, PublicWhyUsItem, WhyUsIconKey } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { ABOUT_PATHS } from '../../lib/about/routes';
import { getPublicWhyUsForLocale } from '../../lib/api/public';
import { useScrollAnimation } from './use-scroll-animation';

const WHY_US_ICON_CLASS = 'h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10';

const WHY_US_ICON_PATHS: Record<WhyUsIconKey, ReactNode> = {
  globe: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  search: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  ),
  booking: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  ),
  support: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
    />
  ),
};

function WhyUsIcon({ iconKey }: { iconKey: WhyUsIconKey }) {
  return (
    <svg
      className={WHY_US_ICON_CLASS}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      {WHY_US_ICON_PATHS[iconKey]}
    </svg>
  );
}

type DisplayItem = {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  iconKey: WhyUsIconKey;
};

function mapFallbackItems(
  items: { title: string; description: string }[],
  links: readonly string[],
): DisplayItem[] {
  const iconKeys: WhyUsIconKey[] = ['globe', 'search', 'booking', 'support'];
  return items.map((item, i) => ({
    id: `fallback-${i}`,
    title: item.title,
    description: item.description,
    linkUrl: links[i] ?? ABOUT_PATHS.whoWeAre,
    iconKey: iconKeys[i] ?? 'globe',
  }));
}

const FALLBACK_LINKS = [
  ABOUT_PATHS.whoWeAre,
  ABOUT_PATHS.howWeWork,
  ABOUT_PATHS.responsibility,
  ABOUT_PATHS.contact,
] as const;

function toDisplayItems(content: PublicWhyUsContent | null, fallbackItems: DisplayItem[]): DisplayItem[] {
  if (!content?.items.length) return fallbackItems;
  return content.items.map((item: PublicWhyUsItem) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    linkUrl: item.linkUrl,
    iconKey: item.iconKey,
  }));
}

export function WhyUsSection() {
  const t = useTranslations('whyUs');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [content, setContent] = useState<PublicWhyUsContent | null>(null);

  const fallbackItems = mapFallbackItems(
    t.raw('items') as { title: string; description: string }[],
    FALLBACK_LINKS,
  );

  useEffect(() => {
    let cancelled = false;
    void getPublicWhyUsForLocale(locale)
      .then(({ content: fetched, usedLocaleFallback }) => {
        if (!cancelled) {
          setContent(usedLocaleFallback ? null : fetched);
        }
      })
      .catch(() => {
        /* keep translation fallbacks */
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const title = content?.section?.title ?? t('title');
  const subtitle = content?.section?.subtitle ?? t('subtitle');
  const items = toDisplayItems(content, fallbackItems);

  return (
    <section
      id="about"
      ref={ref}
      className="scroll-mt-24 bg-atg-elevated py-12 transition-colors dark:bg-atg-surface sm:py-16 lg:py-24"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-12 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <h2
            id="why-heading"
            className="text-xl font-bold uppercase tracking-wide text-atg-fg sm:text-2xl lg:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-atg-muted sm:mt-4 sm:text-base">{subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`group text-center ${isVisible ? 'animate-flip-in-y' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-primary transition-all duration-500 group-hover:scale-105 group-hover:bg-primary/5 group-hover:shadow-md sm:mb-4 sm:h-20 sm:w-20 sm:group-hover:scale-110 lg:mb-5 lg:h-24 lg:w-24">
                <WhyUsIcon iconKey={item.iconKey} />
              </div>

              <h3 className="mb-1.5 text-base font-bold text-atg-fg sm:mb-2 sm:text-lg">{item.title}</h3>
              <p className="mb-3 text-sm leading-relaxed text-atg-muted sm:mb-4">{item.description}</p>

              <Link
                href={item.linkUrl}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover hover:underline"
              >
                {t('learnMore')}
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
