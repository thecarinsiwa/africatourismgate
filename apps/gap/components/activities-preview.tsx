import Image from 'next/image';
import Link from 'next/link';
import type { PublicGapActivity } from '@africatourismgate/types';
import { getTranslations } from 'next-intl/server';
import { resolveGapMediaUrl } from '@/lib/api/public-gap';
import { GapActivityIcon } from './gap-activity-icon';

type ActivitiesPreviewProps = {
  activities: PublicGapActivity[];
  compact?: boolean;
};

export async function ActivitiesPreview({
  activities,
  compact = false,
}: ActivitiesPreviewProps) {
  const tHome = await getTranslations('home');
  const tNav = await getTranslations('nav');

  if (activities.length === 0) {
    return null;
  }

  const items = compact ? activities.slice(0, 3) : activities;

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-atg-fg">
              {compact ? tHome('activitiesTitle') : (await getTranslations('activities'))('title')}
            </h2>
            <p className="mt-3 text-atg-muted">
              {compact
                ? tHome('activitiesSubtitle')
                : (await getTranslations('activities'))('subtitle')}
            </p>
          </div>
          {compact ? (
            <Link
              href="/activities"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {tHome('exploreActivities')} →
            </Link>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((activity) => {
            const imageUrl = resolveGapMediaUrl(activity.imageUrl);
            return (
              <article
                key={activity.id}
                className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-sm"
              >
                {imageUrl ? (
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : null}
                <div className="space-y-3 p-5">
                  <GapActivityIcon iconKey={activity.iconKey} />
                  <h3 className="text-lg font-semibold text-atg-fg">{activity.title}</h3>
                  <div
                    className="prose prose-sm max-w-none text-atg-muted dark:prose-invert prose-p:my-1 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activity.description }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        {!compact ? (
          <p className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              ← {tNav('home')}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
