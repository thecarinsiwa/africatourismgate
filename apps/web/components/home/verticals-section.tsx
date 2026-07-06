'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { PublicWhyUsContent, PublicWhyUsItem, WhyUsIconKey } from '@africatourismgate/types';
import { getPublicWhyUsForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from './use-scroll-animation';

const WHY_US_ICONS: Record<WhyUsIconKey, ReactNode> = {
  globe: (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  search: (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  booking: (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  support: (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
};

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
    linkUrl: links[i] ?? '/a-propos/qui-nous-sommes',
    iconKey: iconKeys[i] ?? 'globe',
  }));
}

const FALLBACK_LINKS = [
  '/a-propos/qui-nous-sommes',
  '/a-propos/comment-nous-travaillons',
  '/a-propos/responsabilite',
  '/a-propos/contact',
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
  const t = useTranslations();
  const locale = useAppLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [content, setContent] = useState<PublicWhyUsContent | null>(null);

  const fallbackItems = mapFallbackItems(t.whyUs.items, FALLBACK_LINKS);

  useEffect(() => {
    let cancelled = false;
    void getPublicWhyUsForLocale(locale).then(({ content: fetched }) => {
      if (!cancelled) setContent(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const title = content?.section?.title ?? t.whyUs.title;
  const subtitle = content?.section?.subtitle ?? t.whyUs.subtitle;
  const items = toDisplayItems(content, fallbackItems);

  return (
    <section
      id="about"
      ref={ref}
      className="scroll-mt-24 bg-atg-elevated py-16 transition-colors dark:bg-atg-surface sm:py-24"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 max-w-2xl mx-auto text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 id="why-heading" className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-atg-muted">{subtitle}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`group text-center ${isVisible ? 'animate-flip-in-y' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary text-primary transition-all duration-500 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary/5 group-hover:shadow-lg">
                {WHY_US_ICONS[item.iconKey]}
              </div>

              <h3 className="mb-2 text-lg font-bold text-atg-fg">{item.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-atg-muted">{item.description}</p>

              <Link
                href={item.linkUrl}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover hover:underline"
              >
                {t.whyUs.learnMore}
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
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
