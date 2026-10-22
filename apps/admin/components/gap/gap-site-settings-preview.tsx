'use client';

import { DataTableBadge, cn } from '@africatourismgate/ui';
import type { GapStatus } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

export type GapSiteSettingsPreviewProps = {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  status: GapStatus;
  className?: string;
};

export function GapSiteSettingsPreview({
  title,
  subtitle,
  heroImageUrl,
  heroImageAlt,
  status,
  className,
}: GapSiteSettingsPreviewProps) {
  const t = useTranslations('modules.gap.siteSettings.preview');
  const tStatus = useTranslations('modules.about.status');

  const displayTitle = title.trim() || t('defaultTitle');
  const displaySubtitle = subtitle.trim();
  const coverUrl = heroImageUrl.trim() || null;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-atg-border shadow-sm',
        className,
      )}
      aria-label={t('ariaLabel', { title: displayTitle })}
    >
      <div className="relative min-h-[14rem] bg-gradient-to-br from-[#1a3a2a] via-[#234d38] to-primary/70 px-5 py-6 sm:min-h-[16rem] sm:px-6 sm:py-8">
        {coverUrl ? (
          <Image
            src={resolveMediaUrl(coverUrl)}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 22rem"
            aria-hidden
          />
        ) : null}
        <div
          className={cn(
            'absolute inset-0',
            coverUrl
              ? 'bg-gradient-to-t from-black/75 via-black/45 to-black/20'
              : 'bg-gradient-to-t from-black/35 via-transparent to-black/10',
          )}
        />

        <div className="relative z-10 flex h-full min-h-[12rem] flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70 sm:text-xs">
              {t('badge')}
            </p>
            <DataTableBadge
              variant={status === 'published' ? 'success' : 'muted'}
              className={cn(
                'shrink-0 ring-white/20',
                status === 'published'
                  ? 'bg-emerald-500/20 text-white'
                  : 'bg-white/10 text-white/80',
              )}
            >
              {status === 'published' ? tStatus('published') : tStatus('draft')}
            </DataTableBadge>
          </div>

          <div className="space-y-2">
            <h2 className="break-words text-xl font-bold leading-snug text-white sm:text-2xl">
              {displayTitle}
            </h2>
            {displaySubtitle ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-white/85">
                {displaySubtitle}
              </p>
            ) : (
              <p className="text-sm italic text-white/50">{t('emptySubtitle')}</p>
            )}
            {coverUrl && heroImageAlt.trim() ? (
              <p className="truncate text-[11px] text-white/55" title={heroImageAlt.trim()}>
                {t('altLabel', { alt: heroImageAlt.trim() })}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
