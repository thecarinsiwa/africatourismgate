'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PublicTeamMember } from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { teamMemberPath } from '../../lib/about/routes';
import { browseTeamMembersForLocale } from '../../lib/api/public';
import { useScrollAnimation } from '../home/use-scroll-animation';
import { stripHtml } from '../shared/rich-text';

export function AboutTeamPageContent() {
  const locale = useLocale();
  const t = useTranslations('about');
  const { ref, isVisible } = useScrollAnimation(0.08);

  const [members, setMembers] = useState<PublicTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [localeFallback, setLocaleFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void browseTeamMembersForLocale(locale, { limit: 50 })
      .then(({ response, usedLocaleFallback }) => {
        if (!cancelled) {
          setMembers(response.data);
          setLocaleFallback(usedLocaleFallback);
        }
      })
      .catch(() => {
        if (!cancelled) setMembers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" variant="primary" label={t('loading')} showLabel />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
        <p className="text-sm text-atg-muted">{t('team.empty')}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`space-y-6 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {localeFallback ? (
        <p className="rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {t('localeFallback')}
        </p>
      ) : null}

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-8">
        {members.map((member) => (
          <li key={member.id} className="flex">
            <TeamMemberCard member={member} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamMemberCard({ member }: { member: PublicTeamMember }) {
  const t = useTranslations('about.team');
  const bio = stripHtml(member.bio);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const profileHref = teamMemberPath(member.slug);

  useLayoutEffect(() => {
    const element = bioRef.current;
    if (!element || expanded) return;
    const measure = () => setOverflowing(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [bio, expanded]);

  return (
    <article className="flex w-full flex-col rounded-xl border border-atg-border bg-atg-elevated p-6 text-center shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[5px] hover:shadow-xl focus-within:-translate-y-[5px] focus-within:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:shadow-black/40">
      <Link href={profileHref} tabIndex={-1} aria-hidden className="mx-auto mb-4 block">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt=""
            width={128}
            height={128}
            unoptimized
            className="h-28 w-28 rounded-full border-2 border-atg-border object-cover"
          />
        ) : (
          <span className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-atg-border bg-atg-surface text-3xl font-bold text-primary dark:text-emerald-300">
            {member.name.charAt(0)}
          </span>
        )}
      </Link>

      <h2 className="text-lg font-semibold text-atg-fg">
        <Link href={profileHref} className="hover:text-primary dark:hover:text-emerald-300">
          {member.name}
        </Link>
      </h2>
      <p className="mt-1 text-sm font-medium text-primary dark:text-emerald-300">{member.role}</p>

      {bio ? (
        <div className="mt-3 text-left">
          <p
            ref={bioRef}
            id={`team-bio-${member.id}`}
            className={`text-sm leading-relaxed text-atg-muted ${expanded ? '' : 'line-clamp-3'}`}
          >
            {bio}
          </p>
          {overflowing || expanded ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls={`team-bio-${member.id}`}
              className="mt-1 text-sm font-medium text-primary underline-offset-2 hover:underline dark:text-emerald-300"
            >
              {expanded ? t('readLess') : t('readMore')}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <Link
          href={profileHref}
          aria-label={t('viewProfileAria', { name: member.name })}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-elevated"
        >
          {t('viewProfile')}
        </Link>
      </div>
    </article>
  );
}
