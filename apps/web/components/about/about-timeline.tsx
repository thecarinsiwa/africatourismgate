'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PublicAboutTimelineMilestone } from '@africatourismgate/types';
import { cn } from '@africatourismgate/ui';

export type TimelinePeriod = {
  key: string;
  periodLabel: string;
  periodTitle: string;
  periodSortOrder: number;
  milestones: PublicAboutTimelineMilestone[];
};

export function groupTimelinePeriods(
  milestones: PublicAboutTimelineMilestone[],
): TimelinePeriod[] {
  const map = new Map<string, TimelinePeriod>();

  for (const milestone of milestones) {
    const key = `${milestone.periodSortOrder}|${milestone.periodLabel}|${milestone.periodTitle}`;
    const existing = map.get(key);
    if (existing) {
      existing.milestones.push(milestone);
      continue;
    }
    map.set(key, {
      key,
      periodLabel: milestone.periodLabel,
      periodTitle: milestone.periodTitle,
      periodSortOrder: milestone.periodSortOrder,
      milestones: [milestone],
    });
  }

  return Array.from(map.values())
    .map((period) => ({
      ...period,
      milestones: [...period.milestones].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.year - b.year,
      ),
    }))
    .sort(
      (a, b) =>
        a.periodSortOrder - b.periodSortOrder ||
        a.periodLabel.localeCompare(b.periodLabel),
    );
}

type AboutTimelineProps = {
  milestones: PublicAboutTimelineMilestone[];
  readMoreLabel: string;
  sidebarAria: string;
};

export function AboutTimeline({ milestones, readMoreLabel, sidebarAria }: AboutTimelineProps) {
  const periods = useMemo(() => groupTimelinePeriods(milestones), [milestones]);
  const [activePeriodKey, setActivePeriodKey] = useState(periods[0]?.key ?? '');
  const periodRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollingRef = useRef(false);

  const scrollToPeriod = useCallback((periodKey: string) => {
    const element = periodRefs.current.get(periodKey);
    if (!element) return;
    scrollingRef.current = true;
    setActivePeriodKey(periodKey);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, 600);
  }, []);

  useEffect(() => {
    if (periods.length === 0) return;
    if (!periods.some((period) => period.key === activePeriodKey)) {
      setActivePeriodKey(periods[0].key);
    }
  }, [periods, activePeriodKey]);

  useEffect(() => {
    const elements = periods
      .map((period) => periodRefs.current.get(period.key))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target instanceof HTMLElement && top.target.dataset.periodKey) {
          setActivePeriodKey(top.target.dataset.periodKey);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [periods]);

  if (periods.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
      <aside className="hidden shrink-0 lg:block lg:w-64 xl:w-72">
        <nav
          className="sticky top-24 rounded-xl border border-atg-border bg-atg-elevated/80 p-5 shadow-sm backdrop-blur-sm"
          aria-label={sidebarAria}
        >
          <ul className="space-y-5">
            {periods.map((period) => {
              const active = period.key === activePeriodKey;
              return (
                <li key={period.key}>
                  <button
                    type="button"
                    onClick={() => scrollToPeriod(period.key)}
                    className={cn(
                      'flex w-full items-start gap-3 text-left text-sm transition-colors',
                      active ? 'text-primary' : 'text-atg-muted hover:text-atg-fg',
                    )}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                        active ? 'bg-primary' : 'bg-atg-border',
                      )}
                      aria-hidden
                    />
                    <span>
                      <span className="block font-semibold leading-snug">{period.periodLabel}</span>
                      <span className="mt-0.5 block leading-snug">{period.periodTitle}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <nav
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
        aria-label={sidebarAria}
      >
        {periods.map((period) => {
          const active = period.key === activePeriodKey;
          return (
            <button
              key={period.key}
              type="button"
              onClick={() => scrollToPeriod(period.key)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-left text-xs font-medium transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'border border-atg-border bg-atg-elevated text-atg-muted',
              )}
              aria-current={active ? 'true' : undefined}
            >
              <span className="block">{period.periodLabel}</span>
              <span className="block opacity-80">{period.periodTitle}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative min-w-0 flex-1">
        <div
          className="pointer-events-none absolute bottom-0 left-7 top-0 hidden w-px bg-atg-border sm:left-8 lg:block"
          aria-hidden
        />

        <div className="space-y-0">
          {periods.map((period, periodIndex) => (
            <section
              key={period.key}
              ref={(node) => {
                if (node) periodRefs.current.set(period.key, node);
                else periodRefs.current.delete(period.key);
              }}
              data-period-key={period.key}
              className="scroll-mt-28"
            >
              {period.milestones.map((milestone, milestoneIndex) => {
                const isLast =
                  periodIndex === periods.length - 1 &&
                  milestoneIndex === period.milestones.length - 1;

                return (
                  <div
                    key={milestone.id}
                    className={cn('relative flex gap-5 pb-12 sm:gap-8', isLast && 'pb-0')}
                  >
                    <div className="relative hidden w-16 shrink-0 lg:block xl:w-[4.5rem]">
                      <div className="absolute left-1/2 top-0 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-2 border-atg-border bg-white text-sm font-semibold text-atg-muted shadow-sm dark:bg-atg-elevated">
                        {milestone.year}
                      </div>
                    </div>

                    <article className="min-w-0 flex-1 overflow-hidden rounded-xl border border-atg-border/70 bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-atg-elevated">
                      <div className="flex items-center gap-3 border-b border-atg-border/60 px-4 py-3 lg:hidden">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-atg-border bg-atg-surface text-sm font-semibold text-atg-muted">
                          {milestone.year}
                        </span>
                        <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                          {period.periodLabel}
                        </p>
                      </div>

                      {milestone.imageUrl ? (
                        <div className="relative aspect-[16/10] w-full bg-atg-surface">
                          <Image
                            src={milestone.imageUrl}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 640px"
                          />
                        </div>
                      ) : null}

                      <div className="p-5 sm:p-6">
                        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">{milestone.title}</h3>
                        {milestone.excerpt ? (
                          <p className="mt-3 text-sm leading-relaxed text-atg-muted sm:text-base">
                            {milestone.excerpt}
                          </p>
                        ) : null}
                        {milestone.linkUrl ? (
                          <Link
                            href={milestone.linkUrl}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover hover:underline"
                          >
                            {readMoreLabel}
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
