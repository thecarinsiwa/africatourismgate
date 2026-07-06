'use client';

import { useEffect, useState } from 'react';
import type { PublicAboutTimelineMilestone } from '@africatourismgate/types';
import { browseAboutTimelineMilestonesForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from '../home/use-scroll-animation';
import { AboutTimeline } from './about-timeline';

export function AboutHistoryPageContent() {
  const locale = useAppLocale();
  const t = useTranslations();
  const a = t.about;
  const { ref, isVisible } = useScrollAnimation(0.08);

  const [milestones, setMilestones] = useState<PublicAboutTimelineMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [localeFallback, setLocaleFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void browseAboutTimelineMilestonesForLocale(locale, { limit: 100 })
      .then(({ response, usedLocaleFallback }) => {
        if (!cancelled) {
          setMilestones(response.data);
          setLocaleFallback(usedLocaleFallback);
        }
      })
      .catch(() => {
        if (!cancelled) setMilestones([]);
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

  if (milestones.length === 0) {
    return (
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
        <p className="text-sm text-atg-muted">{a.timeline.empty}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {localeFallback ? (
        <p className="mb-6 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {a.localeFallback}
        </p>
      ) : null}

      {a.timeline.intro ? (
        <p className="mb-8 max-w-3xl text-base leading-relaxed text-atg-muted">{a.timeline.intro}</p>
      ) : null}

      <AboutTimeline
        milestones={milestones}
        readMoreLabel={a.timeline.readMore}
        sidebarAria={a.timeline.sidebarAria}
      />
    </div>
  );
}
