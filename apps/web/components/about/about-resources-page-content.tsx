'use client';

import type { AboutResourceType } from '@africatourismgate/types';
import type { PublicAboutResource } from '@africatourismgate/types';
import { useEffect, useState } from 'react';
import { browseAboutResourcesForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';

type AboutResourcesPageContentProps = {
  type: AboutResourceType;
};

function resourceHref(resource: PublicAboutResource): string | null {
  return resource.fileUrl ?? resource.externalUrl ?? null;
}

export function AboutResourcesPageContent({ type }: AboutResourcesPageContentProps) {
  const locale = useAppLocale();
  const t = useTranslations();
  const a = t.about;

  const [resources, setResources] = useState<PublicAboutResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [localeFallback, setLocaleFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    void browseAboutResourcesForLocale(locale, { type, limit: 50 })
      .then(({ response, usedLocaleFallback }) => {
        if (!cancelled) {
          setResources(response.data);
          setLocaleFallback(usedLocaleFallback);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResources([]);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, type]);

  if (loading) {
    return <p className="text-sm text-atg-muted">{a.loading}</p>;
  }

  if (loadError) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center dark:border-red-900/40 dark:bg-red-950/30"
        role="alert"
      >
        <p className="text-sm text-red-800 dark:text-red-200">{a.loadError}</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
        <p className="text-sm text-atg-muted">{a.resources.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localeFallback ? (
        <p className="rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {a.localeFallback}
        </p>
      ) : null}

      <ul className="divide-y divide-atg-border rounded-xl border border-atg-border bg-atg-elevated/30">
        {resources.map((resource) => {
          const href = resourceHref(resource);
          const isExternal = Boolean(resource.externalUrl && href === resource.externalUrl);

          return (
            <li key={resource.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-atg-fg">{resource.title}</h2>
                {resource.description ? (
                  <p className="mt-1 text-sm text-atg-muted">{resource.description}</p>
                ) : null}
                {resource.publishedAt ? (
                  <p className="mt-2 text-xs text-atg-muted">
                    {a.resources.publishedOn}{' '}
                    <time dateTime={resource.publishedAt}>
                      {formatRelativeReviewDate(resource.publishedAt, locale)}
                    </time>
                  </p>
                ) : null}
              </div>
              {href ? (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  download={resource.fileUrl ? true : undefined}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  {resource.fileUrl ? a.resources.download : a.resources.openLink}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
