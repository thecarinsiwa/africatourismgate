'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PublicTeamMember } from '@africatourismgate/types';
import { browseTeamMembersForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from '../home/use-scroll-animation';

export function AboutTeamPageContent() {
  const locale = useAppLocale();
  const t = useTranslations();
  const a = t.about;
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
    return <p className="text-sm text-atg-muted">{a.loading}</p>;
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
        <p className="text-sm text-atg-muted">{a.team.empty}</p>
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
          {a.localeFallback}
        </p>
      ) : null}

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member, index) => (
          <li
            key={member.id}
            className="rounded-xl border border-atg-border bg-atg-elevated/50 p-6 text-center transition-shadow hover:shadow-md"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt=""
                width={120}
                height={120}
                unoptimized
                className="mx-auto mb-4 h-28 w-28 rounded-full border border-atg-border object-cover"
              />
            ) : (
              <div
                className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border border-atg-border bg-atg-surface text-2xl font-bold text-primary"
                aria-hidden
              >
                {member.name.charAt(0)}
              </div>
            )}
            <h2 className="text-lg font-semibold text-atg-fg">{member.name}</h2>
            <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
            {member.bio ? (
              <p className="mt-3 text-sm leading-relaxed text-atg-muted">{member.bio}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
